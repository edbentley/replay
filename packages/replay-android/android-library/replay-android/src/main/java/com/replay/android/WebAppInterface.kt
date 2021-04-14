package com.replay.android

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.webkit.JavascriptInterface
import java.io.FileNotFoundException

class WebAppInterface(private val replayContext: ReplayActivity) {
    @JavascriptInterface
    fun bridge(
        id: String,
        message: String,
        message2: String,
        message3: String,
        message4: String,
        message5: String
    ) {
        when {
            id == "__internalReplayClipboardCopy" -> copy(id, message)
            id.startsWith("__internalReplayStorageGetItem") -> getItem(id, message)
            id.startsWith("__internalReplayStorageRemoveItem") -> removeItem(id, message)
            id.startsWith("__internalReplayStorageSetItem") -> setItem(id, message, message2)
            id == "__internalReplayAlertOk" ->
                replayContext.showOkDialog(message) { replayContext.jsBridge(id, "") }
            id == "__internalReplayAlertOkCancel" ->
                replayContext.showOkCancelDialog(message) { replayContext.jsBridge(id, if (it) { "true" } else { "false" }) }
            else -> {
                replayContext.onJsCallback(id, message, message2, message3, message4, message5)
            }
        }
    }

    // -- Clipboard

    private fun copy(messageId: String, text: String) {
        val clipboard = replayContext.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
        val clip: ClipData = ClipData.newPlainText("Copy", text)
        clipboard.setPrimaryClip(clip);
        replayContext.jsBridge(messageId, "")
    }

    // -- Storage

    private fun getItem(messageId: String, key: String) {
        try {
            replayContext.openFileInput(key).bufferedReader().use { text ->
                val value = text.readText()
                replayContext.jsBridge(messageId, "{ value: `${value}` }")
            }
        } catch (e: Exception) {
            when (e) {
                is FileNotFoundException -> replayContext.jsBridge(messageId, "{ value: null }")
                else -> replayContext.jsBridge(messageId, "{ error: `${e.localizedMessage}` }")
            }
        }
    }

    private fun removeItem(messageId: String, key: String) {
        try {
            val didDelete = replayContext.deleteFile(key)
            if (didDelete) {
                replayContext.jsBridge(messageId, "")
            } else {
                replayContext.jsBridge(messageId, "`Couldn't delete file`")
            }
        } catch (e: Exception) {
            replayContext.jsBridge(messageId, "`${e.localizedMessage}`")
        }
    }

    private fun setItem(messageId: String, key: String, value: String) {
        try {
            replayContext.openFileOutput(key, Context.MODE_PRIVATE).use { output ->
                output.write(value.toByteArray())
                replayContext.jsBridge(messageId, "")
            }
        } catch (e: Exception) {
            replayContext.jsBridge(messageId, "`${e.localizedMessage}`")
        }
    }
}