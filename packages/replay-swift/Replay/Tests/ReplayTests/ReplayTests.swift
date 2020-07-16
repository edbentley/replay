import XCTest
@testable import Replay

final class ReplayTests: XCTestCase {
    var view: ReplayView!
    var audioPlayer: MockAudioPlayer!
    var alerter: MockAlerter!
    var logger: MockLogger!
    var storageProvider: MockStorage!

    let width = 500
    let height = 300

    let oneFrame: Double = 1 / 60 + 0.001

//    let gameJSPath = Bundle(for: ReplayTests.self).path(forResource: "game", ofType: "js")!

    override func setUp() {
        let session = NetworkSessionMock(responses: [
            .GET: ["/test": ["x": 20]],
            .POST: ["/test": ["x": 21]],
            .PUT: ["/test": ["x": 22]],
            .DELETE: ["/test": ["x": 23]],
            ])

        audioPlayer = MockAudioPlayer()
        logger = MockLogger()
        storageProvider = MockStorage()
        alerter = MockAlerter()

        view = ReplayView(
            frame: CGRect(x: 0, y: 0, width: width, height: height),
            nativeSpriteMap: ["NativeSprite": MockNativeSprite()],
            gameJsString: gameJsString,
            mockSession: session,
            mockRandom: 0.2,
            mockDateNow: Date(timeIntervalSinceReferenceDate: 15),
            mockAudioPlayer: audioPlayer,
            mockLogger: logger.getLogger(),
            mockStorage: storageProvider,
            mockAlerter: alerter
        )
    }

    override func tearDown() {
        view = nil
    }

    func testDevice() {
        var getDevice = view.getGetDevice()
        var pointer = getDevice(mockGetLocalCoords()).inputs.pointer
        XCTAssertEqual(pointer.pressed, false)
        XCTAssertEqual(pointer.justPressed, false)
        XCTAssertEqual(pointer.justReleased, false)

        view.touchDown(atPoint: CGPoint(x: width / 2 + 10, y: height / 2 + 20))

        getDevice = view.getGetDevice()
        pointer = getDevice(mockGetLocalCoords()).inputs.pointer
        XCTAssertEqual(pointer.pressed, true)
        XCTAssertEqual(pointer.justPressed, true)
        XCTAssertEqual(pointer.justReleased, false)
        XCTAssertEqual(pointer.x, 10)
        XCTAssertEqual(pointer.y, -20)

        view.loop(currentTime: oneFrame * 1)

        getDevice = view.getGetDevice()
        pointer = getDevice(mockGetLocalCoords()).inputs.pointer
        XCTAssertEqual(pointer.pressed, true)
        XCTAssertEqual(pointer.justPressed, false)
        XCTAssertEqual(pointer.justReleased, false)
        XCTAssertEqual(pointer.x, 10)
        XCTAssertEqual(pointer.y, -20)

        view.touchUp(atPoint: CGPoint(x: width / 2 + 20, y: height / 2 + 30))

        getDevice = view.getGetDevice()
        pointer = getDevice(mockGetLocalCoords()).inputs.pointer
        XCTAssertEqual(pointer.pressed, false)
        XCTAssertEqual(pointer.justPressed, false)
        XCTAssertEqual(pointer.justReleased, true)
        XCTAssertEqual(pointer.x, 20)
        XCTAssertEqual(pointer.y, -30)

        view.loop(currentTime: oneFrame * 2)

        getDevice = view.getGetDevice()
        pointer = getDevice(mockGetLocalCoords()).inputs.pointer
        XCTAssertEqual(pointer.justReleased, false)


        // -- Test different sprite position / rotation

        view.touchDown(atPoint: CGPoint(x: width / 2, y: height / 2))

        getDevice = view.getGetDevice()
        pointer = getDevice(mockGetLocalCoords()).inputs.pointer
        XCTAssertEqual(pointer.x, 0)
        XCTAssertEqual(pointer.y, 0)

        getDevice = view.getGetDevice()
        pointer = getDevice(mockGetLocalCoords(subtractX: "10", subtractY: "20")).inputs.pointer
        XCTAssertEqual(pointer.x, -10)
        XCTAssertEqual(pointer.y, -20)
    }

