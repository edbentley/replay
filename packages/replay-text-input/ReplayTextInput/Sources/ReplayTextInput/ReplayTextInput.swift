import UIKit
import JavaScriptCore
import Replay

var textFieldMap: [String: (UITextFieldOrView, TextFieldDelegate)] = [:]

@objc public class ReplayTextInputSwift : NSObject, ReplayNativeSpriteImplementation {
    
    public var create: @convention(block) (JSValue) -> NSDictionary = { argsObj in
        let args = ReplayNativeSpriteArgs.parseCreateArgs(argsObj)
        
        let props = Utils.parseProps(args.props)
        
        let textFieldOrView: UITextFieldOrView
        
        let textFieldDelegate = TextFieldDelegate(
            onChangeText: props.onChangeText,
            updateCaretPosition: { caretPosition in
                args.updateState(["caretPosition": caretPosition])
            }
        )
        
        if props.numberOfLines > 1 {
            // Multi-line
            let textView = UITextView()
            textView.delegate = textFieldDelegate
            
            Utils.addToView(textView)
            
            textFieldOrView = .textView(textView)
        } else {
            // Single-line
            let textField = UITextField()
            textField.delegate = textFieldDelegate
            textField.contentVerticalAlignment = UIControl.ContentVerticalAlignment.center
            
            Utils.addToView(textField)
            
            textFieldOrView = .textField(textField)
        }
        
        let textFieldMapId = "\(args.parentGlobalId)--\(props.id)"
        textFieldMap[textFieldMapId] = (textFieldOrView, textFieldDelegate)
        
        Utils.updateTextFieldOrView(textFieldOrView: textFieldOrView, props: props, caretPosition: nil, utils: args.utils)
        
        return [
            "textFieldMapId": textFieldMapId,
            "storedProps": [
                "fontName": props.fontName,
                "fontSize": props.fontSize,
                "text": props.text,
                "numberOfLines": props.numberOfLines,
                "align": props.align,
                "color": props.color,
                "width": props.width,
                "x": props.x,
                "y": props.y
            ]
        ]
    }
    
    public var loop: @convention(block) (JSValue) -> NSDictionary = { argsObj in
        let args = ReplayNativeSpriteArgs.parseLoopArgs(argsObj)
        
        let props = Utils.parseProps(args.props)
        
        let storedProps: [String: Any] = [
            "fontName": props.fontName,
            "fontSize": props.fontSize,
            "text": props.text,
            "numberOfLines": props.numberOfLines,
            "align": props.align,
            "color": props.color,
            "width": props.width,
            "x": props.x,
            "y": props.y
        ]
        let prevStoredProps = args.state.forProperty("storedProps")!.toDictionary()!
        let textFieldMapId = args.state.forProperty("textFieldMapId")!.toString()!
        let caretPosition = Utils.parseOptionalField(args.state, key: "caretPosition")?.toInt32()
        
        if !NSDictionary(dictionary: storedProps).isEqual(to: prevStoredProps) {
            let (textFieldOrView, _) = textFieldMap[textFieldMapId]!
            Utils.updateTextFieldOrView(
                textFieldOrView: textFieldOrView,
                props: props,
                caretPosition: caretPosition,
                utils: args.utils
            )
        }
        
        let (_, textFieldDelegate) = textFieldMap[textFieldMapId]!
        textFieldDelegate.onChangeText = props.onChangeText
        
        var nextState: [String: Any] = [
            "textFieldMapId": textFieldMapId,
            "storedProps": storedProps
        ]
        if let caretPosition = caretPosition {
            nextState["caretPosition"] = caretPosition
        }
        return nextState as NSDictionary
    }
    
