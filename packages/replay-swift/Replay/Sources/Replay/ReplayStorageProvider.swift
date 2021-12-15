import Foundation

class ReplayStorageProvider {
    static func getItem(key: String) -> (String?, Error?) {
        do {
            let url = getFileUrl(key: key)
            if (!FileManager.default.fileExists(atPath: url.path)) {
                return (nil, nil)
            }
            let fileStr = try String(contentsOf: url)
            return (fileStr, nil)
        } catch {
            return (nil, error)
        }
    }
    
    static func removeItem(key: String) -> Error? {
        do {
            try FileManager.default.removeItem(at: getFileUrl(key: key))
            return nil
        } catch {
            return error
        }
    }
    
    static func setItem(key: String, value: String) -> Error? {
        do {
            try value.write(to: getFileUrl(key: key), atomically: true, encoding: .utf8)
            return nil
        } catch {
            return error
        }
    }
    
    static func getFileUrl(key: String) -> URL {
        let paths = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)
        return paths[0].appendingPathComponent(key)
    }
    
    static let messagePrefix = "Storage"
    
    static func handleInternalMessage(message: String, webView: ReplayWebView, internalMessageKey: String) {
        let getItemKey = "\(messagePrefix)GetItem-"
        let removeItemKey = "\(messagePrefix)RemoveItem-"
        let setItemKey = "\(messagePrefix)SetItem-"
        let setItemKeyValueSeparator = "_____end_of_key______"
        
        switch message {
        case let x where x.starts(with: getItemKey):
            // Background thread
            DispatchQueue.global(qos: .background).async {
                let key = String(x.dropFirst(getItemKey.count))
                let (value, error) = ReplayStorageProvider.getItem(key: key)
                
                let messageId = "\(internalMessageKey)\(getItemKey)\(key)"
                
                // Back on UI thread
                DispatchQueue.main.async {
                    if let errorMessage = error?.localizedDescription {
                        webView.jsBridge(messageId: messageId, jsArg: "{ error: `\(errorMessage)` }")
                    } else if let jsString = value {
                        webView.jsBridge(messageId: messageId, jsArg: "{ value: `\(jsString)` }")
                    } else {
                        webView.jsBridge(messageId: messageId, jsArg: "{ value: null }")
                    }
                }
            }
            
        case let x where x.starts(with: removeItemKey):
            DispatchQueue.global(qos: .background).async {
                let key = String(x.dropFirst(removeItemKey.count))
                
                let error = ReplayStorageProvider.removeItem(key: key)
                
                let messageId = "\(internalMessageKey)\(removeItemKey)\(key)"
                
                DispatchQueue.main.async {
                    if let errorMessage = error?.localizedDescription {
                        webView.jsBridge(messageId: messageId, jsArg: "`\(errorMessage)`")
                    } else {
                        webView.jsBridge(messageId: messageId, jsArg: "")
                    }
                }
            }
            
        case let x where x.starts(with: setItemKey):
            DispatchQueue.global(qos: .background).async {
                let keyValue = String(x.dropFirst(setItemKey.count))
                    .components(separatedBy: setItemKeyValueSeparator)
                let key = keyValue[0]
                let value = keyValue[1]
                
                let error = ReplayStorageProvider.setItem(key: key, value: value)
                
                let messageId = "\(internalMessageKey)\(setItemKey)\(key)"
                
                DispatchQueue.main.async {
                    if let errorMessage = error?.localizedDescription {
                        webView.jsBridge(messageId: messageId, jsArg: "`\(errorMessage)`")
                    } else {
                        webView.jsBridge(messageId: messageId, jsArg: "")
                    }
                }
            }
            
        default:
            break
        }
    }
}
