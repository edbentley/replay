class ReplayRandomNumberGenerator {
    var mockRandom: Double?

    init(mockRandom: Double?) {
        self.mockRandom = mockRandom
    }

    func getRandomNumber() -> Double {
        return mockRandom ?? Double.random(in: 0 ..< 1)
    }
}
