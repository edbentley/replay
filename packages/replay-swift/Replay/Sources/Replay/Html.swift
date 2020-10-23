import Foundation

func getReplayRenderCanvasHtmlString(renderCanvasJsString: String, gameJsString originalGameJsString: String, useLocalHost: Bool) -> (String) {
    var gameJsString = originalGameJsString
    
    let htmlPath = Bundle.module.path(forResource: "index", ofType: ".html")!
    var htmlString = try! String(
        contentsOfFile: htmlPath,
        encoding: String.Encoding.utf8
    )
    var linesInHtmlBeforeGameJs = htmlString.split(separator: "\n").firstIndex(where: { $0.contains("__gameJsString__") }) ?? 0
    
    // don't try to load assets and wrap in try/catch
    if useLocalHost {
        linesInHtmlBeforeGameJs += 1
        gameJsString = """
        try {
            \(gameJsString)
            game.options.assets = {};
        } catch (e) {
            window.webkit.messageHandlers.error.postMessage(`At line ${e.line - \(linesInHtmlBeforeGameJs)} col ${e.column}: ${e.message}`);
        }
        """
    }
    
    htmlString = htmlString.replacingOccurrences(of: "__linesInHtmlBeforeGameJs__", with: String(linesInHtmlBeforeGameJs))
    htmlString = htmlString.replacingOccurrences(of: "__useLocalHostStr__", with: useLocalHost ? "true" : "false")
    htmlString = htmlString.replacingOccurrences(of: "__replayRenderCanvasJsString__", with: renderCanvasJsString)
    htmlString = htmlString.replacingOccurrences(of: "__gameJsString__", with: gameJsString)

    return htmlString
}
