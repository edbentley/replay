import UIKit

func cgFloatToNsNumber(_ cgFloat: CGFloat) -> NSNumber {
    return NSNumber(value: Double(cgFloat))
}

func deg2rad(_ number: CGFloat) -> CGFloat {
    return number * .pi / 180
}

func deg2rad(_ number: Double) -> Double {
    return number * .pi / 180
}
