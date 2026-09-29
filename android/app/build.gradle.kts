plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.jia.games"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.jia.games"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        // Single source of truth for the version: the VERSION file at the repo root.
        versionName = rootProject.file("../VERSION").readText().trim()
    }

    buildFeatures {
        buildConfig = true
    }

    // The whole kid-facing UI (tabs, games, challenges) is the web app in /web.
    // It is packaged as-is into the APK assets and served by WebViewAssetLoader.
    sourceSets {
        getByName("main") {
            assets.srcDir("../../web")
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }

    // Android Lint (quality check for the Kotlin/Android code). Errors fail the build;
    // warnings are listed in app/build/reports/lint-results-debug.html.
    lint {
        abortOnError = true
        warningsAsErrors = false
        checkDependencies = false
        htmlReport = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.activity:activity-ktx:1.9.3")
    implementation("androidx.webkit:webkit:1.12.1")
}
