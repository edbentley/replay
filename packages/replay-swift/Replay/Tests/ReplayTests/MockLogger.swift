import Foundation
@testable import Replay

class MockLogger {
    var lastLogged: String?

    func getLogger() -> ReplayLogger {
        return { message in
            self.lastLogged = message
        }
    }
}
