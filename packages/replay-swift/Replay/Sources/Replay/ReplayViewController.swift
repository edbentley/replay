import UIKit

public class ReplayViewController: UIViewController {
    var hideStatusBar: Bool
    public var webView: ReplayWebView
    
    public init(
        hideStatusBar: Bool = true,
        onJsCallback: @escaping (String) -> Void = {_ in }
    ) {
        self.hideStatusBar = hideStatusBar
        self.webView = ReplayWebViewManager(onJsCallback: onJsCallback).webView
        super.init(nibName: nil, bundle: nil)
    }
    
    public func jsBridge(messageId: String, jsArg: String) {
        self.webView.jsBridge(messageId: messageId, jsArg: jsArg)
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override public func viewDidLoad() {
        super.viewDidLoad()
        
        self.view = webView
    }
    
    public override var prefersStatusBarHidden: Bool {
        return hideStatusBar
    }
    
    // Grey out home bar
    public override var preferredScreenEdgesDeferringSystemGestures: UIRectEdge {
        return [.bottom]
    }
    
    public override func viewDidAppear(_ animated: Bool) {
        // Allow touches at the edge of the screen
        // Unfortunately causes a warning
        let window = self.view.window!
        if let gestureRecognizers = window.gestureRecognizers {
            for gestureRecognizer in gestureRecognizers {
                gestureRecognizer.delaysTouchesBegan = false
            }
        }
    }
    
    public override func didReceiveMemoryWarning() {
        print("Warning: Your game is using a high amount of memory")
    }
}
