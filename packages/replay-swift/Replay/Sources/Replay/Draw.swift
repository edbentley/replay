import UIKit

let DEFAULT_FONT_SIZE = CGFloat(12)

class Draw {
    static func rectangle(context: CGContext, baseProps: BaseProps, rectProps: RectangleProps) {
        let x = baseProps.x
        let y = baseProps.y
        let rotation = baseProps.rotation
        let opacity = baseProps.opacity
        let scaleX = baseProps.scaleX
        let scaleY = baseProps.scaleY
        let anchorX = baseProps.anchorX
        let anchorY = baseProps.anchorY
        let color = UIColor(hex: rectProps.color).cgColor
        let width = rectProps.width
        let height = rectProps.height

        let offsetX = (width / 2) * anchorX;
        let offsetY = (height / 2) * anchorY;

        context.saveGState()

        context.translateBy(x: x, y: y)
        context.rotate(by: deg2rad(rotation))
        context.scaleBy(x: scaleX, y: scaleY)
        context.translateBy(x: -offsetX, y: offsetY)
        context.setAlpha(opacity)

        context.setFillColor(color)
        context.fill(CGRect(x: -width / 2, y: -height / 2, width: width, height: height))

        context.restoreGState()
    }

    static func line(context: CGContext, baseProps: BaseProps, lineProps: LineProps) {
        let x = baseProps.x
        let y = baseProps.y
        let rotation = baseProps.rotation
        let opacity = baseProps.opacity
        let scaleX = baseProps.scaleX
        let scaleY = baseProps.scaleY
        let anchorX = baseProps.anchorX
        let anchorY = baseProps.anchorY
        let color = UIColor(hex: lineProps.color).cgColor
        let thickness = lineProps.thickness
        let path = lineProps.path

        let (width, height) = Draw.getPathSize(path)
        let offsetX = (width / 2) * anchorX;
        let offsetY = (height / 2) * anchorY;

        context.saveGState()

        context.translateBy(x: x, y: y)
        context.rotate(by: deg2rad(rotation))
        context.scaleBy(x: scaleX, y: scaleY)
        context.translateBy(x: -offsetX, y: offsetY)
        context.setAlpha(opacity)

        context.setStrokeColor(color)
        context.setLineWidth(thickness)

        for (index, point) in path.enumerated() {
            let movedPoint = CGPoint(x: point.x, y: -point.y)
            if index == 0 {
                context.move(to: movedPoint)
                continue
            }
            context.addLine(to: movedPoint)
        }
        context.drawPath(using: .stroke)

        context.restoreGState()
    }

    static func text(context: CGContext, baseProps: BaseProps, textProps: TextProps, defaultFont: TextureFont?) {
        let x = baseProps.x
        let y = baseProps.y
        let rotation = baseProps.rotation
        let opacity = baseProps.opacity
        let scaleX = baseProps.scaleX
        let scaleY = baseProps.scaleY
        let anchorX = baseProps.anchorX
        let anchorY = baseProps.anchorY
        let color = UIColor(hex: textProps.color)
        let text = textProps.text
        let textFont = textProps.font

        var userFont: UIFont?
        if let textFont = textFont {
            userFont = UIFont(name: textFont.name, size: textFont.size)
        } else if let defaultFont = defaultFont {
            userFont = UIFont(name: defaultFont.name, size: defaultFont.size)
        }
        let font = userFont ?? UIFont.systemFont(ofSize: DEFAULT_FONT_SIZE)

        let attributes = [
            NSAttributedString.Key.font: font,
            NSAttributedString.Key.foregroundColor: color
            ] as [NSAttributedString.Key : Any]
        let attributedText = NSAttributedString(string: text, attributes: attributes)
        let textSize = attributedText.boundingRect(
            with: CGSize(width: Int.max, height: Int.max),
            options: .usesLineFragmentOrigin,
            context: nil
        )
        let width = textSize.width
        let height = textSize.height
        let offsetX = (width / 2) * anchorX;
        let offsetY = (height / 2) * anchorY;

        context.saveGState()

        context.translateBy(x: x, y: y)
        context.rotate(by: deg2rad(rotation))
        context.scaleBy(x: scaleX, y: scaleY)
        context.translateBy(x: -offsetX, y: offsetY)
        context.setAlpha(opacity)

        attributedText.draw(at: CGPoint(x: -width / 2, y: -height / 2))

        context.restoreGState()
    }

