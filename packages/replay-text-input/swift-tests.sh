cd ReplayTextInput
swift package generate-xcodeproj
xcodebuild build -sdk iphoneos -scheme 'ReplayTextInput-Package'
xcodebuild test -destination 'name=iPhone 11' -scheme 'ReplayTextInput-Package'
