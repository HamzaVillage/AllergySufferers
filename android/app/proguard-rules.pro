# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# Google Mobile Ads ProGuard Rules
-keep public class com.google.android.gms.ads.** {
   public *;
}

-keep public class com.google.ads.** {
   public *;
}

-keep class com.google.android.gms.common.config.** { *; }
-keep class com.google.android.gms.internal.** { *; }

# For Mediation (if used)
-keep class com.google.android.gms.ads.mediation.** { *; }
-keep interface com.google.android.gms.ads.mediation.** { *; }

# Firebase (optional but recommended if using Firebase with Ads)
-keep class com.google.firebase.** { *; }
