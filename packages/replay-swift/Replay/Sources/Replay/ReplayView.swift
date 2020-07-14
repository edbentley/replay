import UIKit

public class ReplayView: UIView, ReplayPlatform {
    var touchDown = false
    var touchJustDown = false
    var touchJustReleased = false
    var touchPos = CGPoint(x: 0, y: 0)
    
    var session: ReplayNetworkSession
    var dateGenerator: ReplayDateGenerator
    var randomNumberGenerator: ReplayRandomNumberGenerator
    var audioPlayer: ReplayAudioPlayer
    var logger: ReplayLogger
    var storageProvider: ReplayStorageProvider
    
    var deviceSize: DeviceSize!
    var gameViewSize: GameViewSize!
    var defaultFont: TextureFont?
    var spriteTextures: ReplaySpriteTextures!
    var getNextFrameTextures: ((Double) -> ReplaySpriteTextures)!
    var initTime: CFTimeInterval?
    
    public init(
        frame: CGRect,
        nativeSpriteMap: ReplayNativeSpriteMap? = nil,
        gameJsString: String? = nil,
        mockSession: ReplayNetworkSession? = nil,
        mockRandom: Double? = nil,
        mockDateNow: Date? = nil,
        mockAudioPlayer: ReplayAudioPlayer? = nil,
        mockLogger: ReplayLogger? = nil,
        mockStorage: ReplayStorageProvider? = nil
    ) {
        self.session = mockSession ?? URLSession.shared
        self.dateGenerator = ReplayDateGenerator(mockDateNow: mockDateNow)
        self.randomNumberGenerator = ReplayRandomNumberGenerator(mockRandom: mockRandom)
        self.audioPlayer = mockAudioPlayer ?? AudioPlayer()
        self.logger = mockLogger ?? { message in
            print(message)
        }
        self.storageProvider = mockStorage ?? StorageProvider()
        
        super.init(frame: frame)
        
        self.audioPlayer.setup()
        
        self.backgroundColor = UIColor.white
        
        let (gameSize, defaultFont, replayJsRuntime) = ReplayJS.getGameProps(customGameJsString: gameJsString)
        
        self.defaultFont = defaultFont
        
        // Calculate bounds
        let viewWidthHeightRatio = frame.width / frame.height
        let orientationSize = viewWidthHeightRatio > 1 ? gameSize.landscape : gameSize.portrait
        let (calcDeviceSize, gameViewSize) = SizeUtils.calculateDeviceSize(frame: frame, gameSize: orientationSize)
        self.deviceSize = calcDeviceSize
        self.gameViewSize = gameViewSize
        self.frame = CGRect(x: 0, y: 0, width: gameViewSize.gameSize.width, height: gameViewSize.gameSize.height)
        
        // Get textures
        let (initTextures, getNextFrameTextures) = ReplayJS.getTextures(
            platform: self,
            replayJsRuntime: replayJsRuntime,
            deviceSize: deviceSize,
            nativeSpriteMap: nativeSpriteMap ?? [:]
        )
        self.getNextFrameTextures = getNextFrameTextures
        self.spriteTextures = initTextures
        
        // Setup game loop (except when mocking in tests)
        if mockStorage == nil {
            let displaylink = CADisplayLink(target: self,
                                            selector: #selector(displaylinkLoop))
            
            displaylink.add(to: .current,
                            forMode: .default)
            
            displaylink.preferredFramesPerSecond = 60
        }
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    @objc func displaylinkLoop(displayLink: CADisplayLink) {
        loop(currentTime: displayLink.timestamp)
    }
}

// --- Game loop
extension ReplayView {
    func loop(currentTime: CFTimeInterval) {
        if initTime == nil {
            initTime = currentTime - 1 / 60
        }
        
        spriteTextures = getNextFrameTextures((currentTime - initTime!) * 1000)
        
        resetInputs()
        
        // Calls the draw method on the next frame
        setNeedsDisplay()
    }
}

// --- Touch Events
extension ReplayView {
    public override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        for t in touches { self.touchDown(atPoint: t.location(in: self)) }
    }
    
    public override func touchesMoved(_ touches: Set<UITouch>, with event: UIEvent?) {
        for t in touches { self.touchMoved(toPoint: t.location(in: self)) }
    }
    
    public override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent?) {
        for t in touches { self.touchUp(atPoint: t.location(in: self)) }
    }
    
