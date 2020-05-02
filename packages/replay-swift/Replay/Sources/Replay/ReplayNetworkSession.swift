import Foundation

enum NetworkMethod: String {
    case GET = "GET"
    case POST = "POST"
    case PUT = "PUT"
    case DELETE = "DELETE"
}

protocol ReplayNetworkSession {
    func fetchAsync(path: String, method: NetworkMethod, jsonBody: JsonData?, onComplete: @escaping (JsonData) -> Void)
}

typealias JsonData = [String : Any]

// Extend URLSession to allow mocking through dependency injection
extension URLSession: ReplayNetworkSession {
    func fetchAsync(path: String, method: NetworkMethod, jsonBody: JsonData?, onComplete: @escaping (JsonData) -> Void) {
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
                let jsonSerialized = try? JSONSerialization.jsonObject(with: data, options: []) as? JsonData
                else {
                    fatalError("Failed to fetch JSON at url \(path)" )
            }
            onComplete(jsonSerialized)
        }
        task.resume()
    }
}
