import Foundation
import JavaScriptCore
@testable import Replay

typealias MockResponses = [Replay.NetworkMethod: [String: [String: Any]]]

class NetworkSessionMock: ReplayNetworkSession {

    var responses: [Replay.NetworkMethod: [String: [String: Any]]]

    init(responses: MockResponses) {
        self.responses = responses
    }

    func fetchAsync(path: String, method: NetworkMethod, jsonBody: JsonData?, onComplete: @escaping (JsonData) -> Void) {
        onComplete(responses[method]![path]!)
    }
}
