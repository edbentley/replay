import WebKit

// Notify when web view has loaded
class NavigationDelegate: NSObject, WKNavigationDelegate {
    let onLoadCallback: () -> Void
    
    init(onLoadCallback: @escaping () -> Void) {
        self.onLoadCallback = onLoadCallback
    }
    
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        onLoadCallback()
    }
}
