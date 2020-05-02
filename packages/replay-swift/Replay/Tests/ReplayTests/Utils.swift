import CoreGraphics
@testable import Replay

func getProps(_ texture: ReplayTexture) -> BaseProps {
    switch texture {
    case .circle(let baseProps, _): return baseProps
    case .rectangle(let baseProps, _): return baseProps
    case .line(let baseProps, _): return baseProps
    case .image(let baseProps, _): return baseProps
    case .spriteSheet(let baseProps, _): return baseProps
    case .text(let baseProps, _): return baseProps
    }
}
