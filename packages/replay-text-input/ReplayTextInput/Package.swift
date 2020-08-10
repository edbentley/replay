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
//        Uncomment below for local development with dev-game
//        .package(path: "../../replay-swift/Replay")
        .package(name: "Replay", url: "https://github.com/edbentley/replay-swift.git", .exact("0.4.0"))
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
