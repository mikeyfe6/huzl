const { withAndroidStyles } = require("@expo/config-plugins");

const datePickerColor = "#a4adb4";

module.exports = function withAndroidDatePickerColor(config) {
    return withAndroidStyles(config, (config) => {
        const appTheme = config.modResults.resources.style.find((style) => style.$.name === "AppTheme");

        if (!appTheme) return config;

        appTheme.item ??= [];

        const colorAccent = appTheme.item.find((item) => item.$.name === "colorAccent");

        if (colorAccent) {
            colorAccent._ = datePickerColor;
        } else {
            appTheme.item.push({ $: { name: "colorAccent" }, _: datePickerColor });
        }

        return config;
    });
};
