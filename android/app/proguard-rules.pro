# Capacitor / WebView release keep rules
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

-keep class com.getcapacitor.** { *; }
-keep class com.getcapacitor.plugin.** { *; }
-keepclassmembers class * {
    @com.getcapacitor.PluginMethod <methods>;
}

-dontwarn com.getcapacitor.**
