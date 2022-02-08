import Foundation

func getReplayRenderCanvasHtmlString(renderCanvasJsString: String, gameJsString: String, userStyles: String, jsRun: String, customJsScripts: [String]) -> String {
    let htmlPath = Bundle.module.path(forResource: "index", ofType: ".html")!
    var htmlString = try! String(
        contentsOfFile: htmlPath,
        encoding: String.Encoding.utf8
    )
    
    htmlString = htmlString.replacingOccurrences(of: "__user_styles__", with: userStyles)
    htmlString = htmlString.replacingOccurrences(of: "__run__", with: jsRun)
    
    let linesInHtmlBeforeGameJs = htmlString
        .components(separatedBy: "\n")
        .firstIndex(where: { $0.contains("__gameJsString__") }) ?? 0
    
    let linesInGameJs = gameJsString.components(separatedBy: "\n").count
    
    htmlString = htmlString.replacingOccurrences(of: "__linesInGameJs__", with: String(linesInGameJs))
    htmlString = htmlString.replacingOccurrences(of: "__linesInHtmlBeforeGameJs__", with: String(linesInHtmlBeforeGameJs))
    htmlString = htmlString.replacingOccurrences(of: "__replayRenderCanvasJsString__", with: renderCanvasJsString)
    htmlString = htmlString.replacingOccurrences(of: "__gameJsString__", with: gameJsString)
    htmlString = htmlString.replacingOccurrences(of: "__customJsScripts__", with: customJsScripts.joined(separator: "\n"))
    
    return htmlString
}
