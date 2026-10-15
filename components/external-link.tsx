import { Href, Link } from "expo-router";
import { openBrowserAsync, WebBrowserPresentationStyle } from "expo-web-browser";
import { useMemo, type ComponentProps } from "react";
import { StyleSheet } from "react-native";

type Props = Omit<ComponentProps<typeof Link>, "href"> & {
    href: Href & string;
};

export function ExternalLink({ href, theme, style, ...rest }: Props & { theme: ThemeProps }) {
    const styles = useMemo(
        () =>
            StyleSheet.create({
                externalLink: {},
            }),
        [theme],
    );

    return (
        <Link
            target="_blank"
            {...rest}
            href={href}
            style={[styles.externalLink, style]}
            onPress={async (event) => {
                if (process.env.EXPO_OS !== "web") {
                    // Prevent the default behavior of linking to the default browser on native.
                    event.preventDefault();
                    // Open the link in an in-app browser.
                    await openBrowserAsync(href, {
                        presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
                    });
                }
            }}
        />
    );
}
