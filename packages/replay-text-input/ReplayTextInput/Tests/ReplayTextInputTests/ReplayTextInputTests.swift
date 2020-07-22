import XCTest
import Replay
@testable import ReplayTextInput

final class ReplayTextInputTests: XCTestCase {
    let width = 500
    let height = 300

    override func setUp() {
        let input = ReplayTextInputSwift()

        replayViewGlobal = ReplayView(
            frame: CGRect(x: 0, y: 0, width: width, height: height),
            nativeSpriteMap: ["TextInput": input],
            gameJsString: gameJsString
        )

        wait(for: 0.1)
    }

    override func tearDown() {
        // destroy for cleanup
        replayViewGlobal!.touchDown(atPoint: CGPoint(x: width / 2 + 100, y: 0))
        wait(for: 1/60)
        XCTAssertEqual(replayViewGlobal!.subviews.count, 0)

        replayViewGlobal = nil
    }

    func testUpdateSingleLineInput() {
        XCTAssertEqual(replayViewGlobal!.subviews.count, 1)
        XCTAssertTrue(replayViewGlobal!.subviews[0] is UITextField)

        let input = replayViewGlobal!.subviews[0] as! UITextField
        XCTAssertEqual(input.text!, "Hello")

        typeText(textField: input, string: " there")
        wait(for: 1/60)
        XCTAssertEqual(input.text!, "Hello there")
    }

    func testUpdateMultiLineInput() {
        replayViewGlobal!.touchDown(atPoint: CGPoint(x: width / 2 + 102, y: 0))

        wait(for: 1/60)

        XCTAssertEqual(replayViewGlobal!.subviews.count, 1)
        XCTAssertTrue(replayViewGlobal!.subviews[0] is UITextView)

        let input = replayViewGlobal!.subviews[0] as! UITextView
        XCTAssertEqual(input.text, "Hello")

        typeText(textView: input, string: " there")
        wait(for: 1/60)
        XCTAssertEqual(input.text!, "Hello there")
    }

    func testMultipleInputs() {
        replayViewGlobal!.touchDown(atPoint: CGPoint(x: width / 2 + 103, y: 0))
        wait(for: 1/60)
        XCTAssertEqual(replayViewGlobal!.subviews.count, 5)
    }

    func testFixedValueInput() {
        replayViewGlobal!.touchDown(atPoint: CGPoint(x: width / 2 + 104, y: 0))

        wait(for: 1/60)

        let input = replayViewGlobal!.subviews[0] as! UITextField
        XCTAssertEqual(input.text!, "Fixed")

        typeText(textField: input, string: " there")
        wait(for: 1/60)
        XCTAssertEqual(input.text!, "Fixed")
    }

    func typeText(textField input: UITextField, string: String) {
        let endOfText = (input.text ?? "").count

        let _ = (input.delegate! as! TextFieldDelegate).textField(
            input,
            shouldChangeCharactersIn: NSRange(location: endOfText, length: 0),
            replacementString: string
        )
    }
    func typeText(textView input: UITextView, string: String) {
        let _ = (input.delegate! as! TextFieldDelegate).textView(
            input,
            shouldChangeTextIn: NSRange(location: input.text.count, length: 0),
            replacementText: string
        )
    }
}

extension XCTestCase {
    func wait(for duration: TimeInterval) {
        let waitExpectation = expectation(description: "Waiting")

        let when = DispatchTime.now() + duration
        DispatchQueue.main.asyncAfter(deadline: when) {
            waitExpectation.fulfill()
        }

        waitForExpectations(timeout: duration + 0.5)
    }
}
