import Foundation
@testable import Replay

class MockStorage: ReplayStorageProvider {
    var store: ReplayStore = [:]

    func setStore(_ store: ReplayStore) {
        self.store = store
    }

    func getStore() -> ReplayStore {
        return store
    }
}
