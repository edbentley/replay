import Foundation

typealias Store = [String: String?]

protocol ReplayStorageProvider {
    func setStore(_ store: Store) -> Void
    func getStore() -> Store
}

class StorageProvider: ReplayStorageProvider {
    func getStore() -> Store {
        let defaults = UserDefaults.standard

        var store = Store()

        for (key, value) in defaults.dictionaryRepresentation() {
            if let valueStr = value as? String {
                store[key] = valueStr
            }
        }

        return store
    }

    func setStore(_ store: Store) {
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
