import Foundation
import AVFoundation

// This allows other players to be made for mocking
public protocol ReplayAudioPlayer {
    func playSound(_ filename: String, position: TimeInterval?, loop: Bool) -> Void
    func pauseSound(_ filename: String) -> Void
    func getPosition(_ filename: String) -> TimeInterval
    func setup() -> Void
}

class AudioPlayer: NSObject, ReplayAudioPlayer, AVAudioPlayerDelegate {
    func playSound(_ filename: String, position: TimeInterval?, loop: Bool) {
        let player = getPlayer(filename: filename, play: true)

        if let atTime = position {
            player.play(atTime: atTime)
        } else {
            player.play()
        }
        player.numberOfLoops = loop ? -1 : 0
    }

    func pauseSound(_ filename: String) {
        let player = getPlayer(filename: filename, play: false)
        player.pause()
    }

    func getPosition(_ filename: String) -> TimeInterval {
        let player = getPlayer(filename: filename, play: false)
        return player.currentTime
    }

    func setup() {
        // Prepare an audio player to avoid lag for other players
        // Unconfirmed if this actually works or not
        let setupPlayer = AVAudioPlayer()
        setupPlayer.prepareToPlay()
    }

    // --- Internal

    private var audioPlayers: [String: AVAudioPlayer] = [:]
    private var duplicatePlayers = [AVAudioPlayer]()

    private func getPlayer(filename: String, play: Bool) -> AVAudioPlayer {
        if let player = audioPlayers[filename] {
            if play && player.isPlaying {
                // Enable multiple sounds played at the same time
                let duplicate = getNewPlayer(filename: filename)
                duplicate.delegate = self // set delegate to remove it later
                duplicatePlayers.append(duplicate)
                return duplicate
            }
            return player
        }
        let player = getNewPlayer(filename: filename)
        audioPlayers[filename] = player
        return player
    }

    private func getNewPlayer(filename: String) -> AVAudioPlayer {
        // type is in filename
        guard let path = Bundle.main.path(forResource: filename, ofType : "")
            else {
                fatalError("Could not find \(filename) in your project. Did you forget to add it?")
        }
        let url = URL(fileURLWithPath : path)

        let player = try! AVAudioPlayer(contentsOf: url)
        return player
    }

    // -- AVAudioPlayerDelegate

    func audioPlayerDidFinishPlaying(_ player: AVAudioPlayer, successfully flag: Bool) {
        duplicatePlayers.remove(at: duplicatePlayers.firstIndex(of: player)!)
    }
}
