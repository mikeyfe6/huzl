import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const filePath = resolve(
    "node_modules/expo-modules-jsi/apple/Sources/ExpoModulesJSI/Coding/JavaScriptCodable+Date.swift",
);
const original = "guard milliseconds.isFinite, abs(milliseconds) <= maxJavaScriptDateMilliseconds else {";
const replacement = "guard milliseconds.isFinite, Swift.abs(milliseconds) <= maxJavaScriptDateMilliseconds else {";
const source = readFileSync(filePath, "utf8");

if (source.includes(replacement)) {
    process.exit(0);
}

if (!source.includes(original)) {
    throw new Error(`Unable to apply the Expo Swift compatibility fix to ${filePath}.`);
}

writeFileSync(filePath, source.replace(original, replacement));
