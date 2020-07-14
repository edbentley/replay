// swift-tools-version:5.2

import PackageDescription

let package = Package(
    name: "ReplayTextInput",
    platforms: [
        .iOS(.v10)
    ],
    products: [
        .library(
            name: "ReplayTextInput",
            targets: ["ReplayTextInput"]),
    ],
    dependencies: [
        .package(path: "../../replay-swift/Replay")
    ],
    targets: [
        .target(
            name: "ReplayTextInput",
            dependencies: ["Replay"]),
        .testTarget(
            name: "ReplayTextInputTests",
            dependencies: ["ReplayTextInput"]),
    ]
)