    func testRender() {
        XCTAssertEqual(view.spriteTextures.textures.count, 2) // text & player
        XCTAssertEqual(getProps(view.spriteTextures.textures[1]).x, CGFloat(100)) // player

        view.loop(currentTime: oneFrame * 1)

        XCTAssertEqual(getProps(view.spriteTextures.textures[1]).x, CGFloat(100))

        view.touchDown(atPoint: CGPoint(x: 100 + width / 2, y: 10))
        view.loop(currentTime: oneFrame * 2)
        view.touchUp(atPoint: CGPoint(x: 20, y: 20))

        XCTAssertEqual(view.spriteTextures.textures.count, 2)
        XCTAssertEqual(getProps(view.spriteTextures.textures[1]).x, CGFloat(101))

        let promise = expectation(description: "Enemy spawns 50 ms after tap")

        DispatchQueue.main.asyncAfter(deadline: .now() + DispatchTimeInterval.milliseconds(50)) {
            self.view.loop(currentTime: self.oneFrame * 3)
            self.view.loop(currentTime: self.oneFrame * 4)
            XCTAssertEqual(self.view.spriteTextures.textures.count, 3)
            XCTAssertEqual(getProps(self.view.spriteTextures.textures[2]).x, CGFloat(100))
            promise.fulfill()
        }

        waitForExpectations(timeout: 1, handler: nil)
    }

    func testSize() {
        // In this test we set up a bunch of devices with different sizes, and expect our game
        // to resize the view in a way that optimises to the margins set, but keeps the same
        // aspect ratio.

        // Note game width: 500, max width margin: 50
        //      game height: 300, max height margin: 50

        // match game size
        view = ReplayView(
            frame: CGRect(x: 0, y: 0, width: 500, height: 300),
            nativeSpriteMap: ["NativeSprite": MockNativeSprite()],
            gameJsString: gameJsString
        )
        XCTAssertEqual(
            view.gameViewSize,
            GameViewSize(
                gameSize: CGSize(width: 500, height: 300),
                offset: CGPoint(x: 0, y: 0),
                scale: 1
            )
        )

        // keep game size but scale
        view = ReplayView(
            frame: CGRect(x: 0, y: 0, width: 1000, height: 600),
            nativeSpriteMap: ["NativeSprite": MockNativeSprite()],
            gameJsString: gameJsString
        )
        XCTAssertEqual(
            view.gameViewSize,
            GameViewSize(
                gameSize: CGSize(width: 500, height: 300),
                offset: CGPoint(x: 250, y: 150),
                scale: 2
            )
        )

        // device somewhere in middle of min and max
        view = ReplayView(
            frame: CGRect(x: 0, y: 0, width: 560, height: 350),
            nativeSpriteMap: ["NativeSprite": MockNativeSprite()],
            gameJsString: gameJsString
        )
        XCTAssertEqual(
            view.gameViewSize,
            GameViewSize(
                gameSize: CGSize(width: 500, height: 312.5),
                offset: CGPoint(x: 30, y: 18.75),
                scale: 1.12
            )
        )

        // over max width margin
        view = ReplayView(
            frame: CGRect(x: 0, y: 0, width: 700, height: 300),
            nativeSpriteMap: ["NativeSprite": MockNativeSprite()],
            gameJsString: gameJsString
        )
        XCTAssertEqual(
            view.gameViewSize,
            GameViewSize(
                gameSize: CGSize(width: 600, height: 300),
                offset: CGPoint(x: 50, y: 0),
                scale: 1
            )
        )

        // over max height margin
        view = ReplayView(
            frame: CGRect(x: 0, y: 0, width: 500, height: 500),
            nativeSpriteMap: ["NativeSprite": MockNativeSprite()],
            gameJsString: gameJsString
        )
        XCTAssertEqual(
            view.gameViewSize,
            GameViewSize(
                gameSize: CGSize(width: 500, height: 400),
                offset: CGPoint(x: 0, y: 50),
                scale: 1
            )
        )

        // within max height margin
        view = ReplayView(
            frame: CGRect(x: 0, y: 0, width: 400, height: 300),
            nativeSpriteMap: ["NativeSprite": MockNativeSprite()],
            gameJsString: gameJsString
        )
        XCTAssertEqual(
            view.gameViewSize,
            GameViewSize(
                gameSize: CGSize(width: 500, height: 375),
                offset: CGPoint(x: -50, y: -37.5),
                scale: 0.8
            )
        )

        // within max width margin
        view = ReplayView(
            frame: CGRect(x: 0, y: 0, width: 500, height: 290),
            nativeSpriteMap: ["NativeSprite": MockNativeSprite()],
            gameJsString: gameJsString
        )
        XCTAssertEqual(
            view.gameViewSize,
            GameViewSize(
                gameSize: CGSize(width: 517.2413793103448, height: 300),
                offset: CGPoint(x: -8.620689655172384, y: -5),
                scale: 290 / 300
            )
        )

        // width and height over max margins, but device is wider
        view = ReplayView(
            frame: CGRect(x: 0, y: 0, width: 1000, height: 500),
            nativeSpriteMap: ["NativeSprite": MockNativeSprite()],
            gameJsString: gameJsString
        )
        XCTAssertEqual(
            view.gameViewSize,
            GameViewSize(
                gameSize: CGSize(width: 600, height: 300),
                offset: CGPoint(x: 200, y: 100),
                scale: 5/3
            )
        )

        // width and height over max margins, but device is thinner
        view = ReplayView(
            frame: CGRect(x: 0, y: 0, width: 700, height: 1000),
            nativeSpriteMap: ["NativeSprite": MockNativeSprite()],
            gameJsString: gameJsString
        )
        XCTAssertEqual(
            view.gameViewSize,
            GameViewSize(
                gameSize: CGSize(width: 500, height: 400),
                offset: CGPoint(x: 100, y: 300),
                scale: 1.4
            )
        )
    }

