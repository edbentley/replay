import UIKit

let DEFAULT_FONT_SIZE = CGFloat(12)

class Draw {
    static func transformContext(context: CGContext, baseProps: BaseProps, parentOpacity: CGFloat = 1) {
        let x = baseProps.x
        let y = baseProps.y
        let rotation = baseProps.rotation
        let opacity = baseProps.opacity
        let scaleX = baseProps.scaleX
        let scaleY = baseProps.scaleY
        let anchorX = baseProps.anchorX
        let anchorY = baseProps.anchorY
        
        context.translateBy(x: x, y: y)
        context.rotate(by: deg2rad(rotation))
        context.scaleBy(x: scaleX, y: scaleY)
        context.translateBy(x: -anchorX, y: anchorY)
        context.setAlpha(opacity * parentOpacity)
    }
    
    static func rectangle(context: CGContext, baseProps: BaseProps, rectProps: RectangleProps, parentOpacity: CGFloat) {
        let color = UIColor(hex: rectProps.color).cgColor
        let width = rectProps.width
        let height = rectProps.height

        context.saveGState()
        
        transformContext(context: context, baseProps: baseProps, parentOpacity: parentOpacity)

        context.setFillColor(color)
        context.fill(CGRect(x: -width / 2, y: -height / 2, width: width, height: height))

        context.restoreGState()
    }

    static func line(context: CGContext, baseProps: BaseProps, lineProps: LineProps, parentOpacity: CGFloat) {
        let color = UIColor(hex: lineProps.color).cgColor
        let thickness = lineProps.thickness
        let path = lineProps.path

        context.saveGState()

        transformContext(context: context, baseProps: baseProps, parentOpacity: parentOpacity)

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

    static func text(context: CGContext, baseProps: BaseProps, textProps: TextProps, defaultFont: TextureFont?, parentOpacity: CGFloat) {
        let color = UIColor(hex: textProps.color)
        let text = textProps.text
        let textFont = textProps.font
        let align = textProps.align

        var userFont: UIFont?
        if let textFont = textFont {
            userFont = UIFont(name: textFont.name, size: textFont.size) ?? UIFont.systemFont(ofSize: textFont.size)
        } else if let defaultFont = defaultFont {
            userFont = UIFont(name: defaultFont.name, size: defaultFont.size) ?? UIFont.systemFont(ofSize: defaultFont.size)
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

        context.saveGState()

        transformContext(context: context, baseProps: baseProps, parentOpacity: parentOpacity)
        
        let xOffset: CGFloat
        switch align {
        case .left: xOffset = 0
        case .center: xOffset = -width / 2
        case .right: xOffset = -width
        }

        attributedText.draw(at: CGPoint(x: xOffset, y: -height / 2))

        context.restoreGState()
    }

    static func circle(context: CGContext, baseProps: BaseProps, circleProps: CircleProps, parentOpacity: CGFloat) {
        let color = UIColor(hex: circleProps.color).cgColor
        let radius = circleProps.radius

        context.saveGState()

        transformContext(context: context, baseProps: baseProps, parentOpacity: parentOpacity)

        context.setFillColor(color)
        let rect = CGRect(x: -radius, y: -radius, width: radius * 2, height: radius * 2)
        context.addEllipse(in: rect)
        context.fillPath()

        context.restoreGState()
    }

    static func image(context: CGContext, baseProps: BaseProps, imageProps: ImageProps, parentOpacity: CGFloat) {
        let width = imageProps.width
        let height = imageProps.height
        let fileName = imageProps.fileName

        context.saveGState()

        transformContext(context: context, baseProps: baseProps, parentOpacity: parentOpacity)

        guard let image = UIImage(named: fileName)
            else {
                fatalError("Could not find \(fileName) in your project. Did you forget to add it?")
        }
        image.draw(in: CGRect(x: -width / 2, y: -width / 2, width: width, height: height))

        context.restoreGState()
    }

    static func spriteSheet(context: CGContext, baseProps: BaseProps, spriteSheetProps: SpriteSheetProps, parentOpacity: CGFloat) {
        let columns = spriteSheetProps.columns
        let rows = spriteSheetProps.rows
        let index = spriteSheetProps.index
        let width = spriteSheetProps.width
        let height = spriteSheetProps.height
        let fileName = spriteSheetProps.fileName

        context.saveGState()

        transformContext(context: context, baseProps: baseProps, parentOpacity: parentOpacity)

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
}
