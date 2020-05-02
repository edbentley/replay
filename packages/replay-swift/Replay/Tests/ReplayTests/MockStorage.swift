import Foundation
@testable import Replay

class MockStorage: ReplayStorageProvider {
    var store: Store = [:]

    func setStore(_ store: Store) {
        self.store = store
    }

    func getStore() -> Store {
        return store
    }
}
