import Foundation

public enum ReplayNetworkMethod: String {
    case GET = "GET"
    case POST = "POST"
    case PUT = "PUT"
    case DELETE = "DELETE"
}

public protocol ReplayNetworkSession {
    func fetchAsync(path: String, method: ReplayNetworkMethod, jsonBody: ReplayJsonData?, onComplete: @escaping (ReplayJsonData) -> Void)
}

public typealias ReplayJsonData = [String : Any]

// Extend URLSession to allow mocking through dependency injection
extension URLSession: ReplayNetworkSession {
    public func fetchAsync(path: String, method: ReplayNetworkMethod, jsonBody: ReplayJsonData?, onComplete: @escaping (ReplayJsonData) -> Void) {
        guard let url = URL(string: path) else { fatalError("Invalid url \(path)") }
        var request = URLRequest(url: url)
        request.httpMethod = method.rawValue

        if let jsonBody = jsonBody {
            if (method == .POST || method == .PUT) {
                request.httpBody = try? JSONSerialization.data(withJSONObject: jsonBody)
            }
        }

        let task = self.dataTask(with: request) { (data, response, error) in
            guard let data = data,
                let jsonSerialized = try? JSONSerialization.jsonObject(with: data, options: []) as? ReplayJsonData
                else {
                    fatalError("Failed to fetch JSON at url \(path)" )
            }
            onComplete(jsonSerialized)
        }
        task.resume()
    }
}
