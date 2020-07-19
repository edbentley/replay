import UIKit

public protocol ReplayTimerManager {
    func start(callback: @escaping () -> Void, time: TimeInterval) -> String
    func pause(id: String) -> Void
    func resume(id: String) -> Void
    func cancel(id: String) -> Void
}

struct TimerInfo {
    var timer: Timer
    var callback: () -> Void
    var timeStarted: TimeInterval
    var timeRemaining: TimeInterval
    var isPaused: Bool
}

class TimerManager: ReplayTimerManager {
    var timerInfoMap: [String: TimerInfo] = [:]
    
    func start(callback: @escaping () -> Void, time: TimeInterval) -> String {
        let id = UUID().uuidString
        
        let timer = Timer.scheduledTimer(
            withTimeInterval: time,
            repeats: false
        ) { timer in
            self.timerInfoMap.removeValue(forKey: id)
            callback()
        }
        
        timerInfoMap[id] = TimerInfo(
            timer: timer,
            callback: callback,
            timeStarted: Date().timeIntervalSince1970,
            timeRemaining: time,
            isPaused: false
        )
        
        return id
    }
    
    func pause(id: String) {
        guard let timerInfo = timerInfoMap[id] else { return }
        guard !timerInfo.isPaused else { return }
                
        timerInfo.timer.invalidate()
        
        let timeElapsed = Date().timeIntervalSince1970 - timerInfo.timeStarted
        
        timerInfoMap[id] = TimerInfo(
            timer: timerInfo.timer,
            callback: timerInfo.callback,
            timeStarted: timerInfo.timeStarted,
            timeRemaining: timerInfo.timeRemaining - timeElapsed,
            isPaused: true
        )
    }
    
    func resume(id: String) {
        guard let timerInfo = timerInfoMap[id] else { return }
        guard timerInfo.isPaused else { return }
        
        let timer = Timer.scheduledTimer(
            withTimeInterval: timerInfo.timeRemaining,
            repeats: false
        ) { timer in
            self.timerInfoMap.removeValue(forKey: id)
            timerInfo.callback()
        }
        
        timerInfoMap[id] = TimerInfo(
            timer: timer,
            callback: timerInfo.callback,
            timeStarted: Date().timeIntervalSince1970,
            timeRemaining: timerInfo.timeRemaining,
            isPaused: false
        )
    }
    
    func cancel(id: String) {
        guard let timerInfo = timerInfoMap[id] else { return }
        
        timerInfo.timer.invalidate()
        timerInfoMap.removeValue(forKey: id)
    }
}
