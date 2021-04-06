package com.replay.devgame

import android.util.Log
import com.replay.android.ReplayActivity

class MainActivity : ReplayActivity() {
    override fun onJsCallback(
        id: String,
        message: String,
        message2: String,
        message3: String,
        message4: String,
        message5: String
    ) {
        if (id == "Test") {
            Log.d("JsTest1", message)
            Log.d("JsTest2", message2)

            jsBridge(id, "`Kotlin`")
        }
    }
}