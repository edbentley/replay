import WebKit
import os.log

let CONSOLE_LOG = "consoleLog"
let ERROR = "error"
let JS_CALLBACK = "jsCallback"

public class ReplayWebView: WKWebView {
    public override var safeAreaInsets: UIEdgeInsets {
        return UIEdgeInsets(top: 0, left: 0, bottom: 0, right: 0)
    }
    
    public func jsBridge(messageId: String, jsArg: String) {
        self.evaluateJavaScript(
            "window.__replayGlobalCallbacks__[`\(messageId)`] && window.__replayGlobalCallbacks__[`\(messageId)`](\(jsArg));"
        )
    }
}

class ReplayWebViewManager: NSObject, WKScriptMessageHandler, WKUIDelegate, WKNavigationDelegate {
    let webConfiguration = WKWebViewConfiguration()
    var webView: ReplayWebView!
    var userStyles: String
    var jsRun: String
    var customGameJsString: String?
    let alerter = ReplayAlerter()
    let onJsCallback: (String) -> Void // userland
    let onLogCallback: (String) -> Void // for testing
    let onJsCrash: (String) -> Void
    let webWorkerFiles: [String]
    let internalMessageKey = "__internalReplay"
    
    init(
        customGameJsString: String? = nil,
        userStyles: String,
        jsRun: String,
        onLogCallback: @escaping (String) -> Void = {_ in },
        onJsCallback: @escaping (String) -> Void,
        onJsCrash: @escaping (String) -> Void,
        webWorkerFiles: [String] = []
    ) {
        self.onLogCallback = onLogCallback
        self.onJsCallback = onJsCallback
        self.userStyles = userStyles
        self.jsRun = jsRun
        self.customGameJsString = customGameJsString
        self.onJsCrash = onJsCrash
        self.webWorkerFiles = webWorkerFiles
        super.init()
        
        let contentController = WKUserContentController()
        contentController.add(self, name: CONSOLE_LOG)
        contentController.add(self, name: ERROR)
        contentController.add(self, name: JS_CALLBACK)
        webConfiguration.userContentController = contentController
        webConfiguration.mediaTypesRequiringUserActionForPlayback = []
        
        // Allow fetching local files in JS. This is not documented, but Stack Overflow says it's ok
        // https://stackoverflow.com/questions/36013645/setting-disable-web-security-and-allow-file-access-from-files-in-ios-wkwebvi
        webConfiguration.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs");
        
        webView = ReplayWebView(frame: .zero, configuration: webConfiguration)
        webView.scrollView.isScrollEnabled = false
        webView.isMultipleTouchEnabled = true
        webView.uiDelegate = self
        webView.navigationDelegate = self
        
        // Disable haptic feedback on long press
        let longPress = UILongPressGestureRecognizer(target: nil, action: nil)
        longPress.minimumPressDuration = 0.1
        webView.addGestureRecognizer(longPress)
        
        loadGame()
    }
    
    func loadGame() {
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
        
        var customJsScripts: [String] = []
        
        for file in webWorkerFiles {
            guard let fileJsPath = Bundle.main.path(forResource: file, ofType: "js") else {
                fatalError("Couldn't load \(file).js file in Bundle")
            }
            guard let fileJsPathString = try? String(
                contentsOfFile: fileJsPath,
                encoding: String.Encoding.utf8
            ) else {
                fatalError("Couldn't read JS file at path \(fileJsPath)")
            }
            customJsScripts.append("""
    <script type="text/js-worker">
    \(fileJsPathString)
    </script>
    """)
        }
        
        let renderCanvasJsPath = Bundle.module.path(forResource: "renderCanvas", ofType: ".js")!
        let renderCanvasJsString = try! String(
            contentsOfFile: renderCanvasJsPath,
            encoding: String.Encoding.utf8
        )
        
        let htmlString = getReplayRenderCanvasHtmlString(
            renderCanvasJsString: renderCanvasJsString,
            gameJsString: gameJsString,
            userStyles: userStyles,
            jsRun: jsRun,
            customJsScripts: customJsScripts
        )
        
        self.webView.loadHTMLString(htmlString, baseURL: Bundle.main.bundleURL)
    }
    
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        let messageBody = "\(message.body)"
        switch message.name {
        case ERROR:
            onJsCrash(messageBody)
        case CONSOLE_LOG:
            onLogCallback(messageBody)
            if #available(iOS 14.0, *) {
                os_log("%@", messageBody)
            } else {
                print(messageBody)
            }
        case JS_CALLBACK:
            let value = messageBody
            if value.starts(with: internalMessageKey) {
                let restOfMessage = String(value.dropFirst(internalMessageKey.count))
                handleInternalMessage(message: restOfMessage)
            } else {
                onJsCallback(value)
            }
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
    
    func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
        print("Web view terminated, restarting. This may be caused by your game using up too much memory.")
        
        // Reload
        loadGame()
    }
    
    func handleInternalMessage(message: String) {
        switch message {
        case let x where x.starts(with: ReplayAlerter.messagePrefix):
            alerter.handleInternalMessage(
                message: message,
                webView: webView,
                internalMessageKey: internalMessageKey
            )
        case let x where x.starts(with: ReplayStorageProvider.messagePrefix):
            ReplayStorageProvider.handleInternalMessage(
                message: message,
                webView: webView,
                internalMessageKey: internalMessageKey
            )
        case let x where x.starts(with: ReplayClipboardManager.messagePrefix):
            ReplayClipboardManager.handleInternalMessage(
                message: message,
                webView: webView,
                internalMessageKey: internalMessageKey
            )
        default:
            break
        }
    }
}

