import CoreGraphics

enum ReplayMask: Equatable {
    static func == (lhs: ReplayMask, rhs: ReplayMask) -> Bool {
        switch (lhs, rhs) {
        case let (.circle(a), .circle(b)):
            return a == b
        case let (.rectangle(a), .rectangle(b)):
            return a == b
        case let (.line(a), .line(b)):
            return a == b
        default:
            return false
        }
    }
    
    case circle(CircleMaskProps)
    case rectangle(RectangleMaskProps)
    case line(LineMaskProps)
    case none
}

struct CircleMaskProps: Equatable {
    var radius: CGFloat
    var x: CGFloat
    var y: CGFloat
}

struct RectangleMaskProps: Equatable {
    var width: CGFloat
    var height: CGFloat
    var x: CGFloat
    var y: CGFloat
}

struct LineMaskProps: Equatable {
    var path: [CGPoint]
}