    func testRandom() {
        view.touchDown(atPoint: CGPoint(x: width / 2 + 101, y: 0))
        view.loop(currentTime: oneFrame * 1)
        view.loop(currentTime: oneFrame * 2)

        // New enemy at random position mocked to 200
        XCTAssertEqual(view.spriteTextures.textures.count, 3)
        XCTAssertEqual(getProps(view.spriteTextures.textures[2]).x, CGFloat( 200))
    }

    func testNetwork() {
        view.touchDown(atPoint: CGPoint(x: width / 2 + 102, y: 0))
        view.loop(currentTime: oneFrame * 1)
        view.loop(currentTime: oneFrame * 2)

        // New enemies spawn at network response x value
        XCTAssertEqual(view.spriteTextures.textures.count, 6)
        XCTAssertEqual(getProps(view.spriteTextures.textures[2]).x, CGFloat( 20))
        XCTAssertEqual(getProps(view.spriteTextures.textures[3]).x, CGFloat( 21))
        XCTAssertEqual(getProps(view.spriteTextures.textures[4]).x, CGFloat( 22))
        XCTAssertEqual(getProps(view.spriteTextures.textures[5]).x, CGFloat( 23))
    }

    func testDate() {
        view.touchDown(atPoint: CGPoint(x: width / 2 + 103, y: 0))
        view.loop(currentTime: oneFrame * 1)
        view.loop(currentTime: oneFrame * 2)

        // New enemy spawns at current seconds count
        XCTAssertEqual(view.spriteTextures.textures.count, 3)
        XCTAssertEqual(getProps(view.spriteTextures.textures[2]).x, CGFloat( 15))
    }

