import WebKit

let CONSOLE_LOG = "consoleLog"
let DID_LOAD = "didLoad"
let ERROR = "error"

public class ReplayWebView: WKWebView {
    public override var safeAreaInsets: UIEdgeInsets {
        return UIEdgeInsets(top: 0, left: 0, bottom: 0, right: 0)
    }
}

class ReplayWebViewManager: NSObject, WKScriptMessageHandler, WKUIDelegate {
    let webConfiguration = WKWebViewConfiguration()
    var webView: ReplayWebView!
    let alerter = Alerter()
    let onLoadCallback: () -> Void
    let onLogCallback: (String) -> Void // for testing
    
    init(
        // See full JS errors, but won't load image / audio assets (for debugging)
        useLocalHost: Bool = false,
        customGameJsString: String? = nil,
        onLoadCallback: @escaping () -> Void = {},
        onLogCallback: @escaping (String) -> Void = {_ in }
    ) {
        self.onLoadCallback = onLoadCallback
        self.onLogCallback = onLogCallback
        super.init()
        
        let contentController = WKUserContentController()
        contentController.add(self, name: CONSOLE_LOG)
        contentController.add(self, name: DID_LOAD)
        contentController.add(self, name: ERROR)
        webConfiguration.userContentController = contentController
        webConfiguration.mediaTypesRequiringUserActionForPlayback = []
        
        // Allow fetching local files in JS. This is not documented, but Stack Overflow says it's ok
        // https://stackoverflow.com/questions/36013645/setting-disable-web-security-and-allow-file-access-from-files-in-ios-wkwebvi
        webConfiguration.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs");
        
        webView = ReplayWebView(frame: .zero, configuration: webConfiguration)
        webView.scrollView.isScrollEnabled = false
        webView.isMultipleTouchEnabled = true
        webView.uiDelegate = self
        
        // Load in game
        var gameJsString = ""
        
        if let customGameJsString = customGameJsString {
            gameJsString = customGameJsString
        } else {
            guard let gameJsPath = Bundle.main.path(forResource: "game", ofType: "js") else {
                fatalError("Couldn't load game.js file in Bundle")
            }
            guard let gameJsPathString = try? String(
                contentsOfFile: gameJsPath,
                encoding: String.Encoding.utf8
                ) else {
                    fatalError("Couldn't read JS file at path \(gameJsPath)")
            }
            gameJsString = gameJsPathString
        }
        
        // don't try to load assets and wrap in try/catch
        if useLocalHost {
            gameJsString = """
            try {
                \(gameJsString)
                game.options.assets = {};
            } catch (e) {
                window.webkit.messageHandlers.error.postMessage(e.message || e);
            }
            """
        }
        
        webView.evaluateJavaScript(gameJsString) { (_, error) in
            if let error = error {
                // Hi 👋! You can temporarily set useLocalHost in ReplayViewController to true to read this error message - but your game will not be able to load any audio or image assets.
                fatalError("\(error)")
            }
            
            self.webView.loadHTMLString(
                replayRenderCanvasHtmlString,
                baseURL: useLocalHost ? URL(string: "http://localhost/")! : Bundle.main.bundleURL
            )
        }
    }
    
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        switch message.name {
        case ERROR:
            if message.body as? String == "Script error." {
                print("A JS error occurred but we can't read the error message. You can temporarily set useLocalHost in ReplayViewController to true to read it - but your game will not be able to load any audio or image assets.")
            } else {
                print("JS Error: \(message.body)")
            }
        case CONSOLE_LOG:
            onLogCallback("\(message.body)")
            print(message.body)
        case DID_LOAD:
            onLoadCallback()
        default:
            print("Unknown webKit message \(message.name)")
        }
    }
    
    func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
        alerter.ok(message, onResponse: completionHandler)
    }
    
    func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {
        alerter.okCancel(message, onResponse: completionHandler)
    }
}

