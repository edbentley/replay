import UIKit

class Alerter {
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
}