    // This only tests the calls from replay-core, not the audio code in replay-ios itself
    func testAudio() {
        view.touchDown(atPoint: CGPoint(x: width / 2 + 104, y: 0))
        view.loop(currentTime: oneFrame * 1)

        XCTAssertEqual(audioPlayer.lastPlayCall.filename, "sound.wav")
        XCTAssertEqual(audioPlayer.lastPlayCall.position, nil)
        XCTAssertEqual(audioPlayer.lastPlayCall.loop, false)

        view.touchDown(atPoint: CGPoint(x: width / 2 + 105, y: 0))
        view.loop(currentTime: oneFrame * 2)

        XCTAssertEqual(audioPlayer.lastPlayCall.filename, "sound.wav")
        XCTAssertEqual(audioPlayer.lastPlayCall.position, 20)
        XCTAssertEqual(audioPlayer.lastPlayCall.loop, false)

        view.touchDown(atPoint: CGPoint(x: width / 2 + 106, y: 0))
        view.loop(currentTime: oneFrame * 3)

        XCTAssertEqual(audioPlayer.lastPlayCall.filename, "sound.wav")
        XCTAssertEqual(audioPlayer.lastPlayCall.position, 0)
        XCTAssertEqual(audioPlayer.lastPlayCall.loop, true)

        view.touchDown(atPoint: CGPoint(x: width / 2 + 107, y: 0))
        view.loop(currentTime: oneFrame * 4)

        XCTAssertEqual(audioPlayer.lastPauseCallFilename, "sound.wav")

        view.touchDown(atPoint: CGPoint(x: width / 2 + 108, y: 0))
        view.loop(currentTime: oneFrame * 5)
        view.loop(currentTime: oneFrame * 6)

        // New enemy at value of getPosition
        XCTAssertEqual(view.spriteTextures.textures.count, 3)
        XCTAssertEqual(getProps(view.spriteTextures.textures[2]).x, CGFloat( 35))
    }

    func testLog() {
        view.touchDown(atPoint: CGPoint(x: width / 2 + 109, y: 0))
        view.loop(currentTime: oneFrame * 1)

        XCTAssertEqual(logger.lastLogged, "Hello Replay!")
    }

    // This only tests the calls from replay-core, not the storage code in replay-ios itself
    func testStorage() {
        view.touchDown(atPoint: CGPoint(x: width / 2 + 110, y: 0))
        view.loop(currentTime: oneFrame * 1)

        XCTAssertEqual(logger.lastLogged, "undefined")
        XCTAssertEqual(storageProvider.store, [:])

        view.touchDown(atPoint: CGPoint(x: width / 2 + 111, y: 0))
        view.loop(currentTime: oneFrame * 2)

        XCTAssertEqual(storageProvider.store, ["testKey": Optional("testValue")])

        view.touchDown(atPoint: CGPoint(x: width / 2 + 110, y: 0))
        view.loop(currentTime: oneFrame * 3)

        XCTAssertEqual(logger.lastLogged, "testValue")
    }
    
    func testAlert() {
        view.touchDown(atPoint: CGPoint(x: width / 2 + 112, y: 0))
        view.loop(currentTime: oneFrame * 1)

        XCTAssertEqual(alerter.lastMessage, "Ok?")
        XCTAssertEqual(logger.lastLogged, "It's ok")

        view.touchDown(atPoint: CGPoint(x: width / 2 + 113, y: 0))
        view.loop(currentTime: oneFrame * 2)

        XCTAssertEqual(alerter.lastMessage, "Ok or cancel?")
        XCTAssertEqual(logger.lastLogged, "Was ok: true")
        
        alerter.shouldOk = false
        
        view.touchDown(atPoint: CGPoint(x: width / 2 + 113, y: 0))
        view.loop(currentTime: oneFrame * 3)

        XCTAssertEqual(logger.lastLogged, "Was ok: false")
    }

    func testNativeSprite() {
        XCTAssertTrue(mockNativeSpriteStates.contains("create Game"))

        view.loop(currentTime: oneFrame * 1)
        XCTAssertTrue(mockNativeSpriteStates.contains("loop Hello Game"))

        view.touchDown(atPoint: CGPoint(x: width / 2, y: height / 2))
        view.loop(currentTime: oneFrame * 2)

        XCTAssertTrue(mockNativeSpriteStates.contains("cleanup Game"))
    }
}
