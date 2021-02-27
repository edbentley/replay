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
        
        var webView: ReplayWebView!
        
        let storageExpectation1 = self.expectation(description: "item1 set")
        let storageExpectation2 = self.expectation(description: "item1 removed")
        let storageExpectation3 = self.expectation(description: "item2 not set")
        
        let onLogCallback = { (value: String) in
            logs.append(value)
            
            // Check async callbacks
            if value == "item1 set: hi" {
                storageExpectation1.fulfill()
            }
            if value == "item1 removed: null" {
                storageExpectation2.fulfill()
            }
            if value == "item2: null" {
                storageExpectation3.fulfill()
            }
        }
        
        webView = ReplayWebViewManager(
            customGameJsString: gameJsString,
            onLogCallback: onLogCallback,
            onJsCallback: { (message) in
                if (message == "Hello!") {
                    webView?.jsBridge(messageId: "TestBridge", jsArg: "{ response: `Hi!` }")
                }
            }
        ).webView
        
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
        
        // JS / Swift Bridge
        XCTAssertTrue(logs.contains("Bridge response: Hi!"))
        
        // Storage
        wait(for: [storageExpectation1, storageExpectation2, storageExpectation3], timeout: 5)
        
        // Clipboard
        XCTAssertTrue(logs.contains("Copied!"))
        XCTAssertEqual(UIPasteboard.general.string, "some_text")
    }
}