    static func circle(context: CGContext, baseProps: BaseProps, circleProps: CircleProps) {
        let x = baseProps.x
        let y = baseProps.y
        let rotation = baseProps.rotation
        let opacity = baseProps.opacity
        let scaleX = baseProps.scaleX
        let scaleY = baseProps.scaleY
        let anchorX = baseProps.anchorX
        let anchorY = baseProps.anchorY
        let color = UIColor(hex: circleProps.color).cgColor
        let radius = circleProps.radius

        let offsetX = radius * anchorX;
        let offsetY = radius * anchorY;

        context.saveGState()

        context.translateBy(x: x, y: y)
        context.rotate(by: deg2rad(rotation))
        context.scaleBy(x: scaleX, y: scaleY)
        context.translateBy(x: -offsetX, y: offsetY)
        context.setAlpha(opacity)

        context.setFillColor(color)
        let rect = CGRect(x: -radius, y: -radius, width: radius * 2, height: radius * 2)
        context.addEllipse(in: rect)
        context.fillPath()

        context.restoreGState()
    }

    static func image(context: CGContext, baseProps: BaseProps, imageProps: ImageProps) {
        let x = baseProps.x
        let y = baseProps.y
        let rotation = baseProps.rotation
        let opacity = baseProps.opacity
        let scaleX = baseProps.scaleX
        let scaleY = baseProps.scaleY
        let anchorX = baseProps.anchorX
        let anchorY = baseProps.anchorY
        let width = imageProps.width
        let height = imageProps.height
        let fileName = imageProps.fileName

        let offsetX = (width / 2) * anchorX;
        let offsetY = (height / 2) * anchorY;

        context.saveGState()

        context.translateBy(x: x, y: y)
        context.rotate(by: deg2rad(rotation))
        context.scaleBy(x: scaleX, y: scaleY)
        context.translateBy(x: -offsetX, y: offsetY)
        context.setAlpha(opacity)

        guard let image = UIImage(named: fileName)
            else {
                fatalError("Could not find \(fileName) in your project. Did you forget to add it?")
        }
        image.draw(in: CGRect(x: -width / 2, y: -width / 2, width: width, height: height))

        context.restoreGState()
    }

    static func spriteSheet(context: CGContext, baseProps: BaseProps, spriteSheetProps: SpriteSheetProps) {
        let x = baseProps.x
        let y = baseProps.y
        let rotation = baseProps.rotation
        let opacity = baseProps.opacity
        let scaleX = baseProps.scaleX
        let scaleY = baseProps.scaleY
        let anchorX = baseProps.anchorX
        let anchorY = baseProps.anchorY
        let columns = spriteSheetProps.columns
        let rows = spriteSheetProps.rows
        let index = spriteSheetProps.index
        let width = spriteSheetProps.width
        let height = spriteSheetProps.height
        let fileName = spriteSheetProps.fileName

        let offsetX = (width / 2) * anchorX;
        let offsetY = (height / 2) * anchorY;

        context.saveGState()

        context.translateBy(x: x, y: y)
        context.rotate(by: deg2rad(rotation))
        context.scaleBy(x: scaleX, y: scaleY)
        context.translateBy(x: -offsetX, y: offsetY)
        context.setAlpha(opacity)

        guard let image = UIImage(named: fileName)
            else {
                fatalError("Could not find \(fileName) in your project. Did you forget to add it?")
        }

        let tileWidth = image.size.width / columns
        let tileHeight = image.size.height / rows

        let columnIndex = index.truncatingRemainder(dividingBy: columns)
        let rowIndex = floor(index / columns).truncatingRemainder(dividingBy: rows)

        let cropRect = CGRect(
            x: tileWidth * columnIndex,
            y: tileHeight * rowIndex,
            width: tileWidth,
            height: tileHeight
        )

        let croppedCgImage = image.cgImage!.cropping(to: cropRect)!

        UIImage(cgImage: croppedCgImage)
            .draw(in: CGRect(x: -width / 2, y: -width / 2, width: width, height: height))

        context.restoreGState()
    }

    private static func getPathSize(_ path: [CGPoint]) -> (CGFloat, CGFloat) {
        if (path.count < 2) { return (0, 0) }

        var minX = CGFloat(Int.max)
        var maxX = -CGFloat(Int.max)
        var minY = CGFloat(Int.max)
        var maxY = -CGFloat(Int.max)

        for point in path {
            if (point.x > maxX) {
                maxX = point.x
            }
            if (point.x < minX) {
                minX = point.x
            }
            if (point.y > maxY) {
                maxY = point.y
            }
            if (point.y < minY) {
                minY = point.y
            }
        }

        return (maxX - minX, maxY - minY)
    }
}
