import { StyleSheet } from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function PlaygroundScreen() {
    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: "#ededed", dark: "#7d7d7d" }}
            headerImage={
                <IconSymbol
                    size={310}
                    color="#fc0"
                    name="sun.righthalf.filled"
                    style={styles.headerImage}
                />
            }
        >
            <ThemedView style={styles.container}>
                <ThemedText type="title">Playground</ThemedText>
                <ThemedText>This is your playground screen!</ThemedText>
            </ThemedView>
        </ParallaxScrollView>
    );
}

const styles = StyleSheet.create({
    headerImage: {
        color: "#808080",
        bottom: -90,
        left: -35,
        position: "absolute",
    },
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
});
