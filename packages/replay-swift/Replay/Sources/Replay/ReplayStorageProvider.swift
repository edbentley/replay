import Foundation

class ReplayStorageProvider {
    static func getItem(key: String) -> String? {
        let defaults = UserDefaults.standard
        
        return defaults.string(forKey: key)
    }
    
    static func removeItem(key: String) {
        let defaults = UserDefaults.standard
        
        defaults.removeObject(forKey: key)
    }
    
    static func setItem(key: String, value: String) {
        let defaults = UserDefaults.standard
        
        defaults.set(value, forKey: key)
    }
    
    static func handleInternalMessage(message: String, webView: ReplayWebView, internalMessageKey: String) {
        let getItemKey = "GetItem-"
        let removeItemKey = "RemoveItem-"
        let setItemKey = "SetItem-"
        let setItemKeyValueSeparator = "_____end_of_key______"
        
        switch message {
        case let x where x.starts(with: getItemKey):
            let key = String(x.dropFirst(getItemKey.count))
            let value = ReplayStorageProvider.getItem(key: key)
            
            let messageId = "\(internalMessageKey)\(getItemKey)\(key)"
            
            if let jsString = value {
                webView.jsBridge(messageId: messageId, jsArg: "`\(jsString)`")
            } else {
                webView.jsBridge(messageId: messageId, jsArg: "null")
            }
            
        case let x where x.starts(with: removeItemKey):
            let key = String(x.dropFirst(removeItemKey.count))
            
            ReplayStorageProvider.removeItem(key: key)
            
            let messageId = "\(internalMessageKey)\(removeItemKey)\(key)"
            
            webView.jsBridge(messageId: messageId, jsArg: "")
            
        case let x where x.starts(with: setItemKey):
            let keyValue = String(x.dropFirst(setItemKey.count))
                .components(separatedBy: setItemKeyValueSeparator)
            let key = keyValue[0]
            let value = keyValue[1]
            
            ReplayStorageProvider.setItem(key: key, value: value)
            
            let messageId = "\(internalMessageKey)\(setItemKey)\(key)"
            
            webView.jsBridge(messageId: messageId, jsArg: "")
            
        default:
            break
        }
    }
}