    public var cleanup: @convention(block) (JSValue) -> Void = { argsObj in
        let args = ReplayNativeSpriteArgs.parseCleanupArgs(argsObj)
        
        let textFieldMapId = args.state.forProperty("textFieldMapId")!.toString()!
        
        let (textFieldOrView, _) = textFieldMap[textFieldMapId]!
        
        switch textFieldOrView {
        case .textField(let textField):
            textField.removeFromSuperview()
        case .textView(let textView):
            textView.removeFromSuperview()
        }
        
        textFieldMap.removeValue(forKey: textFieldMapId)
    }
    
}

enum UITextFieldOrView {
    case textView(UITextView)
    case textField(UITextField)
}

class TextFieldDelegate: NSObject, UITextFieldDelegate, UITextViewDelegate {
    var onChangeText: (String) -> Void
    var updateCaretPosition: (Int) -> Void
    
    init(
        onChangeText: @escaping (String) -> Void,
        updateCaretPosition: @escaping (Int) -> Void
    ) {
        self.onChangeText = onChangeText
        self.updateCaretPosition = updateCaretPosition
    }
    
    func textField(_ textField: UITextField, shouldChangeCharactersIn range: NSRange, replacementString string: String) -> Bool {
        return handleChange(textField, shouldChangeTextIn: range, replacementText: string, currText: textField.text ?? "")
    }
    
    func textView(_ textView: UITextView, shouldChangeTextIn range: NSRange, replacementText text: String) -> Bool {
        return handleChange(textView, shouldChangeTextIn: range, replacementText: text, currText: textView.text)
    }
    
    func handleChange(_ textInput: UITextInput, shouldChangeTextIn range: NSRange, replacementText text: String, currText prevText: String) -> Bool {
        let newText = (prevText as NSString).replacingCharacters(in: range, with: text)
        
        onChangeText(newText)
        
        if let selectedRange = textInput.selectedTextRange {
            let caretPosition = textInput.offset(from: textInput.beginningOfDocument, to: selectedRange.end)
            updateCaretPosition(caretPosition + 1)
        }
        
        return false
    }
}

struct Props {
    var id: String
    var fontName: String
    var fontSize: CGFloat
    var text: String
    var onChangeText: (String) -> Void
    var numberOfLines: Int
    var align: TextAlign
    var color: String
    var width: CGFloat
    var x: CGFloat
    var y: CGFloat
}

enum TextAlign {
    case left
    case center
    case right
}

class Utils {
    static func parseProps(_ propsObj: JSValue) -> Props {
        let id = propsObj.forProperty("id")!.toString()!
        let fontName = propsObj.forProperty("fontName")!.toString()!
        let fontSize = propsObj.forProperty("fontSize")!.toNumber()!
        let text = propsObj.forProperty("text")!.toString()!
        let onChangeText = propsObj.forProperty("onChangeText")!
        let numberOfLines = parseOptionalField(propsObj, key: "numberOfLines")?.toNumber() ?? 1
        
        let alignString = parseOptionalField(propsObj, key: "align")?.toString() ?? "center"
        let align: TextAlign
        switch alignString {
        case "left": align = .left
        case "center", "undefined": align = .center
        case "right": align = .right
        default: fatalError("Unimplemented text align \(alignString)")
        }
        
        let color = parseOptionalField(propsObj, key: "color")?.toString() ?? "black"
        let width = propsObj.forProperty("width")!.toNumber()!
        
        let x = parseOptionalField(propsObj, key: "x")?.toNumber() ?? 0
        let y = parseOptionalField(propsObj, key: "y")?.toNumber() ?? 0
        
        return Props(
            id: id,
            fontName: fontName,
            fontSize: CGFloat(truncating: fontSize),
            text: text,
            onChangeText: { text in
                onChangeText.call(withArguments: [text])
        },
            numberOfLines: Int(truncating: numberOfLines),
            align: align,
            color: color,
            width: CGFloat(truncating: width),
            x: CGFloat(truncating: x),
            y: CGFloat(truncating: y)
        )
    }
    
