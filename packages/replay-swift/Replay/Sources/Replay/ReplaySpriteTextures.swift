import CoreGraphics

struct ReplaySpriteTextures {
    var id: String
    var baseProps: BaseProps
    var textures: [ReplaySpriteTexturesOrTexture]
}

enum ReplaySpriteTexturesOrTexture {
    case spriteTextures(ReplaySpriteTextures)
    case texture(ReplayTexture)
}

enum ReplayTexture {
    case text(BaseProps, TextProps)
    case circle(BaseProps, CircleProps)
    case rectangle(BaseProps, RectangleProps)
    case line(BaseProps, LineProps)
    case image(BaseProps, ImageProps)
    case spriteSheet(BaseProps, SpriteSheetProps)
}

struct BaseProps {
    var x: CGFloat
    var y: CGFloat
    var rotation: CGFloat
    var opacity: CGFloat
    var scaleX: CGFloat
    var scaleY: CGFloat
    var anchorX: CGFloat
    var anchorY: CGFloat
    var mask: ReplayMask
}

struct TextureFont {
    var name: String
    var size: CGFloat
}

enum TextAlign {
    case left
    case center
    case right
}

struct TextProps {
    var font: TextureFont?
    var text: String
    var color: String
    var align: TextAlign
}

struct CircleProps {
    var radius: CGFloat
    var color: String
}

struct RectangleProps {
    var width: CGFloat
    var height: CGFloat
    var color: String
}

struct LineProps {
    var thickness: CGFloat
    var color: String
    var path: [CGPoint]
}

struct ImageProps {
    var fileName: String
    var width: CGFloat
    var height: CGFloat
}

struct SpriteSheetProps {
    var fileName: String
    var columns: CGFloat
    var rows: CGFloat
    var index: CGFloat
    var width: CGFloat
    var height: CGFloat
}
