import Foundation
@testable import Replay

class MockClipboard: ReplayClipboardManager {
    var lastCopied = ""
    
    func copy(_ text: String) {
        lastCopied = text
    }
}
