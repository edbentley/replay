import Foundation
import JavaScriptCore

// matches interface ReplayPlatform in replay-core
@objc protocol ReplayPlatform : JSExport {
    func getGetDevice() -> (GetLocalCoords) -> iOSDevice
}

// A JS function to be called
typealias GetLocalCoords = JSValue

@objc protocol XYCoordsJS : JSExport {
    var x: NSNumber { get set }
    var y: NSNumber { get set }
}
@objc class XYCoords : NSObject, XYCoordsJS {
    var x: NSNumber
    var y: NSNumber
    init(x: NSNumber, y: NSNumber) {
        self.x = x
        self.y = y
    }
}

@objc protocol iOSDeviceJS : JSExport {
    var inputs: Inputs { get set }
    var size: DeviceSize { get set }
    var log: @convention(block) (String) -> Void { get set }
    var random: @convention(block) () -> NSNumber { get set }
    var timer: ReplayTimer { get set }
    var now: @convention(block) () -> NSDate { get set }
    var audio: @convention(block) (String) -> Audio { get set }
    var network: Network { get set }
    var storage: Storage { get set }
    var alert: Alert { get set }
    var clipboard: Clipboard { get set }
}
@objc class iOSDevice : NSObject, iOSDeviceJS {
    var inputs: Inputs
    var size: DeviceSize
    var log: @convention(block) (String) -> Void
    var random: @convention(block) () -> NSNumber
    var timer: ReplayTimer
    var now: @convention(block) () -> NSDate
    var audio: @convention(block) (String) -> Audio
    var network: Network
    var storage: Storage
    var alert: Alert
    var clipboard: Clipboard

    init(
        inputs: Inputs,
        size: DeviceSize,
        session: ReplayNetworkSession,
        randomGenerator: ReplayRandomNumberGenerator,
        dateGenerator: ReplayDateGenerator,
        audioPlayer: ReplayAudioPlayer,
        logger: @escaping ReplayLogger,
        storageProvider: ReplayStorageProvider,
        alerter: ReplayAlerter,
        clipboardManager: ReplayClipboardManager,
        timerManager: ReplayTimerManager
    ) {
        self.inputs = inputs
        self.size = size
        self.network = Network(session: session)

        log = logger
        random = {
            return NSNumber(value: randomGenerator.getRandomNumber())
        }
        timer = ReplayTimer(timerManager: timerManager)
        now = {
            return dateGenerator.getDateNow() as NSDate
        }
        audio = { filename in
            return Audio(filename: filename, audioPlayer: audioPlayer)
        }
        storage = Storage(provider: storageProvider)
        alert = Alert(alerter: alerter)
        
        let copy: @convention(block) (String, JSValue) -> Void = { (text, onComplete) in
            clipboardManager.copy(text)
            onComplete.call(withArguments: [])
        }
        clipboard = ["copy": copy]
    }
}


@objc protocol PointerJS : JSExport {
    var pressed: Bool { get set }
    var justPressed: Bool { get set }
    var justReleased: Bool { get set }
    var x: NSNumber { get set }
    var y: NSNumber { get set }
}
@objc class Pointer : NSObject, PointerJS {
    var pressed: Bool
    var justPressed: Bool
    var justReleased: Bool
    var x: NSNumber
    var y: NSNumber
    init(pressed: Bool, justPressed: Bool, justReleased: Bool, x: NSNumber, y: NSNumber) {
        self.pressed = pressed
        self.justPressed = justPressed
        self.justReleased = justReleased
        self.x = x
        self.y = y
    }
}

@objc protocol InputsJS : JSExport {
    var pointer: Pointer { get set }
}
@objc class Inputs : NSObject, InputsJS {
    var pointer: Pointer
    init(pointer: Pointer, getLocalCoords: GetLocalCoords) {
        let localCoords = ReplayJS.callGetLocalCoords(
            getLocalCoords: getLocalCoords,
            coords: XYCoords(x: pointer.x, y: pointer.y)
        )
        
        self.pointer = Pointer(
            pressed: pointer.pressed,
            justPressed: pointer.justPressed,
            justReleased: pointer.justReleased,
            x: localCoords.x,
            y: localCoords.y
        )
    }
}

@objc protocol DeviceSizeJS : JSExport {
    var width: NSNumber { get set }
    var height: NSNumber { get set }
    var widthMargin: NSNumber { get set }
    var heightMargin: NSNumber { get set }
    var deviceWidth: NSNumber { get set }
    var deviceHeight: NSNumber { get set }
}
@objc class DeviceSize : NSObject, DeviceSizeJS {
    var width: NSNumber
    var height: NSNumber
    var widthMargin: NSNumber
    var heightMargin: NSNumber
    var deviceWidth: NSNumber
    var deviceHeight: NSNumber
    init(
        width: NSNumber,
        height: NSNumber,
        widthMargin: NSNumber,
        heightMargin: NSNumber,
        deviceWidth: NSNumber,
        deviceHeight: NSNumber
    ) {
        self.width = width
        self.height = height
        self.widthMargin = widthMargin
        self.heightMargin = heightMargin
        self.deviceWidth = deviceWidth
        self.deviceHeight = deviceHeight
    }
}