    // Use this to avoid "undefined" being returned
    static func parseOptionalField(_ object: JSValue, key: String) -> JSValue? {
        if !object.hasProperty(key) {
            return nil
        }
        let value = object.forProperty(key)
        if let val = value {
            if val.isUndefined {
                return nil
            }
        }
        return value
    }
    
    static func updateTextFieldOrView(textFieldOrView: UITextFieldOrView, props: Props, caretPosition: Int32?, utils: ReplayNativeSpriteUtilsJS) {
        switch textFieldOrView {
        case .textField(let textField):
            updateTextField(textField: textField, props: props, caretPosition: caretPosition, utils: utils)
        case .textView(let textView):
            updateTextView(textView: textView, props: props, caretPosition: caretPosition, utils: utils)
        }
    }
    
    static func updateTextField(textField: UITextField, props: Props, caretPosition: Int32?, utils: ReplayNativeSpriteUtilsJS) {
        let height = props.fontSize * 1.2
        
        let x = CGFloat(truncating: utils.gameXToPlatformX(Utils.cgFloatToNsNumber(props.x)))
        let y = CGFloat(truncating: utils.gameYToPlatformY(Utils.cgFloatToNsNumber(props.y)))
        
        textField.frame = CGRect(x: x - props.width / 2, y: y - height / 2, width: props.width, height: height)
        textField.text = props.text
        textField.borderStyle = UITextField.BorderStyle.roundedRect
        textField.font = UIFont(name: props.fontName, size: props.fontSize) ?? UIFont.systemFont(ofSize: props.fontSize)
        textField.textColor = UIColor(hex: props.color)
        
        switch props.align {
        case .center: textField.textAlignment = .center
        case .left: textField.textAlignment = .left
        case .right: textField.textAlignment = .right
        }
        
        // Reapply caret position after setting value
        if let caretPosition = caretPosition,
            let textPosition = textField.position(from: textField.beginningOfDocument, offset: Int(caretPosition)) {
            textField.selectedTextRange = textField.textRange(from: textPosition, to: textPosition)
        }
    }
    
    static func updateTextView(textView: UITextView, props: Props, caretPosition: Int32?, utils: ReplayNativeSpriteUtilsJS) {
        let padding = textView.textContainerInset.top + textView.textContainerInset.bottom
        let height = CGFloat(props.numberOfLines) * props.fontSize * 1.2 + padding // * 1.2 for line spacing
        
        let x = CGFloat(truncating: utils.gameXToPlatformX(Utils.cgFloatToNsNumber(props.x)))
        let y = CGFloat(truncating: utils.gameYToPlatformY(Utils.cgFloatToNsNumber(props.y)))
        
        textView.frame = CGRect(x: x - props.width / 2, y: y - height / 2, width: props.width, height: height)
        textView.text = props.text
        textView.layer.borderColor = UIColor.gray.cgColor
        textView.layer.borderWidth = 1
        textView.font = UIFont(name: props.fontName, size: props.fontSize) ?? UIFont.systemFont(ofSize: props.fontSize)
        textView.textColor = UIColor(hex: props.color)
        
        switch props.align {
        case .center: textView.textAlignment = .center
        case .left: textView.textAlignment = .left
        case .right: textView.textAlignment = .right
        }
        
        // Reapply caret position after setting value
        if let caretPosition = caretPosition,
            let textPosition = textView.position(from: textView.beginningOfDocument, offset: Int(caretPosition)) {
            textView.selectedTextRange = textView.textRange(from: textPosition, to: textPosition)
        }
    }
    
    // If we have an input on the first frame, the view isn't initialised yet,
    // so we defer until it's ready
    static func addToView(_ textInput: UIView) {
        if let view = replayViewGlobal {
            view.addSubview(textInput)
        } else {
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                addToView(textInput)
            }
        }
    }
    
    static func cgFloatToNsNumber(_ cgFloat: CGFloat) -> NSNumber {
        return NSNumber(value: Double(cgFloat))
    }
}
