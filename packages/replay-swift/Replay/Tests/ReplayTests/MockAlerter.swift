import Foundation
@testable import Replay

class MockAlerter: ReplayAlerter {
    var lastMessage = ""
    var shouldOk = true
    
    func ok(_ message: String, onResponse: (() -> Void)?) {
        lastMessage = message
        onResponse?()
    }
    
    func okCancel(_ message: String, onResponse: (Bool) -> Void) {
        lastMessage = message
        onResponse(shouldOk)
    }
}
