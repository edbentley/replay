import UIKit

class ReplayClipboardManager {
    static func copy(_ text: String) {
        let pasteboard = UIPasteboard.general
        pasteboard.string = text
    }
    
    static let messagePrefix = "Clipboard"
    
    static func handleInternalMessage(message: String, webView: ReplayWebView, internalMessageKey: String) {
        let clipboardCopyPrefix = "\(messagePrefix)Copy"
        
        let text = String(message.dropFirst(clipboardCopyPrefix.count))
        copy(text)
        webView.jsBridge(messageId: "\(internalMessageKey)\(clipboardCopyPrefix)", jsArg: "")
    }
}
