import XCTest
import SnapshotTesting
@testable import Replay

final class ReplayTests: XCTestCase {
    
    // Take a snapshot of initial game screen.
    // We can't do much more testing inside a web view, most things should be covered in replay-web.
    func testGame() {
        let expectationLoadView = self.expectation(description: "Wait for web view to load")
        
        var logs: [String] = []
        
        let gameJsPath = Bundle.module.path(forResource: "game", ofType: "js")!
        let gameJsString = try! String(
            contentsOfFile: gameJsPath,
            encoding: String.Encoding.utf8
        )
        
        let onLogCallback = { logs.append($0) }
        let webView = ReplayWebViewManager(
            customGameJsString: gameJsString,
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
        
        wait(for: [expectationGlobalField, expectationLoadView], timeout: 5)
        
        let expectationSnapshot = self.expectation(description: "Wait for snapshot")
        
        webView.takeSnapshot(with: nil) { (image, err) in
            if let err = err {
                XCTFail(err.localizedDescription)
            }
            
            assertSnapshot(matching: image!, as: .image(precision: 0.99))
            
            expectationSnapshot.fulfill()
        }
        
        wait(for: [expectationSnapshot], timeout: 5)
        
        // Native Sprite logs
        XCTAssertTrue(logs.contains("create Game"))
        XCTAssertTrue(logs.contains("loop hello there Game"))
    }
}
