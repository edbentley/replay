import CoreGraphics
import JavaScriptCore
@testable import Replay

func getProps(_ spriteTextures: ReplaySpriteTexturesOrTexture) -> BaseProps {
    switch spriteTextures {
    case .texture(let texture):
        switch texture {
        case .circle(let baseProps, _): return baseProps
        case .rectangle(let baseProps, _): return baseProps
        case .line(let baseProps, _): return baseProps
        case .image(let baseProps, _): return baseProps
        case .spriteSheet(let baseProps, _): return baseProps
        case .text(let baseProps, _): return baseProps
        }
    case .spriteTextures(let texture):
        return texture.baseProps
    }
}

func mockGetLocalCoords(subtractX: String = "0", subtractY: String = "0") -> GetLocalCoords {
    let context = JSContext()!
    
    context.evaluateScript("""
    function getLocalCoords({x,y}) {
        return { x: x-\(subtractX), y: y-\(subtractY) };
    }
    """)
    return context.objectForKeyedSubscript("getLocalCoords")!
}
