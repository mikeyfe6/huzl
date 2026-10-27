import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useFocusEffect } from "expo-router/react-navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, Platform, Pressable, ScrollView, TextInput, View } from "react-native";

import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCurrency } from "@/hooks/use-currency";
import { useRefreshContext } from "@/hooks/use-refresh-context";

import { formatTotalMonthlyIncome } from "@/utils/helpers";
import { supabase } from "@/utils/supabase";

import { ExternalLink } from "@/components/external-link";
import { ForgotPasswordModal } from "@/components/modal/forgot-password-modal";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

import { HUZL_APP_STORE_URL, HUZL_MENEFEX_URL, HUZL_PLAY_STORE_URL } from "@/constants/links";
import { blueColor, Colors, greenColor, linkColor, orangeColor, redColor } from "@/constants/theme";
import { baseMedium, baseMini, baseSemiBold, baseSmall } from "@/styles/base";
import { getIndexStyles } from "@/styles/index";

export default function HomeScreen() {
    const { t } = useTranslation();
    const { user, loading, signIn, signUp } = useAuth();
    const { refreshFlag } = useRefreshContext();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [budgetExpenses, setBudgetExpenses] = useState<any[]>([]);
    const [debts, setDebts] = useState<any[]>([]);
    const [isSignUp, setIsSignUp] = useState(false);
    const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);
    const [monthlyIncome, setMonthlyIncome] = useState<number | null>(null);
    const [hasVariableIncome, setHasVariableIncome] = useState(false);
    const [incomeDates, setIncomeDates] = useState<{ name: string; next_expected_at: string }[]>([]);
    const [disposableToggle, setDisposableToggle] = useState(0);

    const { symbol: currencySymbol } = useCurrency();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? "light"];
    const styles = useMemo(() => getIndexStyles(theme), [theme]);

    const mapAuthError = (err: unknown) => {
        const code = (err as any)?.code;

        if (code === "invalid_credentials") return t("auth.error.invalidCredentials");
        if (code === "email_not_confirmed") return t("auth.error.emailNotConfirmed");
        if (code === "too_many_requests") return t("auth.error.rateLimited");

        return t("auth.error.generic");
    };

    const nextDebt = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const debtsWithDate = debts
            .filter((d) => d.amount !== 0)
            .filter((d) => d.active !== false)
            .filter((d) => d.next_payment_date && !Number.isNaN(Date.parse(d.next_payment_date)))
            .map((d) => ({
                ...d,
                nextDate: new Date(d.next_payment_date),
            }))
            .filter((d) => {
                const date = new Date(d.nextDate);
                date.setHours(0, 0, 0, 0);
                return date >= now;
            });
        if (debtsWithDate.length === 0) return null;

        debtsWithDate.sort((a, b) => a.nextDate - b.nextDate);
        const first = debtsWithDate[0];
        const sameDayCount = debtsWithDate.filter((d) => d.next_payment_date === first.next_payment_date).length;
        const isToday = new Date(first.nextDate).setHours(0, 0, 0, 0) === now.getTime();
        return { ...first, extraCount: sameDayCount - 1, isToday };
    }, [debts]);

    const nextIncome = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming = incomeDates
            .map((income) => ({ ...income, date: new Date(`${income.next_expected_at}T00:00:00`) }))
            .filter((income) => !Number.isNaN(income.date.getTime()) && income.date >= today)
            .sort((a, b) => a.date.getTime() - b.date.getTime());

        if (upcoming.length === 0) return null;

        const days = Math.round((upcoming[0].date.getTime() - today.getTime()) / 86_400_000);
        return { name: upcoming[0].name, days };
    }, [incomeDates]);

    const overdueDebtsCount = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        return debts
            .filter((d) => d.amount !== 0)
            .filter((d) => d.active !== false)
            .filter((d) => d.next_payment_date && !Number.isNaN(Date.parse(d.next_payment_date)))
            .map((d) => {
                const dueDate = new Date(d.next_payment_date);
                dueDate.setHours(0, 0, 0, 0);
                return dueDate;
            })
            .filter((dueDate) => dueDate < now).length;
    }, [debts]);

    const calculateYearlyTotal = (amount: number, freq: string): number => {
        const num = Number.parseFloat(amount.toString());
        if (Number.isNaN(num)) return 0;

        switch (freq) {
            case "daily":
                return num * 365;
            case "weekly":
                return num * 52;
            case "monthly":
                return num * 12;
            case "quarterly":
                return num * 4;
            case "halfyearly":
                return num * 2;
            case "yearly":
                return num;
            default:
                return 0;
        }
    };

    const monthlyExpenses = useMemo(() => {
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

    const monthlyBudgetExpenses = useMemo(() => {
        if (!budgetExpenses || budgetExpenses.length === 0) return 0;
        return budgetExpenses.reduce((sum, e) => sum + (typeof e.amount === "number" ? e.amount : 0), 0);
    }, [budgetExpenses]);

    const monthlyDebts = useMemo(() => {
        return debts
            .filter((d) => d.pay_per_month && !Number.isNaN(Number(d.pay_per_month)) && d.amount !== 0)
            .reduce((sum, d) => sum + Number(d.pay_per_month), 0);
    }, [debts]);

    const monthlyDisposable = useMemo(() => {
        if (monthlyIncome === null) return null;
        return monthlyIncome - monthlyExpenses.monthlyTotal - monthlyDebts - monthlyBudgetExpenses;
    }, [monthlyIncome, monthlyExpenses, monthlyDebts, monthlyBudgetExpenses]);

    const disposableValues = useMemo(() => {
        if (monthlyDisposable === null) return [null, null, null];
        const monthly = monthlyDisposable;
        const weekly = monthly / 4.34524;
        const daily = monthly / 30.4369;
        return [monthly, weekly, daily];
    }, [monthlyDisposable]);

    const disposableLabels = [t("home.monthlyDisposable"), t("home.weeklyDisposable"), t("home.dailyDisposable")];

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

    useFocusEffect(
        useCallback(() => {
            if (!user) {
                setMonthlyIncome(null);
                setHasVariableIncome(false);
                setIncomeDates([]);
                setExpenses([]);
                setDebts([]);
                return;
            }

            supabase
                .from("incomes")
                .select("id, name, type, amount, frequency, active, variable, tracking_started_at, next_expected_at")
                .eq("user_id", user.id)
                .then(async ({ data, error }) => {
                    if (error || !Array.isArray(data)) {
                        setMonthlyIncome(null);
                        setHasVariableIncome(false);
                        setIncomeDates([]);
                    } else {
                        const activeIncomes = data.filter((row) => row.active !== false);
                        setIncomeDates(
                            activeIncomes
                                .filter((row) => row.next_expected_at)
                                .map((row) => ({
                                    name: row.name?.trim() || t(`income.category.${row.type}`),
                                    next_expected_at: row.next_expected_at,
                                })),
                        );
                        const incomeIds = activeIncomes.map((row) => row.id);
                        const { data: payments, error: paymentsError } =
                            incomeIds.length > 0 ?
                                await supabase
                                    .from("income_payments")
                                    .select("income_id, amount, received_at")
                                    .in("income_id", incomeIds)
                            :   { data: [], error: null };

                        if (paymentsError || !Array.isArray(payments)) {
                            setMonthlyIncome(null);
                            setHasVariableIncome(false);
                            return;
                        }

                        const total = formatTotalMonthlyIncome(
                            activeIncomes.map((row) => ({
                                id: row.id,
                                amount: Number(row.amount),
                                frequency: row.frequency,
                                active: row.active,
                                variable: row.variable === true,
                                tracking_started_at: row.tracking_started_at,
                            })),
                            payments.map((payment) => ({
                                income_id: payment.income_id,
                                amount: Number(payment.amount),
                                received_at: payment.received_at,
                            })),
                        );
                        setMonthlyIncome(total);
                        setHasVariableIncome(activeIncomes.some((row) => row.variable === true));
                    }
                });

            supabase
                .from("expenses")
                .select("amount,frequency,active")
                .eq("active", true)
                .eq("user_id", user.id)
                .then(({ data, error }) => {
                    if (!error && Array.isArray(data)) {
                        setExpenses(data);
                    } else {
                        setExpenses([]);
                    }
                });

            supabase
                .from("budget_expenses")
                .select("amount")
                .eq("active", true)
                .then(({ data, error }) => {
                    if (!error && Array.isArray(data)) {
                        setBudgetExpenses(data);
                    } else {
                        setBudgetExpenses([]);
                    }
                });

            supabase
                .from("debts")
                .select("pay_per_month,active,name,next_payment_date,amount")
                .eq("active", true)
                .eq("user_id", user.id)
                .then(({ data, error }) => {
                    if (!error && Array.isArray(data)) {
                        setDebts(data);
                    } else {
                        setDebts([]);
                    }
                });
        }, [user, refreshFlag]),
    );

    const HeaderImage = () => (
        <View style={styles.logo}>
            <Image
                source={require("../../assets/images/huzl-icon.png")}
                style={styles.image}
                accessible
                accessibilityLabel="Huzl logo"
                resizeMode="contain"
                width={100}
                height={100}
            />
            <ThemedText type="logo">huzl</ThemedText>
        </View>
    );

    if (loading) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText style={baseSemiBold}>{t("common.loading")}</ThemedText>
            </ThemedView>
        );
    }

    if (!user) {
        return (
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
                <ThemedView style={styles.container}>
                    <HeaderImage />
                    <ThemedText type="title">{t("auth.welcome")}</ThemedText>
                    <ThemedText style={styles.text}>
                        {isSignUp ? t("auth.getStarted") : t("auth.signInOrCreate")}
                    </ThemedText>
                    <View style={styles.fieldset}>
                        <TextInput
                            placeholder={t("auth.placeholder.email")}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            autoComplete="email"
                            autoFocus={true}
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
                                <Pressable onPress={handleSignUp} style={styles.signInButton}>
                                    <ThemedText style={styles.signInText}>{t("auth.createAccount")}</ThemedText>
                                </Pressable>
                                <Pressable onPress={() => setIsSignUp(false)} style={styles.signUpButton}>
                                    <ThemedText style={styles.signUpText}>{t("auth.alreadyHaveAccount")}</ThemedText>
                                </Pressable>
                            </>
                        :   <>
                                <Pressable onPress={handleSignIn} style={styles.signInButton}>
                                    <ThemedText style={styles.signInText}>{t("auth.signIn")}</ThemedText>
                                </Pressable>
                                <Pressable onPress={() => setIsSignUp(true)} style={styles.signUpButton}>
                                    <ThemedText style={styles.signUpText}>{t("auth.signUp")}</ThemedText>
                                </Pressable>
                            </>
                        }
                        {!isSignUp && (
                            <Pressable onPress={() => setForgotPasswordVisible(true)} style={styles.forgetButton}>
                                <ThemedText style={styles.forgetButtonText}>{t("auth.forgotPassword")}</ThemedText>
                            </Pressable>
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
                            .{" "}
                            <Link href="/helpdesk">
                                <Ionicons name="help-circle" size={18} color={orangeColor} style={{ opacity: 0.9 }} />
                            </Link>
                        </ThemedText>
                        <View style={styles.errorContainer} accessible accessibilityLiveRegion="polite">
                            {registrationSuccess ?
                                <ThemedText style={styles.successText}>{t("auth.success.accountCreated")}</ThemedText>
                            :   <ThemedText style={[styles.errorText, !error && styles.errorHidden]}>
                                    {error ? error.charAt(0).toUpperCase() + error.slice(1) : " "}
                                </ThemedText>
                            }
                        </View>
                        {Platform.OS === "web" && (
                            <ThemedView style={styles.appContainer}>
                                <ExternalLink href={HUZL_APP_STORE_URL} theme={theme} style={styles.appLink}>
                                    <Ionicons name="logo-apple-appstore" size={18} color={linkColor} />{" "}
                                    <ThemedText type="app" style={{ ...baseSmall }}>
                                        {t("common.downloadOnAppStore")}
                                    </ThemedText>
                                </ExternalLink>
                                <ExternalLink href={HUZL_PLAY_STORE_URL} theme={theme} style={styles.appLink}>
                                    <Ionicons name="logo-google-playstore" size={18} color={linkColor} />{" "}
                                    <ThemedText type="app" style={{ ...baseSmall }}>
                                        {t("common.downloadOnPlayStore")}
                                    </ThemedText>
                                </ExternalLink>
                            </ThemedView>
                        )}
                        <View style={styles.poweredBy}>
                            <ExternalLink href={HUZL_MENEFEX_URL} theme={theme}>
                                <ThemedText style={styles.poweredByText}>{t("common.poweredBy")} </ThemedText>
                            </ExternalLink>
                        </View>
                    </View>
                </ThemedView>
                <ForgotPasswordModal
                    visible={forgotPasswordVisible}
                    onClose={() => setForgotPasswordVisible(false)}
                    theme={theme}
                />
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
                    {monthlyIncome !== null && monthlyIncome > 0 && (
                        <ThemedView style={styles.statCard}>
                            <ThemedText style={styles.statLabel}>{t("home.monthlyIncome")}</ThemedText>
                            <View style={styles.statWrapper}>
                                <Ionicons name="add-outline" size={16} color={greenColor} />
                                <ThemedText style={styles.statValue}>
                                    {currencySymbol} {monthlyIncome.toFixed(2).replace(".", ",")}
                                    {hasVariableIncome && (
                                        <>
                                            {" "}
                                            <ThemedText style={styles.statAverage}>*</ThemedText>
                                        </>
                                    )}
                                </ThemedText>
                            </View>
                        </ThemedView>
                    )}

                    {monthlyExpenses.monthlyTotal > 0 && (
                        <ThemedView style={styles.statCard}>
                            <ThemedText style={styles.statLabel}>{t("home.monthlyExpenses")}</ThemedText>
                            <View style={styles.statWrapper}>
                                <Ionicons name="remove-outline" size={16} color={redColor} />
                                <ThemedText style={styles.statValue}>
                                    {currencySymbol} {monthlyExpenses.monthlyTotal.toFixed(2).replace(".", ",")}
                                </ThemedText>
                            </View>
                        </ThemedView>
                    )}

                    {monthlyBudgetExpenses > 0 && (
                        <ThemedView style={styles.statCard}>
                            <ThemedText style={styles.statLabel}>{t("home.monthlyBudgetExpenses")}</ThemedText>
                            <View style={styles.statWrapper}>
                                <Ionicons name="remove-outline" size={16} color={blueColor} />
                                <ThemedText style={styles.statValue}>
                                    {currencySymbol} {monthlyBudgetExpenses.toFixed(2).replace(".", ",")}
                                </ThemedText>
                            </View>
                        </ThemedView>
                    )}

                    {monthlyDebts > 0 && (
                        <ThemedView style={styles.statCard}>
                            <ThemedText style={styles.statLabel}>{t("home.monthlyDebts")}</ThemedText>
                            <View style={styles.statWrapper}>
                                <Ionicons name="remove-outline" size={16} color={orangeColor} />
                                <ThemedText style={styles.statValue}>
                                    {currencySymbol} {monthlyDebts.toFixed(2).replace(".", ",")}
                                </ThemedText>
                            </View>
                        </ThemedView>
                    )}

                    {monthlyDisposable !== null && (
                        <Pressable onPress={() => setDisposableToggle((prev) => (prev + 1) % 3)}>
                            <ThemedView
                                style={[
                                    styles.statCard,
                                    (
                                        disposableValues[disposableToggle] !== null &&
                                        disposableValues[disposableToggle] >= 0
                                    ) ?
                                        styles.statCardPositive
                                    :   styles.statCardNegative,
                                ]}
                            >
                                <ThemedText style={styles.statLabel}>{disposableLabels[disposableToggle]}</ThemedText>
                                <ThemedText style={styles.statValue}>
                                    {disposableValues[disposableToggle] === null ?
                                        "-"
                                    :   `${currencySymbol} ${disposableValues[disposableToggle].toFixed(2).replace(".", ",")}`
                                    }
                                </ThemedText>
                            </ThemedView>
                        </Pressable>
                    )}

                    {(nextIncome || nextDebt || overdueDebtsCount > 0) && (
                        <View style={styles.nextDetails}>
                            {nextIncome && (
                                <View style={styles.nextIncome}>
                                    <ThemedText
                                        style={styles.nextIncomeIntro}
                                    >{`${t("home.expectedIncome")}:`}</ThemedText>
                                    <ThemedText style={{ color: theme.text, ...baseMini, ...baseMedium }}>
                                        {nextIncome.name}
                                    </ThemedText>
                                    <View style={styles.nextIncomeBadge}>
                                        <ThemedText style={styles.nextIncomeDate}>
                                            {nextIncome.days === 0 ?
                                                t("home.incomeToday")
                                            :   t("home.incomeInDays", { count: nextIncome.days })}
                                        </ThemedText>
                                    </View>
                                </View>
                            )}

                            {nextDebt && (
                                <View style={styles.nextDebt}>
                                    <ThemedText style={styles.nextDebtIntro}>{`${t("home.nextPayment")}:`}</ThemedText>
                                    <ThemedText style={{ color: theme.text, ...baseMini, ...baseMedium }}>
                                        {nextDebt.name}
                                    </ThemedText>
                                    <View style={styles.nextDebtBadge}>
                                        <ThemedText style={styles.nextDebtDate}>
                                            {nextDebt.isToday ?
                                                t("home.nextPaymentToday")
                                            :   nextDebt.nextDate.toLocaleDateString(t("seo.lang"))}
                                        </ThemedText>
                                    </View>
                                    {nextDebt.extraCount > 0 && (
                                        <ThemedText
                                            style={styles.nextDebtExtra}
                                        >{`+ ${nextDebt.extraCount}`}</ThemedText>
                                    )}
                                </View>
                            )}

                            {overdueDebtsCount > 0 && (
                                <ThemedText style={styles.overdueDebts}>
                                    {overdueDebtsCount === 1 ?
                                        t("home.overdueDebtsSingle", { count: overdueDebtsCount })
                                    :   t("home.overdueDebtsMultiple", { count: overdueDebtsCount })}
                                </ThemedText>
                            )}
                        </View>
                    )}
                </ThemedView>
            </ThemedView>
        </ScrollView>
    );
}
