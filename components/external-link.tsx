import { Href, Link } from "expo-router";
import { openBrowserAsync, WebBrowserPresentationStyle } from "expo-web-browser";
import { useMemo, type ComponentProps } from "react";
import { StyleSheet } from "react-native";

import { baseFlex, baseOutline } from "@/styles/base";

type Props = Omit<ComponentProps<typeof Link>, "href"> & {
    href: Href & string;
};

export function ExternalLink({ href, theme, ...rest }: Props & { theme: ThemeProps }) {
    const styles = useMemo(
        () =>
            StyleSheet.create({
                externalLink: {
                    ...baseOutline(theme),
                    ...baseFlex("center", "center"),
                    display: "flex",
                    gap: 6,
                },
            }),
        [theme],
    );

    return (
        <Link
            target="_blank"
            {...rest}
            href={href}
            style={styles.externalLink}
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
