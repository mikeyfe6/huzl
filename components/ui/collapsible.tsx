import { PropsWithChildren, useState } from "react";
import { Pressable, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

import { baseFlex, baseHorizontal, baseSpace } from "@/styles/base";

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const theme = useColorScheme() ?? "light";

    return (
        <ThemedView>
            <Pressable style={styles.heading} onPress={() => setIsOpen((value) => !value)}>
                <IconSymbol
                    name="chevron.right"
                    size={18}
                    weight="medium"
                    color={theme === "light" ? Colors.light.icon : Colors.dark.icon}
                    style={{
                        transform: [{ rotate: isOpen ? "90deg" : "0deg" }],
                    }}
                />

                <ThemedText type="defaultSemiBold">{title}</ThemedText>
            </Pressable>
            {isOpen && <ThemedView>{children}</ThemedView>}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    heading: {
        ...baseFlex("flex-start", "center"),
        ...baseHorizontal,
        ...baseSpace,
        marginBottom: 16,
    },
});
