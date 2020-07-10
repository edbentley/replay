import UIKit
import JavaScriptCore
@testable import Replay

var mockNativeSpriteStates: [String] = []

@objc class MockNativeSprite : NSObject, ReplayNativeSpriteImplementation {
    
    var create: @convention(block) (JSValue) -> NSDictionary = { argsObj in
        let args = ReplayNativeSpriteArgs.parseCreateArgs(argsObj)
        
        mockNativeSpriteStates.append("create \(args.parentGlobalId)")
        
        return ["stateField": "Hello"]
    }
    
    var loop: @convention(block) (JSValue) -> NSDictionary = { argsObj in
        let args = ReplayNativeSpriteArgs.parseLoopArgs(argsObj)
        
        let stateField = args.state.forProperty("stateField")!.toString()!
        
        mockNativeSpriteStates.append("loop \(stateField) \(args.parentGlobalId)")

        return args.state.toDictionary()! as NSDictionary
    }
    
    var cleanup: @convention(block) (JSValue) -> Void = { argsObj in
        let args = ReplayNativeSpriteArgs.parseCleanupArgs(argsObj)
        
        mockNativeSpriteStates.append("cleanup \(args.parentGlobalId)")
    }
    
}
