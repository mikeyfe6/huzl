import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const filePath = resolve(
    "node_modules/expo-modules-jsi/apple/Sources/ExpoModulesJSI/Coding/JavaScriptCodable+Date.swift",
);
const runtimeSchedulerPath = resolve(
    "node_modules/expo-modules-jsi/apple/Sources/ExpoModulesJSI-Cxx/include/RuntimeScheduler.h",
);
const original = "guard milliseconds.isFinite, abs(milliseconds) <= maxJavaScriptDateMilliseconds else {";
const replacement = "guard milliseconds.isFinite, Swift.abs(milliseconds) <= maxJavaScriptDateMilliseconds else {";
const runtimeSchedulerAnnotation = "SWIFT_RETURNS_RETAINED RuntimeScheduler(";

if (existsSync(runtimeSchedulerPath)) {
    const runtimeSchedulerSource = readFileSync(runtimeSchedulerPath, "utf8");
    const patchedRuntimeSchedulerSource = runtimeSchedulerSource.replaceAll(
        runtimeSchedulerAnnotation,
        "RuntimeScheduler(",
    );

    if (patchedRuntimeSchedulerSource !== runtimeSchedulerSource) {
        writeFileSync(runtimeSchedulerPath, patchedRuntimeSchedulerSource);
    }
} else {
    console.warn(`Skipping RuntimeScheduler compatibility fix; file not found: ${runtimeSchedulerPath}`);
}

if (!existsSync(filePath)) {
    console.warn(`Skipping Expo Swift compatibility fix; file not found: ${filePath}`);
    process.exit(0);
}

const source = readFileSync(filePath, "utf8");

if (source.includes(replacement)) {
    process.exit(0);
}

if (!source.includes(original)) {
    console.warn(`Skipping Expo Swift compatibility fix; Expo source has changed: ${filePath}`);
    process.exit(0);
}

writeFileSync(filePath, source.replace(original, replacement));
