import UIKit

struct Size {
    // Which of these is used is determined by user's Xcode project settings
    var portrait: OrientationSize
    var landscape: OrientationSize
}

struct OrientationSize {
    var width: CGFloat
    var height: CGFloat

    var minWidthXL: CGFloat?
    var minHeightXL: CGFloat?

    // default 0
    var maxWidthMargin: CGFloat
    var maxHeightMargin: CGFloat
}

struct GameViewSize: Equatable {
    var gameSize: CGSize
    var offset: CGPoint
    var scale: CGFloat
}

class SizeUtils {
    static func calculateDeviceSize(frame viewSize: CGRect, gameSize: OrientationSize) -> (DeviceSize, GameViewSize) {
        let viewWidthHeightRatio = viewSize.width / viewSize.height;
        let gameWidthHeightRatio = gameSize.width / gameSize.height;

        if (gameWidthHeightRatio > viewWidthHeightRatio) {
            // game is wider than view, so set width to match view and scale height with margin
            let scaledWidth = viewSize.width;
            let noMarginScaledHeight = scaledWidth / gameWidthHeightRatio;
            let scaledMaxHeightMargin =
                (noMarginScaledHeight / gameSize.height) * gameSize.maxHeightMargin;
            let scaledHeight = min(
                viewSize.height,
                noMarginScaledHeight + scaledMaxHeightMargin * 2
            );
            let heightMargin = ((scaledHeight - noMarginScaledHeight) / 2) * (gameSize.height / noMarginScaledHeight)
            let totalGameHeight = gameSize.height + heightMargin * 2
            return (
                DeviceSize(
                    width: cgFloatToNsNumber(gameSize.width),
                    height: cgFloatToNsNumber(gameSize.height),
                    widthMargin: 0,
                    heightMargin: cgFloatToNsNumber(heightMargin),
                    deviceWidth: cgFloatToNsNumber(scaledWidth),
                    deviceHeight: cgFloatToNsNumber(scaledHeight)
                ),
                GameViewSize(
                    gameSize: CGSize(width: gameSize.width, height: totalGameHeight),
                    offset: CGPoint(x: (viewSize.width - gameSize.width) / 2, y: (viewSize.height - totalGameHeight) / 2),
                    scale: viewSize.width / gameSize.width
                )
            )
        } else {
            // game is taller than view, so set height to match view and scale width with margin
            let scaledHeight = viewSize.height;
            let noMarginScaledWidth = scaledHeight * gameWidthHeightRatio;
            let scaledMaxWidthMargin = (noMarginScaledWidth / gameSize.width) * gameSize.maxWidthMargin;
            let scaledWidth = min(
                viewSize.width,
                noMarginScaledWidth + scaledMaxWidthMargin * 2
            );
            let widthMargin = ((scaledWidth - noMarginScaledWidth) / 2) * (gameSize.width / noMarginScaledWidth)
            let totalGameWidth = gameSize.width + widthMargin * 2
            return (
                DeviceSize(
                    width: cgFloatToNsNumber(gameSize.width),
                    height: cgFloatToNsNumber(gameSize.height),
                    widthMargin: cgFloatToNsNumber(widthMargin),
                    heightMargin: 0,
                    deviceWidth: cgFloatToNsNumber(scaledWidth),
                    deviceHeight: cgFloatToNsNumber(scaledHeight)
                ),
                GameViewSize(
                    gameSize: CGSize(width: totalGameWidth, height: gameSize.height),
                    offset: CGPoint(x: (viewSize.width - totalGameWidth) / 2, y: (viewSize.height - gameSize.height) / 2),
                    scale: viewSize.height / gameSize.height
                )
            )
        }
    }

    static func deviceXToGameX(x: CGFloat, deviceSize: DeviceSize) -> CGFloat {
        let width = CGFloat(truncating: deviceSize.width)
        let widthMargin = CGFloat(truncating: deviceSize.widthMargin)
        return x - width / 2 - widthMargin
    }
    static func gameXToDeviceX(x: NSNumber, deviceSize: DeviceSize) -> CGFloat {
        let width = CGFloat(truncating: deviceSize.width)
        let widthMargin = CGFloat(truncating: deviceSize.widthMargin)
        return CGFloat(truncating: x) + width / 2 + widthMargin
    }

    static func deviceYToGameY(y: CGFloat, deviceSize: DeviceSize) -> CGFloat {
        let height = CGFloat(truncating: deviceSize.height)
        let heightMargin = CGFloat(truncating: deviceSize.heightMargin)
        return height / 2 + heightMargin - y
    }
    static func gameYToDeviceY(y: NSNumber, deviceSize: DeviceSize) -> CGFloat {
        let height = CGFloat(truncating: deviceSize.height)
        let heightMargin = CGFloat(truncating: deviceSize.heightMargin)
        return height / 2 + heightMargin - CGFloat(truncating: y)
    }
}
