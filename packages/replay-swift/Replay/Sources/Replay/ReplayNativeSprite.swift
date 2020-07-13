import Foundation
import JavaScriptCore

public typealias ReplayNativeSpriteMap = [String: ReplayNativeSpriteImplementation]

// -- Implementation

@objc public protocol ReplayNativeSpriteImplementation : JSExport {
    var create: @convention(block) (JSValue) -> NSDictionary { get set }
    var loop: @convention(block) (JSValue) -> NSDictionary { get set }
    var cleanup: @convention(block) (JSValue) -> Void { get set }
}

public class ReplayNativeSpriteArgs {
    public static func parseCreateArgs(_ argsObj: JSValue) -> ReplayNativeSpriteCreateArgs {
        let props = argsObj.forProperty("props")!
        let parentGlobalId = argsObj.forProperty("parentGlobalId")!.toString()!
        let getState = argsObj.forProperty("getState")!
        let updateState = argsObj.forProperty("updateState")!
        let utils = argsObj.forProperty("utils")!.toObjectOf(ReplayNativeSpriteUtils.self) as! ReplayNativeSpriteUtils

        return ReplayNativeSpriteCreateArgs(
            props: props,
            parentGlobalId: parentGlobalId,
            getState: {
                return getState.call(withArguments: [])
            },
            updateState: { mergeState in
                updateState.call(withArguments: [mergeState])
            },
            utils: utils
        )
    }

    public static func parseLoopArgs(_ argsObj: JSValue) -> ReplayNativeSpriteLoopArgs {
        let props = argsObj.forProperty("props")!
        let state = argsObj.forProperty("state")!
        let parentGlobalId = argsObj.forProperty("parentGlobalId")!.toString()!
        let utils = argsObj.forProperty("utils")!.toObjectOf(ReplayNativeSpriteUtils.self) as! ReplayNativeSpriteUtils

        return ReplayNativeSpriteLoopArgs(props: props, state: state, parentGlobalId: parentGlobalId, utils: utils)
    }

    public static func parseCleanupArgs(_ argsObj: JSValue) -> ReplayNativeSpriteCleanupArgs {
        let state = argsObj.forProperty("state")!
        let parentGlobalId = argsObj.forProperty("parentGlobalId")!.toString()!

        return ReplayNativeSpriteCleanupArgs(state: state, parentGlobalId: parentGlobalId)
    }
}

public struct ReplayNativeSpriteCreateArgs {
    public var props: JSValue
    public var parentGlobalId: String
    public var getState: () -> JSValue
    public var updateState: (NSDictionary) -> Void
    public var utils: ReplayNativeSpriteUtilsJS
}
public struct ReplayNativeSpriteLoopArgs {
    public var props: JSValue
    public var state: JSValue
    public var parentGlobalId: String
    public var utils: ReplayNativeSpriteUtilsJS
}
public struct ReplayNativeSpriteCleanupArgs {
    public var state: JSValue
    public var parentGlobalId: String
}

// -- Settings

@objc protocol NativeSpriteSettingsJS : JSExport {
    var nativeSpriteMap: NSDictionary { get set }
    var nativeSpriteUtils: ReplayNativeSpriteUtils { get set }
}
@objc class NativeSpriteSettings : NSObject, NativeSpriteSettingsJS {
    var nativeSpriteMap: NSDictionary
    var nativeSpriteUtils: ReplayNativeSpriteUtils

    init(nativeSpriteMap: ReplayNativeSpriteMap, deviceSize: DeviceSize) {
        self.nativeSpriteMap = nativeSpriteMap as NSDictionary

        nativeSpriteUtils  = ReplayNativeSpriteUtils(deviceSize: deviceSize)
    }
}

// -- Utils

@objc public protocol ReplayNativeSpriteUtilsJS : JSExport {
    var didResize: Bool { get set }
    var scale: NSNumber { get set }
    var gameXToPlatformX: @convention(block) (NSNumber) -> NSNumber { get set }
    var gameYToPlatformY: @convention(block) (NSNumber) -> NSNumber { get set }
}
@objc public class ReplayNativeSpriteUtils : NSObject, ReplayNativeSpriteUtilsJS {
    public var didResize: Bool
    public var scale: NSNumber
    public var gameXToPlatformX: @convention(block) (NSNumber) -> NSNumber
    public var gameYToPlatformY: @convention(block) (NSNumber) -> NSNumber

    init(deviceSize: DeviceSize) {
        // Resize handling not currently supported for Native Sprites on Swift
        didResize = false
        
        // Scale is handled by ReplayViewController
        scale = 1

        gameXToPlatformX = { x in
            return cgFloatToNsNumber(SizeUtils.gameXToDeviceX(x: x, deviceSize: deviceSize))
        }
        gameYToPlatformY = { y in
            return cgFloatToNsNumber(SizeUtils.gameYToDeviceY(y: y, deviceSize: deviceSize))
        }
    }
}
