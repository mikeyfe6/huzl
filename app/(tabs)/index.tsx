import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
    const { user, loading, signIn, signUp, signOut } = useAuth();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? "light"];

    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [error, setError] = React.useState<string | null>(null);

    const handleSignIn = async () => {
        setError(null);
        const { error } = await signIn(email.trim(), password);
        if (error) setError(error);
    };

    const handleSignUp = async () => {
        setError(null);
        const { error } = await signUp(email.trim(), password);
        if (error) setError(error);
    };

    if (loading) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText>Loading…</ThemedText>
            </ThemedView>
        );
    }

    if (!user) {
        return (
            <ThemedView style={[styles.container, { padding: 16 }]}>
                <ThemedText type="title">Welcome</ThemedText>
                <ThemedText style={{ marginTop: 8 }}>
                    Sign in to continue
                </ThemedText>
                <View style={{ width: "100%", marginTop: 16, gap: 12 }}>
                    <TextInput
                        placeholder="you@example.com"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={setEmail}
                        style={[
                            styles.input,
                            {
                                borderColor: theme.inputBorder,
                                color: theme.inputText,
                                backgroundColor: theme.inputBackground,
                            },
                        ]}
                        placeholderTextColor={theme.placeholder}
                    />
                    <TextInput
                        placeholder="password"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                        style={[
                            styles.input,
                            {
                                borderColor: theme.inputBorder,
                                color: theme.inputText,
                                backgroundColor: theme.inputBackground,
                            },
                        ]}
                        placeholderTextColor={theme.placeholder}
                    />
                    {error && (
                        <ThemedText style={{ color: "red" }}>
                            {error}
                        </ThemedText>
                    )}
                    <TouchableOpacity
                        onPress={handleSignIn}
                        style={styles.primaryButton}
                    >
                        <ThemedText style={styles.primaryText}>
                            Sign In
                        </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleSignUp}
                        style={styles.secondaryButton}
                    >
                        <ThemedText style={styles.secondaryText}>
                            Create Account
                        </ThemedText>
                    </TouchableOpacity>
                </View>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <ThemedText type="title">Overview</ThemedText>
            <ThemedText style={{ marginTop: 8 }}>
                Signed in as {user.email}
            </ThemedText>
            <TouchableOpacity
                onPress={signOut}
                style={[styles.secondaryButton, { marginTop: 16 }]}
            >
                <ThemedText style={styles.secondaryText}>Sign Out</ThemedText>
            </TouchableOpacity>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
    },
    input: {
        width: "100%",
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
    },
    primaryButton: {
        backgroundColor: "#2E7D32",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    primaryText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
    },
    secondaryButton: {
        borderWidth: 1,
        borderColor: "#999",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    secondaryText: {
        fontWeight: "600",
        fontSize: 16,
    },
});
