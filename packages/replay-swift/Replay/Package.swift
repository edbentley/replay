// swift-tools-version:5.3

import PackageDescription

let package = Package(
    name: "Replay",
    platforms: [
        .iOS(.v11)
    ],
    products: [
        .library(
            name: "Replay",
            targets: ["Replay"]),
    ],
    dependencies: [
        .package(name: "SnapshotTesting", url: "https://github.com/pointfreeco/swift-snapshot-testing.git", from: "1.8.1"),
    ],
    targets: [
        .target(
            name: "Replay",
            dependencies: [],
            resources: [
                .process("Resources")
            ]),
        .testTarget(
            name: "ReplayTests",
            dependencies: ["Replay", "SnapshotTesting"],
            exclude: ["__Snapshots__"],
            resources: [
                .process("game.js")
            ]
        ),
    ]
)
