import XCTest
import SnapshotTesting
@testable import Replay

final class ReplayTests: XCTestCase {
    
    // Take a snapshot of initial game screen.
    // We can't do much more testing inside a web view, most things should be covered in replay-web.
    func testGame() {
        let expectationLoadView = self.expectation(description: "Wait for web view to load")
        let expectationLoadGame = self.expectation(description: "Wait for assets to load")
        
        var logs: [String] = []
        
        let onLoadCallback = { expectationLoadGame.fulfill() }
        let onLogCallback = { logs.append($0) }
        let webView = ReplayWebViewManager(
            useLocalHost: true,
            customGameJsString: gameJsString,
            onLoadCallback: onLoadCallback,
            onLogCallback: onLogCallback
        ).webView!
        webView.frame = .init(x: 0, y: 0, width: 375, height: 812) // iPhone X
        
        let navigationDelegate = NavigationDelegate {
            expectationLoadView.fulfill()
        }
        webView.navigationDelegate = navigationDelegate
        
        // global field for Native Sprite
        let expectationGlobalField = self.expectation(description: "Wait for myGlobalField to be set")
        webView.evaluateJavaScript("window.myGlobalField = { ref: \"there\" }") { (_, err) in
            if let err = err {
                XCTFail(err.localizedDescription)
            }
            expectationGlobalField.fulfill()
        }
        
        wait(for: [expectationGlobalField, expectationLoadView, expectationLoadGame], timeout: 5)
        
        let expectationSnapshot = self.expectation(description: "Wait for snapshot")
        
        webView.takeSnapshot(with: nil) { (image, err) in
            if let err = err {
                XCTFail(err.localizedDescription)
            }
            
            assertSnapshot(matching: image!, as: .image)
            
            expectationSnapshot.fulfill()
        }
        
        wait(for: [expectationSnapshot], timeout: 5)
        
        // Native Sprite logs
        XCTAssertTrue(logs.contains("create Game"))
        XCTAssertTrue(logs.contains("loop hello there Game"))
    }
}