    public override func touchesCancelled(_ touches: Set<UITouch>, with event: UIEvent?) {
        for t in touches { self.touchUp(atPoint: t.location(in: self)) }
    }
    
    public func touchDown(atPoint pos : CGPoint) {
        touchJustDown = true
        touchDown = true
        touchPos = pos
    }
    
    public func touchMoved(toPoint pos : CGPoint) {
        touchPos = pos
    }
    
    public func touchUp(atPoint pos : CGPoint) {
        touchJustDown = false
        touchDown = false
        touchJustReleased = true
        touchPos = pos
    }
    
    func resetInputs() {
        touchJustDown = false
        touchJustReleased = false
    }
}

// --- ReplayPlatform
extension ReplayView {
    func getGetDevice() -> (GetLocalCoords) -> iOSDevice {
        let pointer = Pointer(
            pressed: touchDown,
            justPressed: touchJustDown,
            justReleased: touchJustReleased,
            x: cgFloatToNsNumber(SizeUtils.deviceXToGameX(x: touchPos.x, deviceSize: deviceSize)),
            y: cgFloatToNsNumber(SizeUtils.deviceYToGameY(y: touchPos.y, deviceSize: deviceSize))
        )
        return { getLocalCoords in
            iOSDevice(
                inputs: Inputs(pointer: pointer, getLocalCoords: getLocalCoords),
                size: self.deviceSize,
                session: self.session,
                randomGenerator: self.randomNumberGenerator,
                dateGenerator: self.dateGenerator,
                audioPlayer: self.audioPlayer,
                logger: self.logger,
                storageProvider: self.storageProvider
            )
        }
    }
}

// -- Rendering
extension ReplayView {
    public override func draw(_ rect: CGRect) {
        guard let context = UIGraphicsGetCurrentContext() else { return }
        
        drawSpriteTextures(context: context, currSpriteTexures: spriteTextures)
    }
    
    func drawSpriteTextures(context: CGContext, currSpriteTexures: ReplaySpriteTextures) {
        let baseProps = currSpriteTexures.baseProps
        let textures = currSpriteTexures.textures
        
        context.saveGState()
        
        Draw.transformContext(context: context, baseProps: baseProps)
        
        for textureOrSpriteTexures in textures {
            switch textureOrSpriteTexures {
            case .spriteTextures(let childSpriteTextures):
                drawSpriteTextures(context: context, currSpriteTexures: childSpriteTextures)
                
            case .texture(let texture):
                switch texture {
                case .rectangle(let textureBaseProps, let rectProps):
                    Draw.rectangle(
                        context: context,
                        baseProps: textureBaseProps,
                        rectProps: rectProps,
                        parentOpacity: baseProps.opacity
                    )
                case .line(let textureBaseProps, let lineProps):
                    Draw.line(
                        context: context,
                        baseProps: textureBaseProps,
                        lineProps: lineProps,
                        parentOpacity: baseProps.opacity
                    )
                case .text(let textureBaseProps, let textProps):
                    Draw.text(
                        context: context,
                        baseProps: textureBaseProps,
                        textProps: textProps,
                        defaultFont: defaultFont,
                        parentOpacity: baseProps.opacity
                    )
                case .circle(let textureBaseProps, let circleProps):
                    Draw.circle(
                        context: context,
                        baseProps: textureBaseProps,
                        circleProps: circleProps,
                        parentOpacity: baseProps.opacity
                    )
                case .image(let textureBaseProps, let imageProps):
                    Draw.image(
                        context: context,
                        baseProps: textureBaseProps,
                        imageProps: imageProps,
                        parentOpacity: baseProps.opacity
                    )
                case .spriteSheet(let textureBaseProps, let spriteSheetProps):
                    Draw.spriteSheet(
                        context: context,
                        baseProps: textureBaseProps,
                        spriteSheetProps: spriteSheetProps,
                        parentOpacity: baseProps.opacity
                    )
                }
            }
        }
        
        context.restoreGState()
    }
}
