cd Replay
swift package generate-xcodeproj
xcodebuild build -sdk iphoneos -scheme 'Replay-Package'
xcodebuild test -destination 'name=iPhone 11' -scheme 'Replay-Package'
