import Foundation

class ReplayDateGenerator {
    var mockDateNow: Date?

    init(mockDateNow: Date?) {
        self.mockDateNow = mockDateNow
    }

    func getDateNow() -> Date {
        return mockDateNow ?? Date()
    }
}
