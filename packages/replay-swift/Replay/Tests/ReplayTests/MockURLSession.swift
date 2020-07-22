import Foundation
import JavaScriptCore
@testable import Replay

typealias MockResponses = [ReplayNetworkMethod: [String: [String: Any]]]

class NetworkSessionMock: ReplayNetworkSession {

    var responses: [ReplayNetworkMethod: [String: [String: Any]]]

    init(responses: MockResponses) {
        self.responses = responses
    }

    func fetchAsync(path: String, method: ReplayNetworkMethod, jsonBody: ReplayJsonData?, onComplete: @escaping (ReplayJsonData) -> Void) {
        onComplete(responses[method]![path]!)
    }
}