@objc protocol AudioJS : JSExport {
    var getPosition: @convention(block) () -> NSNumber { get set }
    var play: @convention(block) (NSNumber, Bool) -> Void { get set }
    var pause: @convention(block) () -> Void { get set }
}
@objc class Audio : NSObject, AudioJS {
    var filename: String
    var getPosition: @convention(block) () -> NSNumber
    var play: @convention(block) (NSNumber, Bool) -> Void
    var pause: @convention(block) () -> Void

    init(filename: String, audioPlayer: ReplayAudioPlayer) {
        self.filename = filename

        getPosition = {
            return NSNumber(value: audioPlayer.getPosition(filename))
        }
        play = {(position, loop) in
            audioPlayer.playSound(
                filename,
                position: Double(exactly: position),
                loop: loop
            )
        }
        pause = {
            audioPlayer.pauseSound(filename)
        }
    }
}

@objc protocol NetworkJS : JSExport {
    var get: @convention(block) (String, JSValue) -> Void { get set }
    var post: @convention(block) (String, NSDictionary, JSValue) -> Void { get set }
    var put: @convention(block) (String, NSDictionary, JSValue) -> Void { get set }
    var delete: @convention(block) (String, JSValue) -> Void { get set }
}
@objc class Network : NSObject, NetworkJS {
    var get: @convention(block) (String, JSValue) -> Void
    var post: @convention(block) (String, NSDictionary, JSValue) -> Void
    var put: @convention(block) (String, NSDictionary, JSValue) -> Void
    var delete: @convention(block) (String, JSValue) -> Void

    init(session: ReplayNetworkSession) {
        get = { (url, callback) in
            session.fetchAsync(
                path: url,
                method: .GET,
                jsonBody: nil,
                onComplete: { callback.call(withArguments: [$0]) }
            )
        }
        post = { (url, body, callback) in
            session.fetchAsync(
                path: url,
                method: .POST,
                jsonBody: body as? ReplayJsonData,
                onComplete: { callback.call(withArguments: [$0]) }
            )
        }
        put = { (url, body, callback) in
            session.fetchAsync(
                path: url,
                method: .PUT,
                jsonBody: body as? ReplayJsonData,
                onComplete: { callback.call(withArguments: [$0]) }
            )
        }
        delete = { (url, callback) in
            session.fetchAsync(
                path: url,
                method: .DELETE,
                jsonBody: nil,
                onComplete: { callback.call(withArguments: [$0]) }
            )
        }
    }
}

@objc protocol ReplayTimerJS : JSExport {
    var start: @convention(block) (JSValue, NSNumber) -> String { get set }
    var pause: @convention(block) (String) -> Void { get set }
    var resume: @convention(block) (String) -> Void { get set }
    var cancel: @convention(block) (String) -> Void { get set }
}
@objc class ReplayTimer : NSObject, ReplayTimerJS {
    var start: @convention(block) (JSValue, NSNumber) -> String
    var pause: @convention(block) (String) -> Void
    var resume: @convention(block) (String) -> Void
    var cancel: @convention(block) (String) -> Void

    init(timerManager: ReplayTimerManager) {
        start = { (callback, ms) in
            timerManager.start(
                callback: { callback.call(withArguments: []) },
                time: TimeInterval(Float(truncating: ms) / 1000)
            )
        }
        pause = { (id) in
            timerManager.pause(id: id)
        }
        resume = { (id) in
            timerManager.resume(id: id)
        }
        cancel = { (id) in
            timerManager.cancel(id: id)
        }
    }
}

@objc protocol StorageJS : JSExport {
    var getStore: @convention(block) () -> NSDictionary { get set }
    var setStore: @convention(block) (NSDictionary) -> Void { get set }
}
@objc class Storage : NSObject, StorageJS {
    var getStore: @convention(block) () -> NSDictionary
    var setStore: @convention(block) (NSDictionary) -> Void

    init(provider: ReplayStorageProvider) {
        getStore = {
            return provider.getStore() as NSDictionary
        }
        setStore = { store in
            guard let validStore = store as? ReplayStore else { fatalError("Set invalid store") }
            provider.setStore(validStore)
        }
    }
}

@objc protocol AlertJS : JSExport {
    var ok: @convention(block) (String, JSValue) -> Void { get set }
    var okCancel: @convention(block) (String, JSValue) -> Void { get set }
}
@objc class Alert : NSObject, AlertJS {
    var ok: @convention(block) (String, JSValue) -> Void
    var okCancel: @convention(block) (String, JSValue) -> Void

    init(alerter: ReplayAlerter) {
        ok = { (message, onResponse) in
            alerter.ok(
                message,
                onResponse: onResponse.isUndefined ? nil : { onResponse.call(withArguments: []) }
            )
        }
        okCancel = { (message, onResponse) in
            alerter.okCancel(message, onResponse: { wasOk in
                onResponse.call(withArguments: [wasOk])
            })
        }
    }
}

// Clipboard is a JS object with a copy field.
// However NSObject already has a `copy` method which conflicts with Replay's,
// so we'll use an NSDictionary instead of JSExport
typealias Clipboard = NSDictionary
