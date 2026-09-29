# Keep the JavaScript bridge methods callable from the WebView.
-keepclassmembers class com.jia.games.JiaBridge {
    @android.webkit.JavascriptInterface <methods>;
}
