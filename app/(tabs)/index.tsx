import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
    Colors,
    greenColor,
    mediumGreyColor,
    redColor,
    silverColor,
    whiteColor,
} from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCurrency } from "@/hooks/use-currency";
import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
    Platform,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function HomeScreen() {
    const { user, loading, signIn, signUp } = useAuth();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? "light"];
    const { symbol: currencySymbol } = useCurrency();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [expenses, setExpenses] = useState<any[]>([]);

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
                signInButton: {
                    backgroundColor: greenColor,
                    paddingVertical: 12,
                    borderRadius: 8,
                    alignItems: "center",
                },
                signInText: {
                    color: whiteColor,
                    fontWeight: "600",
                    fontSize: 16,
                },
                signUpButton: {
                    borderWidth: 1,
                    borderColor: mediumGreyColor,
                    paddingVertical: 12,
                    borderRadius: 8,
                    minWidth: 150,
                    alignItems: "center",
                },
                signUpText: {
                    fontWeight: "600",
                    fontSize: 16,
                },
                errorStyle: {
                    color: "red",
                    textAlign: "center",
                },
                statsContainer: {
                    gap: 12,
                    width: "100%",
                    maxWidth: 400,
                    marginTop: 24,
                },
                statCard: {
                    padding: 16,
                    borderRadius: 12,
                    backgroundColor: theme.cardBackground,
                },
                statCardPositive: {
                    backgroundColor: theme.statCardPositiveBackground,
                },
                statCardNegative: {
                    backgroundColor: theme.statCardNegativeBackground,
                },
                statWrapper: {
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                },
                statLabel: {
                    fontSize: 14,
                    color: silverColor,
                    marginBottom: 8,
                    textAlign: "center",
                },
                statValue: {
                    fontSize: 24,
                    fontWeight: "bold",
                    textAlign: "center",
                },
                greyText: {
                    color: mediumGreyColor,
                },
            }),
        [theme]
    );

    const calculateYearlyTotal = (
        amount: number,
        freq: "daily" | "monthly" | "yearly"
    ): number => {
        const num = Number.parseFloat(amount.toString());
        if (Number.isNaN(num)) return 0;

        switch (freq) {
            case "daily":
                return num * 365;
            case "monthly":
                return num * 12;
            case "yearly":
                return num;
            default:
                return 0;
        }
    };

    useEffect(() => {
        if (!user) return;

        let isMounted = true;
        const fetchExpenses = async () => {
            try {
                const { data, error } = await supabase
                    .from("expenses")
                    .select("amount,frequency,active")
                    .eq("active", true);
                if (!error && data && isMounted) {
                    setExpenses(data);
                }
            } catch (err) {
                console.error("Error fetching expenses:", err);
            }
        };

        fetchExpenses();
        return () => {
            isMounted = false;
        };
    }, [user]);

    const monthlyIncome = useMemo(() => {
        const val = (user?.user_metadata as any)?.monthly_income;
        if (typeof val === "number") return val;
        if (val) return Number.parseFloat(String(val));
        return null;
    }, [user]);

    const totals = useMemo(() => {
        let monthlyTotal = 0;
        let yearlyTotal = 0;

        expenses.forEach((expense) => {
            const amount = Number.parseFloat(String(expense.amount));
            const yearly = calculateYearlyTotal(amount, expense.frequency);
            yearlyTotal += yearly;
            monthlyTotal += yearly / 12;
        });

        return { monthlyTotal, yearlyTotal };
    }, [expenses]);

    const monthlyDisposable = useMemo(() => {
        if (monthlyIncome === null) return null;
        return monthlyIncome - totals.monthlyTotal;
    }, [monthlyIncome, totals]);

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
                <ThemedText type="title">Welcome at Huzl</ThemedText>
                <ThemedText style={styles.text}>Sign in to continue</ThemedText>
                <View style={styles.inputSection}>
                    <TextInput
                        placeholder="you@example.com"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        autoComplete="email"
                        value={email}
                        onChangeText={setEmail}
                        style={styles.input}
                        placeholderTextColor={theme.placeholder}
                    />
                    <TextInput
                        placeholder="password"
                        secureTextEntry
                        value={password}
                        autoComplete="password"
                        onChangeText={setPassword}
                        style={styles.input}
                        placeholderTextColor={theme.placeholder}
                    />
                    <TouchableOpacity
                        onPress={handleSignIn}
                        style={styles.signInButton}
                    >
                        <ThemedText style={styles.signInText}>
                            Sign In
                        </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleSignUp}
                        style={styles.signUpButton}
                    >
                        <ThemedText style={styles.signUpText}>
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
            <ThemedText type="title">Huzl</ThemedText>
            <ThemedText style={styles.text}>
                Signed in as{" "}
                <ThemedText style={styles.greyText}>{user.email}</ThemedText>
            </ThemedText>

            <ThemedView style={styles.statsContainer}>
                {monthlyIncome !== null && (
                    <ThemedView style={styles.statCard}>
                        <ThemedText style={styles.statLabel}>
                            Monthly Income
                        </ThemedText>
                        <View style={styles.statWrapper}>
                            <Ionicons
                                name="add-outline"
                                size={16}
                                color={greenColor}
                            />
                            <ThemedText style={styles.statValue}>
                                {currencySymbol} {monthlyIncome.toFixed(2)}
                            </ThemedText>
                        </View>
                    </ThemedView>
                )}

                <ThemedView style={styles.statCard}>
                    <ThemedText style={styles.statLabel}>
                        Monthly Costs
                    </ThemedText>
                    <View style={styles.statWrapper}>
                        <Ionicons
                            name="remove-outline"
                            size={16}
                            color={redColor}
                        />
                        <ThemedText style={styles.statValue}>
                            {currencySymbol} {totals.monthlyTotal.toFixed(2)}
                        </ThemedText>
                    </View>
                </ThemedView>

                {monthlyDisposable !== null && (
                    <ThemedView
                        style={[
                            styles.statCard,
                            monthlyDisposable >= 0
                                ? styles.statCardPositive
                                : styles.statCardNegative,
                        ]}
                    >
                        <ThemedText style={styles.statLabel}>
                            Monthly Remaining
                        </ThemedText>
                        <ThemedText style={styles.statValue}>
                            {currencySymbol} {monthlyDisposable.toFixed(2)}
                        </ThemedText>
                    </ThemedView>
                )}
            </ThemedView>
        </ThemedView>
    );
}
