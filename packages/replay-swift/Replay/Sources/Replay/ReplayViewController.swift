import UIKit

public class ReplayViewController: UIViewController {
    var hideStatusBar: Bool
    public var webView: ReplayWebView
    
    public init(hideStatusBar: Bool = true, useLocalHost: Bool = false) {
        self.hideStatusBar = hideStatusBar
        self.webView = ReplayWebViewManager(useLocalHost: useLocalHost).webView
        super.init(nibName: nil, bundle: nil)
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
