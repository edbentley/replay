import Foundation
@testable import Replay

class MockAudioPlayer: ReplayAudioPlayer {
    var lastPlayCall: (filename: String, position: TimeInterval?, loop: Bool)!
    func playSound(_ filename: String, position: TimeInterval?, loop: Bool) {
        lastPlayCall = (filename, position, loop)
    }

    var lastPauseCallFilename: String!
    func pauseSound(_ filename: String) {
        lastPauseCallFilename = filename
    }

    func getPosition(_ filename: String) -> TimeInterval {
        return 35
    }

    func setup() {}
}
