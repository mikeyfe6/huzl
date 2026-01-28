import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, FlatList, NativeMethods, Platform, TextInput, TouchableOpacity, View } from "react-native";

import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCurrency } from "@/hooks/use-currency";

import { formatCurrency, formatNumber } from "@/utils/helpers";
import { supabase } from "@/utils/supabase";

import { AuthGate } from "@/components/loading";
import { SORT_OPTIONS, SortModal } from "@/components/modal/sort-expenses-modal";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ExpenseItem } from "@/components/ui/expense-item";
import { ExpensesPie } from "@/components/ui/expenses-pie";

// TODO: file dry maken

import {
    businessColor,
    careColor,
    Colors,
    entertainmentColor,
    familyColor,
    healthColor,
    housingColor,
    investColor,
    personalColor,
    petColor,
    slateColor,
    taxesColor,
    travelColor,
} from "@/constants/theme";
import { baseGreen, baseRed } from "@/styles/base";
import { getExpensesStyles } from "@/styles/expenses";

export default function ExpensesScreen() {
    const { t } = useTranslation();
    const { user } = useAuth();

    const colorScheme = useColorScheme();
    const { symbol: currencySymbol } = useCurrency();

    const nameInputRef = useRef<TextInput>(null);
    const listSectionRef = useRef<any>(null);
    const flatListRef = useRef<FlatList>(null);
    const searchBarRef = useRef<View>(null);

    const [expenseName, setExpenseName] = useState("");
    const [expenseAmount, setExpenseAmount] = useState("");
    const [frequency, setFrequency] = useState<Frequency>("monthly");
    const [category, setCategory] = useState<Category>("personal");
    const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [sortOption, setSortOption] = useState<SortOption>("default");
    const [sortModalVisible, setSortModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const theme = Colors[colorScheme ?? "light"];
    const styles = useMemo(() => getExpensesStyles(theme), [theme]);

    const categoryLabelMap = useMemo(
        () => ({
            personal: t("expenses.category.personal"),
            business: t("expenses.category.business"),
            family: t("expenses.category.family"),
            invest: t("expenses.category.invest"),
            entertainment: t("expenses.category.entertainment"),
            housing: t("expenses.category.housing"),
            taxes: t("expenses.category.taxes"),
            travel: t("expenses.category.travel"),
            pet: t("expenses.category.pet"),
            care: t("expenses.category.care"),
            health: t("expenses.category.health"),
        }),
        [t],
    );

    const sortLabelMap = useMemo(
        () => Object.fromEntries(SORT_OPTIONS.map((option) => [option.value, t(option.labelKey)])),
        [t],
    );

    const filteredExpenses = useMemo(() => {
        if (!searchQuery.trim()) return expenses;
        return expenses.filter((e) => e.name.toLowerCase().includes(searchQuery.trim().toLowerCase()));
    }, [expenses, searchQuery]);

    const sortedExpenses = useMemo(() => {
        const sorted = [...filteredExpenses];

        switch (sortOption) {
            case "alphabetic-asc":
                return sorted.sort((a, b) => a.name.localeCompare(b.name));

            case "alphabetic-desc":
                return sorted.sort((a, b) => b.name.localeCompare(a.name));

            case "cost-asc":
                return sorted.sort((a, b) => a.yearlyTotal - b.yearlyTotal);

            case "cost-desc":
                return sorted.sort((a, b) => b.yearlyTotal - a.yearlyTotal);

            case "default":
            default:
                return sorted;
        }
    }, [filteredExpenses, sortOption]);

    const totals = useMemo(() => {
        const result: Record<string, number> = {
            total: 0,
            personal: 0,
            business: 0,
            family: 0,
            invest: 0,
            entertainment: 0,
            housing: 0,
            taxes: 0,
            travel: 0,
            pet: 0,
            care: 0,
            health: 0,
        };
        for (const e of expenses) {
            if (!e.active) continue;
            result.total += e.yearlyTotal;
            if (result[e.category] !== undefined) {
                result[e.category] += e.yearlyTotal;
            }
        }
        return result;
    }, [expenses]);

    const availableCategories = useMemo(() => {
        return [
            "personal",
            "business",
            "family",
            "invest",
            "entertainment",
            "housing",
            "taxes",
            "travel",
            "pet",
            "care",
            "health",
        ].filter((cat) => expenses.some((e) => e.active && e.category === cat)) as Category[];
    }, [expenses]);

    const handleEdit = useCallback((expense: ExpenseItem) => {
        setExpenseName(expense.name);
        setExpenseAmount(expense.amount.toFixed(2));
        setFrequency(expense.frequency);
        setCategory(expense.category);
        setEditingId(expense.id);
        if (flatListRef.current) {
            flatListRef.current.scrollToOffset({ offset: 0, animated: true });
        }
        setTimeout(() => {
            if (Platform.OS === "web") {
                const node = nameInputRef.current as any;

                window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                });

                node?.focus?.({ preventScroll: true });
            } else {
                nameInputRef.current?.focus();
            }
        }, 0);
    }, []);

    const handleToggleActive = useCallback(
        async (id: string, currentActive: boolean) => {
            if (!user) return;
            setLoading(true);
            try {
                const { error } = await supabase
                    .from("expenses")
                    .update({ active: !currentActive })
                    .eq("id", id)
                    .eq("user_id", user.id);

                if (!error) {
                    setExpenses((prev) =>
                        prev.map((expense) => (expense.id === id ? { ...expense, active: !currentActive } : expense)),
                    );
                }
            } finally {
                setLoading(false);
            }
        },
        [user],
    );

    const handleDeleteExpense = useCallback(
        async (id: string) => {
            if (!user) return;
            setLoading(true);
            try {
                const { error } = await supabase.from("expenses").delete().eq("id", id).eq("user_id", user.id);
                if (!error) {
                    setExpenses((prev) => prev.filter((expense) => expense.id !== id));
                }
            } finally {
                setLoading(false);
            }
        },
        [user],
    );

    const confirmDelete = useCallback(
        (id: string, name: string) => {
            if (Platform.OS === "web") {
                const ok = globalThis.confirm(`${t("common.delete")} "${name}"?`);
                if (ok) handleDeleteExpense(id);
                return;
            }

            Alert.alert(t("expenses.deleteExpense"), `${t("common.delete")} "${name}"?`, [
                { text: t("common.cancel"), style: "cancel" },
                { text: t("common.delete"), style: "destructive", onPress: () => handleDeleteExpense(id) },
            ]);
        },
        [t, handleDeleteExpense],
    );

    const getFrequencyLabel = useCallback(
        (freq: Frequency): string => {
            switch (freq) {
                case "daily":
                    return t("expenses.frequency.daily");
                case "weekly":
                    return t("expenses.frequency.weekly");
                case "monthly":
                    return t("expenses.frequency.monthly");
                case "quarterly":
                    return t("expenses.frequency.quarterly");
                case "halfyearly":
                    return t("expenses.frequency.halfyearly");
                case "yearly":
                    return t("expenses.frequency.yearly");
            }
        },
        [t],
    );

    const scrollToChartItems = (offset: number = 0) => {
        if (Platform.OS === "web") {
            if (listSectionRef.current?.scrollIntoView) {
                listSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        } else if (listSectionRef.current && flatListRef.current) {
            const flatListNativeNode = flatListRef.current.getNativeScrollRef();

            if (flatListNativeNode) {
                listSectionRef.current.measureLayout(
                    flatListNativeNode,
                    (_x: number, y: number) => {
                        flatListRef.current?.scrollToOffset({ offset: Math.max(0, y - offset), animated: true });
                    },
                    (error: any) => {
                        console.warn("measureLayout failed", error);
                    },
                );
            }
        }
    };

    const calculateYearlyTotal = (amount: number, freq: Frequency): number => {
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

    const handleCreate = async () => {
        if (!user) return;
        if (!expenseName.trim() || !expenseAmount.trim()) return;

        setLoading(true);
        try {
            if (editingId) {
                const { data, error } = await supabase
                    .from("expenses")
                    .update({
                        name: expenseName,
                        amount: Number.parseFloat(expenseAmount),
                        frequency,
                        category,
                    })
                    .eq("id", editingId)
                    .eq("user_id", user.id)
                    .select()
                    .single();

                if (error) {
                    console.error("Update error:", error);
                    alert(`Failed to update expense: ${error.message}`);
                    return;
                }

                if (data) {
                    const amount = Number.parseFloat(String(data.amount));
                    setExpenses((prev) =>
                        prev.map((exp) =>
                            exp.id === editingId ?
                                {
                                    id: data.id,
                                    name: data.name,
                                    amount,
                                    frequency: data.frequency as Frequency,
                                    category: (data.category as Category) ?? "personal",
                                    yearlyTotal: calculateYearlyTotal(amount, data.frequency as Frequency),
                                    active: data.active ?? true,
                                }
                            :   exp,
                        ),
                    );
                    setExpenseName("");
                    setExpenseAmount("");
                    setFrequency("monthly");
                    setCategory("personal");
                    setEditingId(null);
                }
            } else {
                const { data, error } = await supabase
                    .from("expenses")
                    .insert({
                        user_id: user.id,
                        name: expenseName,
                        amount: Number.parseFloat(expenseAmount),
                        frequency,
                        category,
                        active: true,
                    })
                    .select()
                    .single();

                if (error) {
                    console.error("Insert error:", error);
                    alert(`Failed to add expense: ${error.message}`);
                    return;
                }

                if (data) {
                    const amount = Number.parseFloat(String(data.amount));
                    const newExpense: ExpenseItem = {
                        id: data.id,
                        name: data.name,
                        amount,
                        frequency: data.frequency as Frequency,
                        category: (data.category as Category) ?? "personal",
                        yearlyTotal: calculateYearlyTotal(amount, data.frequency as Frequency),
                        active: data.active ?? true,
                    };
                    setExpenses((prev) => [newExpense, ...prev]);
                    setExpenseName("");
                    setExpenseAmount("");
                    setFrequency("monthly");
                    setCategory("personal");
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setExpenseName("");
        setExpenseAmount("");
        setFrequency("monthly");
        setCategory("personal");
        setEditingId(null);
    };

    const setSortAndClose = (opt: SortOption) => {
        setSortOption(opt);
        setSortModalVisible(false);
    };

    const totalYearlySpend = totals.total;
    const totalMonthlySpend = totalYearlySpend / 12;
    const totalWeeklySpend = totalYearlySpend / 52;
    const totalDailySpend = totalYearlySpend / 365;
    const personalYearlySpend = totals.personal;
    const businessYearlySpend = totals.business;
    const familyYearlySpend = totals.family;
    const investYearlySpend = totals.invest;
    const entertainmentYearlySpend = totals.entertainment;
    const housingYearlySpend = totals.housing;
    const taxesYearlySpend = totals.taxes;
    const travelYearlySpend = totals.travel;
    const petYearlySpend = totals.pet;
    const careYearlySpend = totals.care;
    const healthYearlySpend = totals.health;

    useEffect(() => {
        if (availableCategories.length > 0 && !expenses.some((e) => e.active && e.category === category)) {
            setCategory(availableCategories[0]);
        }
    }, [availableCategories, expenses]);

    useEffect(() => {
        if (!user) {
            setExpenses([]);
            return;
        }
        const fetchExpenses = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from("expenses")
                    .select("id,name,amount,frequency,category,active")
                    .order("created_at", { ascending: false })
                    .eq("user_id", user.id);
                if (!error && data) {
                    const mapped: ExpenseItem[] = data.map((row: any) => {
                        const amount = Number.parseFloat(String(row.amount));
                        return {
                            id: row.id,
                            name: row.name,
                            amount,
                            frequency: row.frequency as Frequency,
                            category: (row.category as Category) ?? "personal",
                            yearlyTotal: calculateYearlyTotal(amount, row.frequency as Frequency),
                            active: row.active ?? true,
                        };
                    });
                    setExpenses(mapped);
                } else {
                    setExpenses([]);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchExpenses();
    }, [user]);

    const Header = (
        <>
            <ThemedView style={styles.fieldset}>
                <ThemedText type="title" style={styles.heading}>
                    {t("expenses.title")}
                </ThemedText>

                <ThemedText style={styles.label}>{t("expenses.label.name")}</ThemedText>
                <TextInput
                    ref={nameInputRef}
                    style={styles.input}
                    placeholder={t("expenses.placeholder.name")}
                    placeholderTextColor={theme.placeholder}
                    value={expenseName}
                    onChangeText={setExpenseName}
                />

                <ThemedText style={styles.label}>
                    {t("expenses.label.amount")} ({currencySymbol})
                </ThemedText>
                <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    placeholderTextColor={theme.placeholder}
                    value={expenseAmount}
                    onChangeText={(text) => setExpenseAmount(formatNumber(text))}
                    keyboardType="decimal-pad"
                />

                <ThemedText style={styles.label}>{t("expenses.label.category")}</ThemedText>
                <View style={styles.categoryGroup}>
                    <TouchableOpacity
                        style={[styles.categoryOption, category === "personal" && styles.categoryActive]}
                        onPress={() => setCategory("personal")}
                        accessibilityRole="radio"
                        accessibilityState={{
                            selected: category === "personal",
                        }}
                    >
                        <ThemedText>{t("expenses.category.personal")}</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.categoryOption, category === "business" && styles.categoryActive]}
                        onPress={() => setCategory("business")}
                        accessibilityRole="radio"
                        accessibilityState={{
                            selected: category === "business",
                        }}
                    >
                        <ThemedText>{t("expenses.category.business")}</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.categoryOption, category === "family" && styles.categoryActive]}
                        onPress={() => setCategory("family")}
                        accessibilityRole="radio"
                        accessibilityState={{
                            selected: category === "family",
                        }}
                    >
                        <ThemedText>{t("expenses.category.family")}</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.categoryOption, category === "invest" && styles.categoryActive]}
                        onPress={() => setCategory("invest")}
                        accessibilityRole="radio"
                        accessibilityState={{
                            selected: category === "invest",
                        }}
                    >
                        <ThemedText>{t("expenses.category.invest")}</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.categoryOption, category === "entertainment" && styles.categoryActive]}
                        onPress={() => setCategory("entertainment")}
                        accessibilityRole="radio"
                        accessibilityState={{
                            selected: category === "entertainment",
                        }}
                    >
                        <ThemedText>{t("expenses.category.entertainment")}</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.categoryOption, category === "housing" && styles.categoryActive]}
                        onPress={() => setCategory("housing")}
                        accessibilityRole="radio"
                        accessibilityState={{
                            selected: category === "housing",
                        }}
                    >
                        <ThemedText>{t("expenses.category.housing")}</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.categoryOption, category === "taxes" && styles.categoryActive]}
                        onPress={() => setCategory("taxes")}
                        accessibilityRole="radio"
                        accessibilityState={{
                            selected: category === "taxes",
                        }}
                    >
                        <ThemedText>{t("expenses.category.taxes")}</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.categoryOption, category === "travel" && styles.categoryActive]}
                        onPress={() => setCategory("travel")}
                        accessibilityRole="radio"
                        accessibilityState={{
                            selected: category === "travel",
                        }}
                    >
                        <ThemedText>{t("expenses.category.travel")}</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.categoryOption, category === "pet" && styles.categoryActive]}
                        onPress={() => setCategory("pet")}
                        accessibilityRole="radio"
                        accessibilityState={{
                            selected: category === "pet",
                        }}
                    >
                        <ThemedText>{t("expenses.category.pet")}</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.categoryOption, category === "care" && styles.categoryActive]}
                        onPress={() => setCategory("care")}
                        accessibilityRole="radio"
                        accessibilityState={{
                            selected: category === "care",
                        }}
                    >
                        <ThemedText>{t("expenses.category.care")}</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.categoryOption, category === "health" && styles.categoryActive]}
                        onPress={() => setCategory("health")}
                        accessibilityRole="radio"
                        accessibilityState={{
                            selected: category === "health",
                        }}
                    >
                        <ThemedText>{t("expenses.category.health")}</ThemedText>
                    </TouchableOpacity>
                </View>

                <ThemedText style={styles.label}>{t("expenses.label.frequency")}</ThemedText>
                <View style={[styles.select]}>
                    <Picker
                        selectedValue={frequency}
                        onValueChange={(itemValue) => setFrequency(itemValue as Frequency)}
                        style={[
                            styles.selectInput,
                            Platform.OS === "web" ?
                                ([
                                    {
                                        appearance: "none",
                                        WebkitAppearance: "none",
                                        MozAppearance: "none",
                                    } as any,
                                ] as any)
                            :   null,
                        ]}
                        itemStyle={styles.selectOption}
                    >
                        <Picker.Item label={t("expenses.frequency.daily")} value="daily" />
                        <Picker.Item label={t("expenses.frequency.weekly")} value="weekly" />
                        <Picker.Item label={t("expenses.frequency.monthly")} value="monthly" />
                        <Picker.Item label={t("expenses.frequency.quarterly")} value="quarterly" />
                        <Picker.Item label={t("expenses.frequency.halfyearly")} value="halfyearly" />
                        <Picker.Item label={t("expenses.frequency.yearly")} value="yearly" />
                    </Picker>
                    {Platform.OS === "web" && (
                        <Ionicons name="chevron-down" size={18} color={theme.inputText} style={styles.selectIcon} />
                    )}
                </View>

                <View style={styles.buttons}>
                    <TouchableOpacity style={[styles.button, { ...baseGreen }]} onPress={handleCreate}>
                        <ThemedText style={styles.buttonText}>
                            {editingId ? t("expenses.button.updateExpense") : t("expenses.button.addExpense")}
                        </ThemedText>
                    </TouchableOpacity>
                    {editingId && (
                        <TouchableOpacity style={[styles.button, { ...baseRed }]} onPress={handleCancel}>
                            <ThemedText style={styles.buttonText}>{t("common.cancel")}</ThemedText>
                        </TouchableOpacity>
                    )}
                </View>
            </ThemedView>

            {expenses.length > 0 && (
                <>
                    <View style={styles.expenseHeader}>
                        <View style={styles.expenseTitle}>
                            <ThemedText type="subtitle">{t("expenses.yourExpenses")}</ThemedText>
                            <ThemedText style={styles.expenseNumber}>({sortedExpenses.length})</ThemedText>
                        </View>
                        <TouchableOpacity
                            style={styles.sortTrigger}
                            onPress={() => setSortModalVisible(true)}
                            accessibilityRole="button"
                            accessibilityLabel="Open sort options"
                        >
                            <Ionicons name="swap-vertical" size={16} color={theme.label} />
                            <ThemedText style={styles.sortTriggerText}>{sortLabelMap[sortOption]}</ThemedText>
                            <Ionicons name="chevron-down" size={16} color={theme.label} />
                        </TouchableOpacity>
                    </View>
                    <View ref={searchBarRef} collapsable={false} style={styles.expenseSearch}>
                        <TextInput
                            style={[styles.input, styles.searchInput]}
                            placeholder={t("expenses.placeholder.search")}
                            placeholderTextColor={theme.placeholder}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            returnKeyType="search"
                            onFocus={() => {
                                if (!flatListRef.current || !searchBarRef.current) return;

                                requestAnimationFrame(() => {
                                    const scrollView =
                                        flatListRef?.current?.getNativeScrollRef?.() as unknown as NativeMethods;

                                    if (!scrollView) return;

                                    searchBarRef?.current?.measureLayout(
                                        scrollView,
                                        (_x, y) => {
                                            flatListRef.current?.scrollToOffset({
                                                offset: Math.max(0, y - 72),
                                                animated: true,
                                            });
                                        },
                                        () => console.warn("measureLayout failed"),
                                    );
                                });
                            }}
                        />
                        <Ionicons name="search" size={20} color={theme.placeholder} style={styles.searchIcon} />
                    </View>
                    <SortModal
                        visible={sortModalVisible}
                        sortOption={sortOption}
                        onSelect={setSortAndClose}
                        onClose={() => setSortModalVisible(false)}
                        theme={theme}
                    />
                </>
            )}
        </>
    );

    const Footer = (
        <>
            {expenses.length > 0 && (
                <>
                    <ThemedView style={[styles.totalSection]}>
                        <ThemedText type="subtitle" style={styles.totalTitle}>
                            {t("expenses.yearlySpend")}
                        </ThemedText>
                        <ThemedText style={[styles.totalAmount, { fontSize: 32, marginBottom: 24 }]}>
                            {formatCurrency(totalYearlySpend, currencySymbol)}
                        </ThemedText>

                        {personalYearlySpend > 0 && (
                            <ThemedText style={styles.totalContent}>
                                <View
                                    style={[
                                        styles.totalDots,
                                        {
                                            backgroundColor: personalColor,
                                        },
                                    ]}
                                />{" "}
                                <ThemedText style={styles.totalLabel}> {t("expenses.category.personal")}:</ThemedText>{" "}
                                <ThemedText style={styles.totalInline}>
                                    {" "}
                                    {formatCurrency(personalYearlySpend, currencySymbol)}
                                </ThemedText>
                            </ThemedText>
                        )}

                        {businessYearlySpend > 0 && (
                            <ThemedText style={styles.totalContent}>
                                <View
                                    style={[
                                        styles.totalDots,
                                        {
                                            backgroundColor: businessColor,
                                        },
                                    ]}
                                />{" "}
                                <ThemedText style={styles.totalLabel}> {t("expenses.category.business")}:</ThemedText>{" "}
                                <ThemedText style={styles.totalInline}>
                                    {" "}
                                    {formatCurrency(businessYearlySpend, currencySymbol)}
                                </ThemedText>
                            </ThemedText>
                        )}

                        {familyYearlySpend > 0 && (
                            <ThemedText style={styles.totalContent}>
                                <View
                                    style={[
                                        styles.totalDots,
                                        {
                                            backgroundColor: familyColor,
                                        },
                                    ]}
                                />{" "}
                                <ThemedText style={styles.totalLabel}> {t("expenses.category.family")}:</ThemedText>{" "}
                                <ThemedText style={styles.totalInline}>
                                    {" "}
                                    {formatCurrency(familyYearlySpend, currencySymbol)}
                                </ThemedText>
                            </ThemedText>
                        )}

                        {investYearlySpend > 0 && (
                            <ThemedText style={styles.totalContent}>
                                <View
                                    style={[
                                        styles.totalDots,
                                        {
                                            backgroundColor: investColor,
                                        },
                                    ]}
                                />{" "}
                                <ThemedText style={styles.totalLabel}> {t("expenses.category.invest")}:</ThemedText>{" "}
                                <ThemedText style={styles.totalInline}>
                                    {" "}
                                    {formatCurrency(investYearlySpend, currencySymbol)}
                                </ThemedText>
                            </ThemedText>
                        )}

                        {entertainmentYearlySpend > 0 && (
                            <ThemedText style={styles.totalContent}>
                                <View
                                    style={[
                                        styles.totalDots,
                                        {
                                            backgroundColor: entertainmentColor,
                                        },
                                    ]}
                                />{" "}
                                <ThemedText style={styles.totalLabel}>
                                    {" "}
                                    {t("expenses.category.entertainment")}:{" "}
                                </ThemedText>{" "}
                                <ThemedText style={styles.totalInline}>
                                    {" "}
                                    {formatCurrency(entertainmentYearlySpend, currencySymbol)}
                                </ThemedText>
                            </ThemedText>
                        )}

                        {housingYearlySpend > 0 && (
                            <ThemedText style={styles.totalContent}>
                                <View
                                    style={[
                                        styles.totalDots,
                                        {
                                            backgroundColor: housingColor,
                                        },
                                    ]}
                                />{" "}
                                <ThemedText style={styles.totalLabel}> {t("expenses.category.housing")}:</ThemedText>{" "}
                                <ThemedText style={styles.totalInline}>
                                    {" "}
                                    {formatCurrency(housingYearlySpend, currencySymbol)}
                                </ThemedText>
                            </ThemedText>
                        )}

                        {taxesYearlySpend > 0 && (
                            <ThemedText style={styles.totalContent}>
                                <View
                                    style={[
                                        styles.totalDots,
                                        {
                                            backgroundColor: taxesColor,
                                        },
                                    ]}
                                />{" "}
                                <ThemedText style={styles.totalLabel}> {t("expenses.category.taxes")}:</ThemedText>{" "}
                                <ThemedText style={styles.totalInline}>
                                    {" "}
                                    {formatCurrency(taxesYearlySpend, currencySymbol)}
                                </ThemedText>
                            </ThemedText>
                        )}

                        {travelYearlySpend > 0 && (
                            <ThemedText style={styles.totalContent}>
                                <View
                                    style={[
                                        styles.totalDots,
                                        {
                                            backgroundColor: travelColor,
                                        },
                                    ]}
                                />{" "}
                                <ThemedText style={styles.totalLabel}> {t("expenses.category.travel")}:</ThemedText>{" "}
                                <ThemedText style={styles.totalInline}>
                                    {" "}
                                    {formatCurrency(travelYearlySpend, currencySymbol)}
                                </ThemedText>
                            </ThemedText>
                        )}

                        {petYearlySpend > 0 && (
                            <ThemedText style={styles.totalContent}>
                                <View
                                    style={[
                                        styles.totalDots,
                                        {
                                            backgroundColor: petColor,
                                        },
                                    ]}
                                />{" "}
                                <ThemedText style={styles.totalLabel}> {t("expenses.category.pet")}:</ThemedText>{" "}
                                <ThemedText style={styles.totalInline}>
                                    {" "}
                                    {formatCurrency(petYearlySpend, currencySymbol)}
                                </ThemedText>
                            </ThemedText>
                        )}

                        {careYearlySpend > 0 && (
                            <ThemedText style={styles.totalContent}>
                                <View
                                    style={[
                                        styles.totalDots,
                                        {
                                            backgroundColor: careColor,
                                        },
                                    ]}
                                />{" "}
                                <ThemedText style={styles.totalLabel}> {t("expenses.category.care")}:</ThemedText>{" "}
                                <ThemedText style={styles.totalInline}>
                                    {" "}
                                    {formatCurrency(careYearlySpend, currencySymbol)}
                                </ThemedText>
                            </ThemedText>
                        )}

                        {healthYearlySpend > 0 && (
                            <ThemedText style={styles.totalContent}>
                                <View
                                    style={[
                                        styles.totalDots,
                                        {
                                            backgroundColor: healthColor,
                                        },
                                    ]}
                                />{" "}
                                <ThemedText style={styles.totalLabel}> {t("expenses.category.health")}:</ThemedText>{" "}
                                <ThemedText style={styles.totalInline}>
                                    {" "}
                                    {formatCurrency(healthYearlySpend, currencySymbol)}
                                </ThemedText>
                            </ThemedText>
                        )}
                    </ThemedView>

                    <View style={styles.totalDetails}>
                        <ThemedView style={[styles.totalSection, styles.totalPeriod]}>
                            <ThemedText type="defaultSemiBold" style={styles.totalTitle}>
                                {t("expenses.monthlySpend")}
                            </ThemedText>
                            <ThemedText style={[styles.totalAmount, { fontSize: 28 }]}>
                                {formatCurrency(totalMonthlySpend, currencySymbol)}
                            </ThemedText>
                        </ThemedView>

                        <ThemedView style={[styles.totalSection, styles.totalPeriod]}>
                            <ThemedText type="defaultSemiBold" style={styles.totalTitle}>
                                {t("expenses.weeklySpend")}
                            </ThemedText>
                            <ThemedText style={[styles.totalAmount, { fontSize: 28 }]}>
                                {formatCurrency(totalWeeklySpend, currencySymbol)}
                            </ThemedText>
                        </ThemedView>

                        <ThemedView style={[styles.totalSection, styles.totalPeriod]}>
                            <ThemedText type="defaultSemiBold" style={styles.totalTitle}>
                                {t("expenses.dailySpend")}
                            </ThemedText>
                            <ThemedText style={[styles.totalAmount, { fontSize: 28 }]}>
                                {formatCurrency(totalDailySpend, currencySymbol)}
                            </ThemedText>
                        </ThemedView>
                    </View>

                    <View style={styles.chartContainer}>
                        <ExpensesPie
                            expenses={expenses}
                            selectedCategory={category}
                            onCategorySelect={(cat) => {
                                setCategory(cat);
                                scrollToChartItems();
                            }}
                            theme={theme}
                        />
                        <View style={styles.chartStats}>
                            <View style={styles.chartButtons}>
                                {availableCategories.map((cat) => {
                                    let btnBgColor = theme.inputBackground;
                                    let btnBorderColor = theme.inputBorder;
                                    let dotColor = slateColor;
                                    let percent = 0;

                                    switch (cat) {
                                        case "personal":
                                            dotColor = personalColor;
                                            percent =
                                                totalYearlySpend > 0 ?
                                                    (personalYearlySpend / totalYearlySpend) * 100
                                                :   0;
                                            break;
                                        case "business":
                                            dotColor = businessColor;
                                            percent =
                                                totalYearlySpend > 0 ?
                                                    (businessYearlySpend / totalYearlySpend) * 100
                                                :   0;
                                            break;
                                        case "family":
                                            dotColor = familyColor;
                                            percent =
                                                totalYearlySpend > 0 ? (familyYearlySpend / totalYearlySpend) * 100 : 0;
                                            break;
                                        case "invest":
                                            dotColor = investColor;
                                            percent =
                                                totalYearlySpend > 0 ? (investYearlySpend / totalYearlySpend) * 100 : 0;
                                            break;
                                        case "entertainment":
                                            dotColor = entertainmentColor;
                                            percent =
                                                totalYearlySpend > 0 ?
                                                    (entertainmentYearlySpend / totalYearlySpend) * 100
                                                :   0;
                                            break;
                                        case "housing":
                                            dotColor = housingColor;
                                            percent =
                                                totalYearlySpend > 0 ?
                                                    (housingYearlySpend / totalYearlySpend) * 100
                                                :   0;
                                            break;
                                        case "taxes":
                                            dotColor = taxesColor;
                                            percent =
                                                totalYearlySpend > 0 ? (taxesYearlySpend / totalYearlySpend) * 100 : 0;
                                            break;
                                        case "travel":
                                            dotColor = travelColor;
                                            percent =
                                                totalYearlySpend > 0 ? (travelYearlySpend / totalYearlySpend) * 100 : 0;
                                            break;
                                        case "pet":
                                            dotColor = petColor;
                                            percent =
                                                totalYearlySpend > 0 ? (petYearlySpend / totalYearlySpend) * 100 : 0;
                                            break;
                                        case "care":
                                            dotColor = careColor;
                                            percent =
                                                totalYearlySpend > 0 ? (careYearlySpend / totalYearlySpend) * 100 : 0;
                                            break;
                                        case "health":
                                            dotColor = healthColor;
                                            percent =
                                                totalYearlySpend > 0 ? (healthYearlySpend / totalYearlySpend) * 100 : 0;
                                            break;
                                    }

                                    if (percent === 0) return null;

                                    if (category === cat) {
                                        btnBgColor = dotColor + "50";
                                        btnBorderColor = dotColor;
                                    }

                                    return (
                                        <TouchableOpacity
                                            key={cat}
                                            onPress={() => {
                                                setCategory(cat);
                                                scrollToChartItems();
                                            }}
                                            style={[
                                                styles.chartButton,
                                                {
                                                    backgroundColor: btnBgColor,
                                                    borderColor: btnBorderColor,
                                                },
                                            ]}
                                        >
                                            <View
                                                style={[
                                                    styles.chartButtonDot,
                                                    {
                                                        backgroundColor: dotColor,
                                                    },
                                                ]}
                                            />
                                            <ThemedText style={styles.chartButtonText}>
                                                {t(`expenses.category.${cat}`)}
                                            </ThemedText>
                                            <ThemedText style={[styles.chartButtonText, styles.chartButtonLabel]}>
                                                {percent.toFixed(1)}%
                                            </ThemedText>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            <View style={styles.chartItems} ref={listSectionRef} collapsable={false}>
                                {expenses.filter((e) => e.active && e.category === category).length === 0 ?
                                    <ThemedText>{t("expenses.noExpensesInPie")}</ThemedText>
                                :   expenses
                                        .filter((e) => e.active && e.category === category)
                                        .map((e) => ({
                                            ...e,
                                            percent:
                                                (e.yearlyTotal /
                                                    (expenses
                                                        .filter((x) => x.active)
                                                        .reduce((sum, x) => sum + x.yearlyTotal, 0) || 1)) *
                                                100,
                                        }))
                                        .sort((a, b) => b.percent - a.percent)
                                        .map((e) => (
                                            <ThemedText key={e.id} style={styles.chartItem}>
                                                <ThemedText style={styles.chartItemText}>{e.name} </ThemedText>
                                                <ThemedText style={styles.chartItemLabel}>
                                                    - {e.percent.toFixed(1)}%
                                                </ThemedText>
                                            </ThemedText>
                                        ))
                                }
                            </View>
                        </View>
                    </View>
                </>
            )}
        </>
    );

    const renderItem = useCallback(
        (props: { item: ExpenseItem }) => (
            <ExpenseItem
                expense={props.item}
                currencySymbol={currencySymbol}
                onToggleActive={handleToggleActive}
                onEdit={handleEdit}
                onDelete={confirmDelete}
                frequencyLabel={getFrequencyLabel(props.item.frequency)}
                categoryLabelMap={categoryLabelMap}
                styles={styles}
                t={t}
            />
        ),
        [currencySymbol, handleToggleActive, handleEdit, confirmDelete, getFrequencyLabel, categoryLabelMap, t, styles],
    );

    return (
        <AuthGate>
            <FlatList
                data={sortedExpenses}
                ref={flatListRef}
                keyExtractor={(expense) => expense.id}
                contentContainerStyle={sortedExpenses.length > 0 ? { backgroundColor: theme.background } : undefined}
                ListHeaderComponent={Header}
                ListFooterComponent={Footer}
                ListFooterComponentStyle={{ backgroundColor: theme.main }}
                renderItem={renderItem}
                ListEmptyComponent={
                    loading ?
                        <ThemedView style={styles.emptyState}>
                            <ThemedText style={styles.emptyStateText}>
                                <Ionicons name="time-outline" size={24} color={theme.inputText} />
                            </ThemedText>
                        </ThemedView>
                    :   <ThemedView style={styles.emptyState}>
                            <ThemedText style={styles.emptyStateText}>{t("expenses.addFirstExpense")}</ThemedText>
                        </ThemedView>
                }
            />
        </AuthGate>
    );
}
