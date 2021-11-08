import UIKit

class ReplayAlerter {
    func ok(_ message: String, onResponse: (() -> Void)?) {
        // https://stackoverflow.com/questions/12418177/how-to-get-root-view-controller/12418527
        let viewController = UIApplication.shared.windows.first!.rootViewController!
        
        let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)
        alert.addAction(
            UIAlertAction(title: "OK", style: .default) { (_) in
                onResponse?()
            }
        )
        viewController.present(alert, animated: true, completion: nil)
    }

    func okCancel(_ message: String, onResponse: @escaping (Bool) -> Void) {
        let viewController = UIApplication.shared.windows.first!.rootViewController!
        
        let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)
        alert.addAction(
            UIAlertAction(title: "Cancel", style: .default) { (_) in
                onResponse(false)
            }
        )
        alert.addAction(
            UIAlertAction(title: "OK", style: .default) { (_) in
                onResponse(true)
            }
        )
        viewController.present(alert, animated: true, completion: nil)
    }
    
    // Replay bridge
    static let messagePrefix = "Alert"
    
    func handleInternalMessage(message: String, webView: ReplayWebView, internalMessageKey: String) {
        let okKey = "\(ReplayAlerter.messagePrefix)Ok"
        let okCancelKey = "\(ReplayAlerter.messagePrefix)Confirm"
        
        switch message {
        case let x where x.starts(with: okKey):
            let message = String(x.dropFirst(okKey.count))
            
            ok(message) {
                webView.jsBridge(messageId: "\(internalMessageKey)\(okKey)", jsArg: "")
            }
            
        case let x where x.starts(with: okCancelKey):
            let message = String(x.dropFirst(okCancelKey.count))
            
            okCancel(message) { wasOk in
                let wasOkString = wasOk ? "true" : "false"
                webView.jsBridge(messageId: "\(internalMessageKey)\(okCancelKey)", jsArg: "\(wasOkString)")
            }
            
        default:
            break
        }
    }
}
