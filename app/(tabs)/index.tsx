import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Link } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCurrency } from "@/hooks/use-currency";
import { useRefreshContext } from "@/hooks/use-refresh-context";

import { supabase } from "@/utils/supabase";

import { ForgotPasswordModal } from "@/components/modal/forgot-password-modal";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

import { Colors, greenColor, mediumGreyColor, orangeColor, redColor, whiteColor } from "@/constants/theme";
import {
    baseBold,
    baseBorder,
    baseButton,
    baseCenter,
    baseCorner,
    baseError,
    baseFlex,
    baseGap,
    baseInput,
    baseLarge,
    baseSelect,
    baseSmall,
    baseSpace,
    baseSuccess,
    baseWeight,
} from "@/styles/base";

export default function HomeScreen() {
    const { t } = useTranslation();
    const { user, loading, signIn, signUp } = useAuth();
    const { refreshFlag } = useRefreshContext();

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? "light"];
    const { symbol: currencySymbol } = useCurrency();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [debts, setDebts] = useState<any[]>([]);
    const [isSignUp, setIsSignUp] = useState(false);
    const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);

    const mapAuthError = (err: unknown) => {
        const code = (err as any)?.code;

        if (code === "invalid_credentials") return t("auth.error.invalidCredentials");
        if (code === "email_not_confirmed") return t("auth.error.emailNotConfirmed");
        if (code === "too_many_requests") return t("auth.error.rateLimited");

        return t("auth.error.generic");
    };

    const handleSignIn = async () => {
        setError(null);
        if (!email.trim() || !password.trim()) {
            setError(t("auth.error.missingCredentials"));
            return;
        }
        const { error } = await signIn(email.trim(), password);
        if (error) {
            setError(mapAuthError(error));
        }
    };

    const handleSignUp = async () => {
        setError(null);
        setRegistrationSuccess(false);
        if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
            setError(t("auth.error.missingCredentials"));
            return;
        }
        if (password !== confirmPassword) {
            setError(t("auth.error.passwordMismatch"));
            return;
        }
        if (password.length < 6) {
            setError(t("auth.error.passwordTooShort"));
            return;
        }
        const { error, success, user } = await signUp(email.trim(), password);
        if (error) {
            setError(mapAuthError(error));
        } else if (user && Array.isArray(user.identities) && user.identities.length === 0) {
            setError(t("auth.error.alreadyRegistered"));
        } else if (success) {
            setRegistrationSuccess(true);
            setIsSignUp(false);
            setPassword("");
            setConfirmPassword("");
        }
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

    const [monthlyIncome, setMonthlyIncome] = useState<number | null>(null);

    useFocusEffect(
        useCallback(() => {
            if (!user) {
                setMonthlyIncome(null);
                return;
            }
            supabase
                .from("incomes")
                .select("amount")
                .eq("user_id", user.id)
                .then(({ data, error }) => {
                    if (error || !Array.isArray(data)) {
                        setMonthlyIncome(null);
                    } else {
                        const total = data.reduce((sum, row) => {
                            const amt =
                                typeof row.amount === "number" ? row.amount : Number.parseFloat(String(row.amount));
                            return sum + (Number.isNaN(amt) ? 0 : amt);
                        }, 0);
                        setMonthlyIncome(total);
                    }
                });
        }, [user]),
    );

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
        if (!registrationSuccess) return;
        const timeout = setTimeout(() => setRegistrationSuccess(false), 10000);
        return () => clearTimeout(timeout);
    }, [registrationSuccess]);

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

    const styles = useMemo(
        () =>
            StyleSheet.create({
                logo: { ...baseFlex("center", "center"), gap: 8, marginBottom: 32 },
                image: {
                    maxWidth: 100,
                    height: 100,
                },
                container: {
                    ...baseCenter,
                    ...baseSpace,
                    flex: 1,
                    padding: 16,
                },
                text: {
                    marginTop: 8,
                },
                fieldset: {
                    ...baseGap,
                    width: "100%",
                    marginTop: 16,
                    maxWidth: 500,
                    marginBottom: 32,
                },
                input: {
                    ...baseInput(theme),
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
                forgetButton: {
                    ...baseFlex("center", "center"),
                    minHeight: 44,
                },
                forgetButtonText: {
                    ...baseSmall,
                    ...baseWeight,
                    textAlign: "center",
                    color: mediumGreyColor,
                },
                termsText: {
                    color: mediumGreyColor,
                    marginHorizontal: "auto",
                    textAlign: "center",
                    maxWidth: "90%",
                    lineHeight: Platform.select({
                        ios: 26,
                        android: 26,
                        default: 12,
                    }),
                    fontSize: Platform.select({
                        ios: 14,
                        android: 14,
                        default: 12,
                    }),
                },
                termsLink: {
                    fontSize: Platform.select({
                        ios: 14,
                        android: 14,
                        default: 12,
                    }),
                },
                errorContainer: { ...baseCenter, minHeight: 44 },
                errorText: {
                    ...baseError,
                },
                successText: {
                    ...baseSuccess,
                },
                errorHidden: {
                    opacity: 0,
                },
                user: {
                    color: mediumGreyColor,
                },
                terminate: {
                    ...baseError,
                },
                statsContainer: {
                    ...baseGap,
                    width: "100%",
                    maxWidth: 500,
                    marginTop: 24,
                    marginBottom: 40,
                },
                statCard: {
                    ...baseSpace,
                    ...baseCorner,
                    paddingHorizontal: 16,
                    paddingTop: 14,
                    paddingBottom: 18,
                    backgroundColor: theme.cardBackground,
                },
                statLabel: {
                    ...baseSmall,
                    color: theme.statLabel,
                    textAlign: "center",
                },
                statWrapper: {
                    ...baseFlex("center", "center"),
                    gap: 4,
                },
                statValue: {
                    ...baseLarge,
                    ...baseBold,
                    textAlign: "center",
                },
                statCardPositive: {
                    backgroundColor: theme.cardPositiveBackground,
                },
                statCardNegative: {
                    backgroundColor: theme.cardNegativeBackground,
                },
            }),
        [theme],
    );

    const HeaderImage = () => (
        <View style={styles.logo} pointerEvents="none">
            <Image
                source={require("../../assets/images/huzl-icon.png")}
                style={styles.image}
                accessible
                accessibilityLabel="Huzl logo"
                resizeMode="contain"
            />
            <ThemedText type="logo">huzl</ThemedText>
        </View>
    );

    if (loading) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText style={baseWeight}>{t("common.loading")}</ThemedText>
            </ThemedView>
        );
    }

    if (!user) {
        return (
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
                <ThemedView style={styles.container}>
                    <HeaderImage />
                    <ThemedText type="title">{t("common.welcome")}</ThemedText>
                    <ThemedText style={styles.text}>
                        {isSignUp ? t("auth.getStarted") : t("auth.signInOrCreate")}
                    </ThemedText>
                    <View style={styles.fieldset}>
                        <TextInput
                            placeholder={t("auth.placeholder.email")}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            autoComplete="email"
                            value={email}
                            onChangeText={setEmail}
                            style={styles.input}
                            placeholderTextColor={theme.placeholder}
                        />
                        <TextInput
                            placeholder={t("auth.placeholder.password")}
                            secureTextEntry
                            value={password}
                            autoComplete="password"
                            onChangeText={setPassword}
                            style={styles.input}
                            placeholderTextColor={theme.placeholder}
                            onSubmitEditing={handleSignIn}
                        />
                        {isSignUp && (
                            <TextInput
                                placeholder={t("auth.placeholder.confirmPassword")}
                                secureTextEntry
                                value={confirmPassword}
                                autoComplete="off"
                                onChangeText={setConfirmPassword}
                                style={styles.input}
                                placeholderTextColor={theme.placeholder}
                            />
                        )}
                        {isSignUp ?
                            <>
                                <TouchableOpacity onPress={handleSignUp} style={styles.signInButton}>
                                    <ThemedText style={styles.signInText}>{t("auth.createAccount")}</ThemedText>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setIsSignUp(false)} style={styles.signUpButton}>
                                    <ThemedText style={styles.signUpText}>{t("auth.alreadyHaveAccount")}</ThemedText>
                                </TouchableOpacity>
                            </>
                        :   <>
                                <TouchableOpacity onPress={handleSignIn} style={styles.signInButton}>
                                    <ThemedText style={styles.signInText}>{t("auth.signIn")}</ThemedText>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setIsSignUp(true)} style={styles.signUpButton}>
                                    <ThemedText style={styles.signUpText}>{t("auth.signUp")}</ThemedText>
                                </TouchableOpacity>
                            </>
                        }
                        {!isSignUp && (
                            <TouchableOpacity
                                onPress={() => setForgotPasswordVisible(true)}
                                style={styles.forgetButton}
                            >
                                <ThemedText style={styles.forgetButtonText}>{t("auth.forgotPassword")}</ThemedText>
                            </TouchableOpacity>
                        )}
                        <ThemedText style={styles.termsText}>
                            {t("auth.disclaimer.first")}{" "}
                            <Link href="/terms">
                                <ThemedText type="link" style={styles.termsLink}>
                                    {t("auth.disclaimer.second")}
                                </ThemedText>
                            </Link>{" "}
                            {t("auth.disclaimer.third")}{" "}
                            <Link href="/privacy">
                                <ThemedText type="link" style={styles.termsLink}>
                                    {t("auth.disclaimer.fourth")}
                                </ThemedText>
                            </Link>
                            .
                        </ThemedText>
                        <View style={styles.errorContainer} accessible accessibilityLiveRegion="polite">
                            {registrationSuccess ?
                                <ThemedText style={styles.successText}>{t("auth.success.accountCreated")}</ThemedText>
                            :   <ThemedText style={[styles.errorText, !error && styles.errorHidden]}>
                                    {error ? error.charAt(0).toUpperCase() + error.slice(1) : " "}
                                </ThemedText>
                            }
                        </View>
                    </View>
                </ThemedView>
                <ForgotPasswordModal visible={forgotPasswordVisible} onClose={() => setForgotPasswordVisible(false)} />
            </ScrollView>
        );
    }

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
            <ThemedView style={styles.container}>
                <HeaderImage />
                <ThemedText type="title">
                    {t("home.title")}{" "}
                    {(
                        typeof user.user_metadata.display_name === "string" &&
                        user.user_metadata.display_name.trim().length > 0
                    ) ?
                        user.user_metadata.display_name.trim()
                    :   "!"}
                </ThemedText>
                <ThemedText style={styles.text}>
                    {t("home.signedInAs")} <ThemedText style={styles.user}>{user.email}</ThemedText>
                </ThemedText>
                {user.user_metadata?.deleteRequested && (
                    <ThemedText style={styles.terminate}>{t("home.pendingTermination")}</ThemedText>
                )}

                <ThemedView style={styles.statsContainer}>
                    {monthlyIncome !== null && (
                        <ThemedView style={styles.statCard}>
                            <ThemedText style={styles.statLabel}>{t("home.monthlyIncome")}</ThemedText>
                            <View style={styles.statWrapper}>
                                <Ionicons name="add-outline" size={16} color={greenColor} />
                                <ThemedText style={styles.statValue}>
                                    {currencySymbol} {monthlyIncome.toFixed(2).replace(".", ",")}
                                </ThemedText>
                            </View>
                        </ThemedView>
                    )}

                    <ThemedView style={styles.statCard}>
                        <ThemedText style={styles.statLabel}>{t("home.monthlyCosts")}</ThemedText>
                        <View style={styles.statWrapper}>
                            <Ionicons name="remove-outline" size={16} color={redColor} />
                            <ThemedText style={styles.statValue}>
                                {currencySymbol} {totals.monthlyTotal.toFixed(2).replace(".", ",")}
                            </ThemedText>
                        </View>
                    </ThemedView>

                    <ThemedView style={styles.statCard}>
                        <ThemedText style={styles.statLabel}>{t("home.monthlyDebts")}</ThemedText>
                        <View style={styles.statWrapper}>
                            <Ionicons name="alert" size={16} color={orangeColor} />
                            <ThemedText style={styles.statValue}>
                                {currencySymbol} {monthlyDebts.toFixed(2).replace(".", ",")}
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
                            <ThemedText style={styles.statLabel}>{t("home.monthlyDisposable")}</ThemedText>
                            <ThemedText style={styles.statValue}>
                                {currencySymbol} {monthlyDisposable.toFixed(2).replace(".", ",")}
                            </ThemedText>
                        </ThemedView>
                    )}
                </ThemedView>
            </ThemedView>
        </ScrollView>
    );
}
