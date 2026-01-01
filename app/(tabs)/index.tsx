import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, greenColor, mediumGreyColor, orangeColor, redColor, whiteColor } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCurrency } from "@/hooks/use-currency";
import { useRefreshContext } from "@/hooks/use-refresh-context";
import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
    const { user, loading, signIn, signUp } = useAuth();
    const { refreshFlag } = useRefreshContext();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? "light"];
    const { symbol: currencySymbol } = useCurrency();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const [expenses, setExpenses] = useState<any[]>([]);
    const [debts, setDebts] = useState<any[]>([]);
    const [isSignUp, setIsSignUp] = useState(false);

    const handleSignIn = async () => {
        setError(null);
        const { error } = await signIn(email.trim(), password);
        if (error) setError(error);
    };

    const handleSignUp = async () => {
        setError(null);
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }
        const { error } = await signUp(email.trim(), password);
        if (error) setError(error);
    };

    const calculateYearlyTotal = (amount: number, freq: "daily" | "monthly" | "yearly"): number => {
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

    const monthlyDebts = useMemo(() => {
        return debts
            .filter((d) => d.pay_per_month && !Number.isNaN(Number(d.pay_per_month)))
            .reduce((sum, d) => sum + Number(d.pay_per_month), 0);
    }, [debts]);

    const monthlyDisposable = useMemo(() => {
        if (monthlyIncome === null) return null;
        return monthlyIncome - totals.monthlyTotal - monthlyDebts;
    }, [monthlyIncome, totals, monthlyDebts]);

    useEffect(() => {
        if (!error) return;
        const timeout = setTimeout(() => setError(null), 7000);
        return () => clearTimeout(timeout);
    }, [error]);

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
        const fetchDebts = async () => {
            try {
                const { data, error } = await supabase.from("debts").select("pay_per_month,active").eq("active", true);
                if (!error && data && isMounted) {
                    setDebts(data);
                }
            } catch (err) {
                console.error("Error fetching debts:", err);
            }
        };

        fetchExpenses();
        fetchDebts();
        return () => {
            isMounted = false;
        };
    }, [user, refreshFlag]);

    const baseGap = { gap: 12 };
    const baseSpace = { gap: 8 };
    const baseWeight = { fontWeight: "600" as const };
    const baseRadius = { borderRadius: 8 };
    const baseBorder = { borderWidth: 1 };

    const baseCenter = {
        alignItems: "center" as const,
        justifyContent: "center" as const,
    };

    const baseInput = {
        ...baseRadius,
        ...baseBorder,
        borderColor: theme.inputBorder,
        backgroundColor: theme.inputBackground,
        outlineWidth: 0,
        minHeight: 44,
    };

    const baseSelect = {
        paddingHorizontal: 12,
        paddingVertical: 10,
    };

    const baseButton = {
        ...baseRadius,
        ...baseCenter,
        paddingVertical: 12,
    };

    const styles = useMemo(
        () =>
            StyleSheet.create({
                container: {
                    ...baseSpace,
                    ...baseCenter,
                    flex: 1,
                    padding: 16,
                },
                image: {
                    width: 350,
                    height: 200,
                    resizeMode: "contain",
                    marginVertical: -12,
                },
                text: {
                    marginTop: 8,
                },
                fieldset: {
                    ...baseGap,
                    width: "100%",
                    marginTop: 16,
                    maxWidth: 500,
                    marginBottom: 64,
                },
                input: {
                    ...baseInput,
                    ...baseSelect,
                    color: theme.inputText,
                },
                signInButton: {
                    ...baseButton,
                    backgroundColor: greenColor,
                },
                signInText: {
                    ...baseWeight,
                    color: whiteColor,
                },
                signUpButton: {
                    ...baseButton,
                    ...baseWeight,
                    ...baseBorder,
                    borderColor: mediumGreyColor,
                },
                signUpText: {
                    ...baseWeight,
                },
                errorStyle: {
                    color: "red",
                    textAlign: "center",
                },
                user: {
                    color: mediumGreyColor,
                },
                statsContainer: {
                    ...baseGap,
                    width: "100%",
                    maxWidth: 400,
                    marginTop: 24,
                    marginBottom: 64,
                },
                statCard: {
                    ...baseSpace,
                    paddingHorizontal: 16,
                    paddingTop: 14,
                    paddingBottom: 18,
                    borderRadius: 12,
                    backgroundColor: theme.cardBackground,
                },
                statLabel: {
                    fontSize: 14,
                    color: theme.statLabel,
                    textAlign: "center",
                },
                statWrapper: {
                    ...baseCenter,
                    flexDirection: "row",
                    gap: 4,
                },
                statValue: {
                    fontSize: 24,
                    fontWeight: "bold",
                    textAlign: "center",
                },
                statCardPositive: {
                    backgroundColor: theme.cardPositiveBackground,
                },
                statCardNegative: {
                    backgroundColor: theme.cardNegativeBackground,
                },
            }),
        [theme]
    );

    const HeaderImage = () => (
        <Image
            source={require("../../assets/images/huzl-logo.png")}
            style={styles.image}
            accessible
            accessibilityLabel="Huzl logo"
        />
    );

    if (loading) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText
                    style={{
                        fontWeight: "600",
                    }}
                >
                    Loading …
                </ThemedText>
            </ThemedView>
        );
    }

    if (!user) {
        return (
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
                <ThemedView style={[styles.container, { flex: 1 }]}>
                    <HeaderImage />
                    <ThemedText type="title">Welcome !</ThemedText>
                    <ThemedText style={styles.text}>
                        {isSignUp ? "Create your account to get started" : "Sign in or create an account to continue"}
                    </ThemedText>
                    <View style={styles.fieldset}>
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
                        {isSignUp && (
                            <TextInput
                                placeholder="confirm password"
                                secureTextEntry
                                value={confirmPassword}
                                autoComplete="off"
                                onChangeText={setConfirmPassword}
                                style={styles.input}
                                placeholderTextColor={theme.placeholder}
                            />
                        )}
                        {isSignUp ? (
                            <>
                                <TouchableOpacity onPress={handleSignUp} style={styles.signInButton}>
                                    <ThemedText style={styles.signInText}>Create Account</ThemedText>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setIsSignUp(false)} style={styles.signUpButton}>
                                    <ThemedText style={styles.signUpText}>Already have an account?</ThemedText>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <TouchableOpacity onPress={handleSignIn} style={styles.signInButton}>
                                    <ThemedText style={styles.signInText}>Sign In</ThemedText>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setIsSignUp(true)} style={styles.signUpButton}>
                                    <ThemedText style={styles.signUpText}>Create Account</ThemedText>
                                </TouchableOpacity>
                            </>
                        )}
                        {error && (
                            <ThemedText style={styles.errorStyle}>
                                {error.charAt(0).toUpperCase() + error.slice(1)}
                            </ThemedText>
                        )}
                    </View>
                </ThemedView>
            </ScrollView>
        );
    }

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
            <ThemedView style={styles.container}>
                <HeaderImage />
                <ThemedText type="title">
                    Hello{" "}
                    {typeof user.user_metadata.display_name === "string" &&
                    user.user_metadata.display_name.trim().length > 0
                        ? user.user_metadata.display_name.trim()
                        : "!"}
                </ThemedText>
                <ThemedText style={styles.text}>
                    Signed in as <ThemedText style={styles.user}>{user.email}</ThemedText>
                </ThemedText>

                <ThemedView style={styles.statsContainer}>
                    {monthlyIncome !== null && (
                        <ThemedView style={styles.statCard}>
                            <ThemedText style={styles.statLabel}>Monthly Income</ThemedText>
                            <View style={styles.statWrapper}>
                                <Ionicons name="add-outline" size={16} color={greenColor} />
                                <ThemedText style={styles.statValue}>
                                    {currencySymbol} {monthlyIncome.toFixed(2)}
                                </ThemedText>
                            </View>
                        </ThemedView>
                    )}

                    <ThemedView style={styles.statCard}>
                        <ThemedText style={styles.statLabel}>Monthly Costs</ThemedText>
                        <View style={styles.statWrapper}>
                            <Ionicons name="remove-outline" size={16} color={redColor} />
                            <ThemedText style={styles.statValue}>
                                {currencySymbol} {totals.monthlyTotal.toFixed(2)}
                            </ThemedText>
                        </View>
                    </ThemedView>

                    <ThemedView style={styles.statCard}>
                        <ThemedText style={styles.statLabel}>Monthly Debts</ThemedText>
                        <View style={styles.statWrapper}>
                            <Ionicons name="alert" size={16} color={orangeColor} />
                            <ThemedText style={styles.statValue}>
                                {currencySymbol} {monthlyDebts.toFixed(2)}
                            </ThemedText>
                        </View>
                    </ThemedView>
                    {monthlyDisposable !== null && (
                        <ThemedView
                            style={[
                                styles.statCard,
                                monthlyDisposable >= 0 ? styles.statCardPositive : styles.statCardNegative,
                            ]}
                        >
                            <ThemedText style={styles.statLabel}>Monthly Remaining</ThemedText>
                            <ThemedText style={styles.statValue}>
                                {currencySymbol} {monthlyDisposable.toFixed(2)}
                            </ThemedText>
                        </ThemedView>
                    )}
                </ThemedView>
            </ThemedView>
        </ScrollView>
    );
}
