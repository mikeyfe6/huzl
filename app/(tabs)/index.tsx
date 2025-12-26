import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
    Colors,
    greenColor,
    mediumGreyColor,
    whiteColor,
} from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useMemo, useState } from "react";
import {
    Platform,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function HomeScreen() {
    const { user, loading, signIn, signUp, signOut } = useAuth();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? "light"];

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const styles = useMemo(
        () =>
            StyleSheet.create({
                container: {
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 8,
                    padding: 16,
                },
                text: {
                    marginTop: 8,
                },
                inputSection: {
                    width: "100%",
                    marginTop: 16,
                    gap: 12,
                    maxWidth: Platform.select({
                        ios: undefined,
                        android: undefined,
                        default: 600,
                    }),
                },
                input: {
                    width: "100%",
                    borderWidth: 1,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    fontSize: 16,
                    borderColor: theme.inputBorder,
                    color: theme.inputText,
                    backgroundColor: theme.inputBackground,
                },
                primaryButton: {
                    backgroundColor: greenColor,
                    paddingVertical: 12,
                    borderRadius: 8,
                    alignItems: "center",
                },
                primaryText: {
                    color: whiteColor,
                    fontWeight: "600",
                    fontSize: 16,
                },
                secondaryButton: {
                    borderWidth: 1,
                    borderColor: mediumGreyColor,
                    paddingVertical: 12,
                    borderRadius: 8,
                    minWidth: 150,
                    alignItems: "center",
                },
                secondaryText: {
                    fontWeight: "600",
                    fontSize: 16,
                },
                errorStyle: {
                    color: "red",
                    textAlign: "center",
                },
            }),
        [theme]
    );

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
            <ThemedView style={styles.container}>
                <ThemedText type="title">Welcome</ThemedText>
                <ThemedText style={styles.text}>Sign in to continue</ThemedText>
                <View style={styles.inputSection}>
                    <TextInput
                        placeholder="you@example.com"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={setEmail}
                        style={styles.input}
                        placeholderTextColor={theme.placeholder}
                    />
                    <TextInput
                        placeholder="password"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                        style={styles.input}
                        placeholderTextColor={theme.placeholder}
                    />
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
                    {error && (
                        <ThemedText style={styles.errorStyle}>
                            {error}
                        </ThemedText>
                    )}
                </View>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <ThemedText type="title">Overview</ThemedText>
            <ThemedText style={styles.text}>
                Signed in as {user.email}
            </ThemedText>
            <TouchableOpacity
                onPress={signOut}
                style={[styles.secondaryButton, { marginTop: 24 }]}
            >
                <ThemedText style={styles.secondaryText}>Sign Out</ThemedText>
            </TouchableOpacity>
        </ThemedView>
    );
}
