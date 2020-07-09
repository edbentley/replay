import UIKit

// Allow access to view from Native Sprites
public var replayViewGlobal: ReplayView?

public class ReplayViewController: UIViewController {
    var hideStatusBar: Bool
    var nativeSpriteMap: ReplayNativeSpriteMap
    
    public init(nativeSpriteMap: ReplayNativeSpriteMap? = nil, hideStatusBar: Bool? = nil) {
        self.hideStatusBar = hideStatusBar ?? true
        self.nativeSpriteMap = nativeSpriteMap ?? [:]
        super.init(nibName: nil, bundle: nil)
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override public func viewDidLoad() {
        super.viewDidLoad()
        self.view = TopView(frame: UIScreen.main.bounds, nativeSpriteMap: nativeSpriteMap)
    }
    
    public override var prefersStatusBarHidden: Bool {
        return hideStatusBar
    }
    
    public override func viewDidAppear(_ animated: Bool) {
        // Allow touches at the edge of the screen
        // Unfortunately causes a warning
        let window = self.view.window!
        if let grs = window.gestureRecognizers {
            for gr in grs {
                gr.delaysTouchesBegan = false
            }
        }
    }
}

class TopView: UIView {
    init(frame: CGRect, nativeSpriteMap: ReplayNativeSpriteMap) {
        super.init(frame: frame)
        let view = ReplayView(frame: frame, nativeSpriteMap: nativeSpriteMap)
        
        replayViewGlobal = view
        
        // center view
        view.transform = CGAffineTransform(translationX: view.gameViewSize.offset.x, y: view.gameViewSize.offset.y)
            // scale to device
            .concatenating(CGAffineTransform(scaleX: view.gameViewSize.scale, y: view.gameViewSize.scale))
        
        self.addSubview(view)
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
}
