plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
    id("io.gitlab.arturbosch.detekt")
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
        compose = true
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

// Kotlin static analysis (see android/config/detekt.yml). Run: ./gradlew detekt
detekt {
    buildUponDefaultConfig = true
    config.setFrom(rootProject.file("config/detekt.yml"))
    source.setFrom("src/main/java", "src/test/java")
}

dependencies {
    val lifecycle = "2.8.7"
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.activity:activity-ktx:1.9.3")
    implementation("androidx.activity:activity-compose:1.9.3")
    implementation("androidx.webkit:webkit:1.12.1")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:$lifecycle")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:$lifecycle")
    implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:$lifecycle")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:$lifecycle")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")

    implementation(platform("androidx.compose:compose-bom:2024.12.01"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.foundation:foundation")
    implementation("androidx.compose.material3:material3")

    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.9.0")
}
