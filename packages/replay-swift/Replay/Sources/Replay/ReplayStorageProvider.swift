import Foundation

public typealias ReplayStore = [String: String?]

public protocol ReplayStorageProvider {
    func setStore(_ store: ReplayStore) -> Void
    func getStore() -> ReplayStore
}

class StorageProvider: ReplayStorageProvider {
    func getStore() -> ReplayStore {
        let defaults = UserDefaults.standard

        var store = ReplayStore()

        for (key, value) in defaults.dictionaryRepresentation() {
            if let valueStr = value as? String {
                store[key] = valueStr
            }
        }

        return store
    }

    func setStore(_ store: ReplayStore) {
        let defaults = UserDefaults.standard

        for (key, value) in store {
            if let valueStr = value {
                defaults.set(valueStr, forKey: key)
            } else {
                defaults.removeObject(forKey: key)
            }
        }
    }
}
