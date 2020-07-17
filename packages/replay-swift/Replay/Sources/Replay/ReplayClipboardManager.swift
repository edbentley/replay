import UIKit
import JavaScriptCore

public protocol ReplayClipboardManager {
    func copy(_ text: String) -> Void
}

class ClipboardManager: ReplayClipboardManager {
    func copy(_ text: String) {
        let pasteboard = UIPasteboard.general
        pasteboard.string = text
    }
}
