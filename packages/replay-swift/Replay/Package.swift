// swift-tools-version:5.1

import PackageDescription

let package = Package(
    name: "Replay",
    platforms: [
        .iOS(.v10)
    ],
    products: [
        .library(
            name: "Replay",
            targets: ["Replay"]),
    ],
    targets: [
        .target(
            name: "Replay",
            dependencies: []),
        .testTarget(
            name: "ReplayTests",
            dependencies: ["Replay"]),
    ]
)
