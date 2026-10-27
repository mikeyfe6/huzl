import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, FlatList, Modal, Platform, Pressable, ScrollView, TextInput, View } from "react-native";

import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCurrency } from "@/hooks/use-currency";

import {
    formatCurrency,
    formatIncomeAverage,
    formatNumber,
    formatTotalMonthlyIncome,
    INCOME_FREQUENCIES,
} from "@/utils/helpers";
import { supabase } from "@/utils/supabase";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { AuthGate } from "@/components/ui/loading";

import { blueColor, Colors, greenColor, linkColor, mediumGreyColor, orangeColor, redColor } from "@/constants/theme";
import { baseInactive } from "@/styles/base";
import { getIncomeStyles } from "@/styles/income";

const currentDateOnly = (): string => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

const hasInvalidFixedIncomeAmount = (sources: ReadonlyArray<IncomeSource>): boolean =>
    sources.some((source) => {
        if (source.active === false || source.variable) return false;

        const amount = Number.parseFloat(formatNumber(source.amount));
        return source.amount.trim() === "" || Number.isNaN(amount) || amount < 0;
    });

const toDateOnly = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

function IncomeInput({ initialAmount, onAmountChange, onAmountBlur, placeholderColor, style }: IncomeInputProps) {
    const [localText, setLocalText] = useState(initialAmount);

    useEffect(() => {
        setLocalText(initialAmount);
    }, [initialAmount]);

    return (
        <TextInput
            style={style}
            value={localText}
            placeholder="0.00"
            placeholderTextColor={placeholderColor}
            keyboardType="decimal-pad"
            onChangeText={(text) => {
                setLocalText(text);
                onAmountChange(text);
            }}
            onBlur={() => onAmountBlur(localText)}
        />
    );
}

export default function IncomeScreen() {
    const { t } = useTranslation();
    const { user } = useAuth();

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? "light"];
    const { symbol: currencySymbol } = useCurrency();

    const [sources, setSources] = useState<IncomeSource[]>([]);
    const [originalSources, setOriginalSources] = useState<IncomeSource[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [payments, setPayments] = useState<IncomePayment[]>([]);
    const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
    const [paymentHistoryVisible, setPaymentHistoryVisible] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paymentDate, setPaymentDate] = useState(currentDateOnly());
    const [showPaymentDatePicker, setShowPaymentDatePicker] = useState(false);
    const [tempPaymentDate, setTempPaymentDate] = useState(new Date());
    const [savingPayment, setSavingPayment] = useState(false);
    const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
    const [nextIncomeVisible, setNextIncomeVisible] = useState(false);
    const [nextIncomeSourceId, setNextIncomeSourceId] = useState<string | null>(null);
    const [nextIncomeDate, setNextIncomeDate] = useState(currentDateOnly());
    const [showNextIncomePicker, setShowNextIncomePicker] = useState(false);
    const [tempNextIncomeDate, setTempNextIncomeDate] = useState(new Date());
    const [savingNextIncome, setSavingNextIncome] = useState(false);

    const styles = useMemo(() => getIncomeStyles(theme), [theme]);

    const incomeTypes = [
        { key: "salary", label: t("income.category.salary") },
        { key: "freelance", label: t("income.category.freelance") },
        { key: "benefit", label: t("income.category.benefit") },
        { key: "pension", label: t("income.category.pension") },
        { key: "alimony", label: t("income.category.alimony") },
        { key: "investment", label: t("income.category.investment") },
        { key: "other", label: t("income.category.other") },
    ];

    const updateSource = (
        idx: number,
        field: "name" | "type" | "amount" | "frequency" | "tracking_started_at",
        value: string,
    ) => {
        setSources((prev) =>
            prev.map((src, i) =>
                i === idx ?
                    {
                        ...src,
                        [field]: value,
                    }
                :   src,
            ),
        );
    };

    const addSource = () => {
        setSources((prev) => [
            ...prev,
            {
                name: "",
                type: "salary",
                amount: "",
                frequency: "monthly",
                active: true,
                variable: false,
                tracking_started_at: currentDateOnly(),
            },
        ]);
    };

    const toggleActive = (idx: number) => {
        setSources((prev) => prev.map((src, i) => (i === idx ? { ...src, active: !src.active } : src)));
    };

    const toggleVariable = (idx: number) => {
        setSources((prev) => prev.map((src, i) => (i === idx ? { ...src, variable: !src.variable } : src)));
    };

    const updateTrackedStartDate = (incomeId: string, incomePayments: ReadonlyArray<IncomePayment>) => {
        const earliestPayment = incomePayments.reduce<string | null>(
            (earliest, payment) =>
                earliest === null || payment.received_at < earliest ? payment.received_at : earliest,
            null,
        );
        const trackingStartedAt = earliestPayment ?? currentDateOnly();

        setSources((previous) =>
            previous.map((source) =>
                source.id === incomeId ? { ...source, tracking_started_at: trackingStartedAt } : source,
            ),
        );
        setOriginalSources((previous) =>
            previous.map((source) =>
                source.id === incomeId ? { ...source, tracking_started_at: trackingStartedAt } : source,
            ),
        );
    };

    const removeSource = async (idx: number) => {
        if (!user) return;

        const src = sources[idx];

        if (src.id) {
            setSaving(true);

            const { error } = await supabase.from("incomes").delete().eq("id", src.id).eq("user_id", user.id);

            if (error) {
                Alert.alert("Error", `Failed to delete income: ${error.message}`);
            }

            setSaving(false);
        }

        setSources((prev) => prev.filter((_, i) => i !== idx));
        setPayments((prev) => prev.filter((payment) => payment.income_id !== src.id));
        setSelectedSourceId((current) => (current === src.id ? null : current));
    };

    const handleAddPayment = async () => {
        if (!user || !selectedSourceId) return;

        const amount = Number.parseFloat(formatNumber(paymentAmount).trim());
        const date = new Date(`${paymentDate}T12:00:00`);
        const isValidDate =
            /^\d{4}-\d{2}-\d{2}$/.test(paymentDate) &&
            !Number.isNaN(date.getTime()) &&
            `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}` ===
                paymentDate;

        if (!Number.isFinite(amount) || amount < 0 || paymentAmount.trim() === "") {
            Alert.alert(t("income.error.invalidAmountTitle"), t("income.error.invalidAmountMsg"));
            return;
        }

        if (!isValidDate) {
            Alert.alert(t("income.error.invalidDateTitle"), t("income.error.invalidDateMsg"));
            return;
        }

        setSavingPayment(true);
        const paymentRequest =
            editingPaymentId ?
                supabase
                    .from("income_payments")
                    .update({ amount, received_at: paymentDate })
                    .eq("id", editingPaymentId)
                    .select("id, income_id, amount, received_at")
                    .single()
            :   supabase
                    .from("income_payments")
                    .insert({
                        income_id: selectedSourceId,
                        amount,
                        received_at: paymentDate,
                    })
                    .select("id, income_id, amount, received_at")
                    .single();
        const { data, error } = await paymentRequest;

        if (error) {
            Alert.alert("Error", error.message);
        } else if (data) {
            const updatedPayments =
                editingPaymentId ?
                    payments.map((payment) => (payment.id === editingPaymentId ? data : payment))
                :   [...payments, data];
            setPayments(updatedPayments);
            updateTrackedStartDate(
                selectedSourceId,
                updatedPayments.filter((payment) => payment.income_id === selectedSourceId),
            );
            setEditingPaymentId(null);
            setPaymentAmount("");
            setPaymentDate(currentDateOnly());
        }
        setSavingPayment(false);
    };

    const openNextIncomeModal = (source: IncomeSource) => {
        setNextIncomeSourceId(source.id ?? null);
        setNextIncomeDate(source.next_expected_at ?? currentDateOnly());
        setNextIncomeVisible(true);
    };

    const persistNextIncome = async (value: string | null) => {
        if (!user || !nextIncomeSourceId) return;

        if (value !== null) {
            const date = new Date(`${value}T12:00:00`);
            if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(date.getTime()) || toDateOnly(date) !== value) {
                Alert.alert(t("income.error.invalidDateTitle"), t("income.error.invalidDateMsg"));
                return;
            }
        }

        setSavingNextIncome(true);
        const { error } = await supabase
            .from("incomes")
            .update({ next_expected_at: value })
            .eq("id", nextIncomeSourceId)
            .eq("user_id", user.id);

        if (error) {
            Alert.alert("Error", error.message);
        } else {
            const apply = (list: IncomeSource[]) =>
                list.map((source) =>
                    source.id === nextIncomeSourceId ? { ...source, next_expected_at: value } : source,
                );
            setSources(apply);
            setOriginalSources(apply);
            setNextIncomeVisible(false);
        }
        setSavingNextIncome(false);
    };

    const cancelPaymentEdit = () => {
        setEditingPaymentId(null);
        setPaymentAmount("");
        setPaymentDate(currentDateOnly());
    };

    const handleDeletePayment = async (payment: IncomePayment) => {
        if (!user) return;

        const { error } = await supabase.from("income_payments").delete().eq("id", payment.id);
        if (error) {
            Alert.alert("Error", error.message);
            return;
        }

        const updatedPayments = payments.filter((item) => item.id !== payment.id);
        setPayments(updatedPayments);
        updateTrackedStartDate(
            payment.income_id,
            updatedPayments.filter((item) => item.income_id === payment.income_id),
        );
        if (editingPaymentId === payment.id) cancelPaymentEdit();
    };

    const normalizeAmountOnBlur = (idx: number, value: string) => {
        const normalizedValue = formatNumber(value).trim();

        if (normalizedValue === "") {
            updateSource(idx, "amount", normalizedValue);
            return;
        }

        const parsed = Number.parseFloat(normalizedValue);

        if (!Number.isNaN(parsed) && parsed >= 0) {
            updateSource(idx, "amount", parsed.toFixed(2));
        }
    };

    const formatAmountForInput = (value: unknown) => {
        const parsed = Number(value);

        return Number.isFinite(parsed) ? parsed.toFixed(2) : "";
    };

    const hasIncomeChanges = useMemo(() => {
        if (sources.length !== originalSources.length) return true;

        for (let i = 0; i < sources.length; i++) {
            const a = sources[i];
            const b = originalSources[i];

            if (!b) return true;

            if (
                a.name !== b.name ||
                a.type !== b.type ||
                a.amount !== b.amount ||
                a.active !== b.active ||
                a.frequency !== b.frequency ||
                a.variable !== b.variable ||
                a.tracking_started_at !== b.tracking_started_at
            )
                return true;
        }

        return false;
    }, [sources, originalSources]);

    const saveButtonDisabled = useMemo(() => {
        if (saving || !hasIncomeChanges) return true;

        const activeSources = sources.filter((src) => src.active !== false);

        if (activeSources.length === 0) return true;

        for (const src of activeSources) {
            if (src.variable) continue;

            const parsed = Number.parseFloat(formatNumber(src.amount));

            if (src.amount.trim() === "" || Number.isNaN(parsed) || parsed < 0) {
                return true;
            }
        }

        return false;
    }, [saving, hasIncomeChanges, sources]);

    const total = formatTotalMonthlyIncome(
        sources.map((source) => ({
            ...source,
            amount: Number.parseFloat(formatNumber(source.amount)),
        })),
        payments,
    );
    const hasActiveVariableIncome = sources.some((source) => source.active !== false && source.variable);

    const activeSourceIds = new Set(sources.filter((source) => source.active !== false).map((source) => source.id));
    const currentMonth = currentDateOnly().slice(0, 7);
    const receivedThisMonth = payments
        .filter((payment) => activeSourceIds.has(payment.income_id) && payment.received_at.slice(0, 7) === currentMonth)
        .reduce((sum, payment) => sum + payment.amount, 0);
    const selectedPayments = payments
        .filter((payment) => payment.income_id === selectedSourceId)
        .sort((left, right) => right.received_at.localeCompare(left.received_at));
    const selectedSource = sources.find((source) => source.id === selectedSourceId);
    const nextIncomeSource = sources.find((source) => source.id === nextIncomeSourceId);
    const getSourceAverage = (source: IncomeSource) => {
        const parsedAmount = Number.parseFloat(formatNumber(source.amount));
        const sourcePayments = source.id ? payments.filter((payment) => payment.income_id === source.id) : [];

        return formatIncomeAverage(
            Number.isFinite(parsedAmount) ? parsedAmount : 0,
            source.frequency,
            sourcePayments,
            new Date(),
            source.variable,
            source.tracking_started_at,
        );
    };
    const paymentSubmitLabel = editingPaymentId ? t("income.updatePayment") : t("income.recordPayment");
    const paymentActionText = savingPayment ? t("common.saving") : paymentSubmitLabel;

    const handleSave = async () => {
        if (!user) return;

        if (hasInvalidFixedIncomeAmount(sources)) {
            Alert.alert(t("income.error.invalidAmountTitle"), t("income.error.invalidAmountMsg"));
            return;
        }

        setSaving(true);

        try {
            const updates = sources.filter((src) => src.id);
            const inserts = sources.filter((src) => !src.id);

            for (const src of updates) {
                const { error } = await supabase
                    .from("incomes")
                    .update({
                        name: src.name?.trim() || null,
                        type: src.type,
                        amount: Number.parseFloat(formatNumber(src.amount)) || 0,
                        frequency: src.frequency,
                        active: src.active !== false,
                        variable: src.variable,
                        tracking_started_at: src.tracking_started_at,
                    })
                    .eq("id", src.id)
                    .eq("user_id", user.id);

                if (error) {
                    Alert.alert("Error", error.message);
                    return;
                }
            }

            if (inserts.length > 0) {
                const { error } = await supabase.from("incomes").insert(
                    inserts.map((src) => ({
                        user_id: user.id,
                        name: src.name?.trim() || null,
                        type: src.type,
                        amount: Number.parseFloat(formatNumber(src.amount)) || 0,
                        frequency: src.frequency,
                        active: src.active !== false,
                        variable: src.variable,
                        tracking_started_at: src.tracking_started_at,
                    })),
                );

                if (error) {
                    Alert.alert("Error", error.message);
                    return;
                }
            }

            const { data: savedData, error: savedError } = await supabase
                .from("incomes")
                .select("id, name, type, amount, frequency, active, variable, tracking_started_at, next_expected_at")
                .eq("user_id", user.id);

            if (savedError) {
                Alert.alert("Error", savedError.message);
                return;
            }

            const savedSources: IncomeSource[] = (savedData ?? []).map((row) => ({
                id: row.id,
                name: row.name ?? "",
                type: row.type,
                amount: formatAmountForInput(row.amount),
                frequency: (row.frequency ?? "monthly") as IncomeFrequency,
                active: row.active !== false,
                variable: row.variable === true,
                tracking_started_at: row.tracking_started_at ?? currentDateOnly(),
                next_expected_at: row.next_expected_at ?? null,
            }));
            setSources(savedSources);
            setOriginalSources(savedSources);
            setSelectedSourceId((current) =>
                current && savedSources.some((source) => source.id === current) ?
                    current
                :   (savedSources[0]?.id ?? null),
            );

            Alert.alert(t("income.saved"), t("income.savedMsg"));
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Unexpected error");
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        if (!user) return;

        setLoading(true);

        const loadIncome = async () => {
            const { data, error } = await supabase
                .from("incomes")
                .select("id, name, type, amount, frequency, active, variable, tracking_started_at, next_expected_at")
                .eq("user_id", user.id);
            let mappedSources: IncomeSource[];

            if (error) {
                Alert.alert("Error", error.message);
                mappedSources = [];
            } else if (data && data.length > 0) {
                mappedSources = data.map((row) => ({
                    id: row.id,
                    name: row.name ?? "",
                    type: row.type,
                    amount: formatAmountForInput(row.amount),
                    frequency: (row.frequency ?? "monthly") as IncomeFrequency,
                    active: row.active !== false,
                    variable: row.variable === true,
                    tracking_started_at: row.tracking_started_at ?? currentDateOnly(),
                    next_expected_at: row.next_expected_at ?? null,
                }));
            } else {
                mappedSources = [
                    {
                        name: "",
                        type: "salary",
                        amount: "",
                        frequency: "monthly",
                        active: true,
                        variable: false,
                        tracking_started_at: currentDateOnly(),
                    },
                ];
            }

            setSources(mappedSources);
            setOriginalSources(mappedSources);
            setSelectedSourceId(mappedSources.find((source) => source.id)?.id ?? null);

            const { data: paymentData, error: paymentError } = await supabase
                .from("income_payments")
                .select("id, income_id, amount, received_at")
                .order("received_at", { ascending: false });

            if (paymentError) {
                Alert.alert("Error", paymentError.message);
                setPayments([]);
            } else {
                setPayments(paymentData ?? []);
            }

            setLoading(false);
        };

        void loadIncome();
    }, [user]);

    return (
        <AuthGate>
            <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.container}>
                <ThemedView style={styles.fieldset}>
                    <ThemedText type="title" style={styles.heading}>
                        {t("income.title")}
                    </ThemedText>
                    <ThemedText style={styles.subtitle}>{t("income.subtitle")}</ThemedText>

                    {loading ?
                        <ThemedText>Loading...</ThemedText>
                    :   sources.map((src, idx) => (
                            <View key={src.id ?? idx} style={styles.wrapper}>
                                <View style={[styles.item, !src.active && baseInactive]}>
                                    <View style={styles.nameRow}>
                                        <TextInput
                                            style={[styles.input, styles.nameInput]}
                                            value={src.name ?? ""}
                                            placeholder={t("income.namePlaceholder")}
                                            placeholderTextColor={theme.placeholder}
                                            onChangeText={(text) => updateSource(idx, "name", text)}
                                            accessibilityLabel={t("income.namePlaceholder")}
                                        />
                                        <Pressable
                                            style={styles.nextDate}
                                            disabled={!src.id}
                                            onPress={() => openNextIncomeModal(src)}
                                            accessibilityRole="button"
                                            accessibilityLabel={t("income.nextIncome")}
                                        >
                                            <Ionicons name="calendar-outline" size={16} color={orangeColor} />
                                            <ThemedText style={styles.nextDateLabel}>
                                                {src.next_expected_at ?
                                                    new Date(`${src.next_expected_at}T12:00:00`).toLocaleDateString(
                                                        t("seo.lang"),
                                                    )
                                                :   "-"}
                                            </ThemedText>
                                        </Pressable>
                                    </View>
                                    <View style={styles.amountRow}>
                                        {src.variable ?
                                            <View
                                                style={styles.variableAverage}
                                                accessible
                                                accessibilityLabel={t("income.monthlyAverage")}
                                            >
                                                <Ionicons name="analytics" size={18} color={linkColor} />
                                                <ThemedText style={[styles.input, styles.amountInput]}>
                                                    {getSourceAverage(src).paymentCount > 0 ?
                                                        formatCurrency(getSourceAverage(src).amount, currencySymbol)
                                                    :   t("income.variableNoPayments")}
                                                </ThemedText>
                                            </View>
                                        :   <IncomeInput
                                                style={[styles.input, styles.amountInput]}
                                                initialAmount={src.amount}
                                                placeholderColor={theme.placeholder}
                                                onAmountChange={(text) => updateSource(idx, "amount", text)}
                                                onAmountBlur={(value) => normalizeAmountOnBlur(idx, value)}
                                            />
                                        }
                                        <Pressable
                                            style={styles.variableToggle}
                                            onPress={() => toggleVariable(idx)}
                                            accessibilityRole="checkbox"
                                            accessibilityState={{ checked: src.variable }}
                                        >
                                            <Ionicons
                                                name={src.variable ? "checkbox" : "square-outline"}
                                                size={18}
                                                color={src.variable ? linkColor : mediumGreyColor}
                                            />
                                            <ThemedText style={styles.variableLabel}>
                                                {t("income.variableIncome")}
                                            </ThemedText>
                                        </Pressable>
                                    </View>

                                    <FlatList
                                        data={incomeTypes}
                                        horizontal
                                        keyExtractor={(item) => item.key}
                                        style={styles.category}
                                        renderItem={({ item, index }) => {
                                            const isLast = index === incomeTypes.length - 1;
                                            return (
                                                <Pressable
                                                    style={[
                                                        styles.type,
                                                        {
                                                            borderColor:
                                                                src.type === item.key ? linkColor : theme.inputBorder,
                                                            marginRight: isLast ? 0 : 8,
                                                        },
                                                    ]}
                                                    onPress={() => updateSource(idx, "type", item.key)}
                                                >
                                                    <ThemedText style={styles.typeText}>{item.label}</ThemedText>
                                                </Pressable>
                                            );
                                        }}
                                        showsHorizontalScrollIndicator={false}
                                    />

                                    <FlatList
                                        data={INCOME_FREQUENCIES}
                                        horizontal
                                        keyExtractor={(item) => item}
                                        style={styles.frequency}
                                        renderItem={({ item, index }) => (
                                            <Pressable
                                                style={[
                                                    styles.type,
                                                    {
                                                        borderColor:
                                                            src.frequency === item ? linkColor : theme.inputBorder,
                                                        marginRight: index === INCOME_FREQUENCIES.length - 1 ? 0 : 8,
                                                    },
                                                ]}
                                                onPress={() => updateSource(idx, "frequency", item)}
                                            >
                                                <ThemedText style={styles.typeText}>
                                                    {t(`income.frequency.${item}`)}
                                                </ThemedText>
                                            </Pressable>
                                        )}
                                        showsHorizontalScrollIndicator={false}
                                    />
                                </View>

                                <View style={styles.icons}>
                                    <Pressable
                                        onPress={() => toggleActive(idx)}
                                        style={[
                                            styles.icon,
                                            {
                                                borderColor: src.active ? greenColor : mediumGreyColor,
                                            },
                                        ]}
                                    >
                                        <Ionicons
                                            name={src.active ? "eye" : "eye-off"}
                                            size={16}
                                            color={src.active ? greenColor : mediumGreyColor}
                                        />
                                    </Pressable>

                                    {src.id && (
                                        <Pressable
                                            onPress={() => openNextIncomeModal(src)}
                                            style={[styles.icon, { borderColor: orangeColor }]}
                                            accessibilityRole="button"
                                            accessibilityLabel={t("income.nextIncome")}
                                        >
                                            <Ionicons name="calendar-outline" size={16} color={orangeColor} />
                                        </Pressable>
                                    )}

                                    {src.variable && (
                                        <Pressable
                                            onPress={() => {
                                                setSelectedSourceId(src.id ?? null);
                                                setPaymentHistoryVisible(true);
                                            }}
                                            style={[styles.icon, { borderColor: blueColor }]}
                                            accessibilityRole="button"
                                            accessibilityLabel={t("income.paymentHistory")}
                                        >
                                            <Ionicons name="cash-outline" size={16} color={blueColor} />
                                        </Pressable>
                                    )}

                                    {sources.length > 1 && (
                                        <Pressable
                                            onPress={() => removeSource(idx)}
                                            style={[styles.icon, { borderColor: redColor }]}
                                        >
                                            <Ionicons name="trash" size={16} color={redColor} />
                                        </Pressable>
                                    )}
                                </View>
                            </View>
                        ))
                    }

                    <Pressable onPress={addSource} style={styles.add}>
                        <ThemedText style={styles.addText}>+ {t("income.addSource")}</ThemedText>
                    </Pressable>

                    {hasActiveVariableIncome ?
                        <>
                            <View style={styles.total}>
                                <ThemedText>{t("income.actualMonthlyTotal")}:</ThemedText>
                                <ThemedText type="defaultSemiBold">
                                    {formatCurrency(receivedThisMonth, currencySymbol)}
                                </ThemedText>
                            </View>

                            <View style={styles.total}>
                                <ThemedText>{t("income.monthlyAverage")}:</ThemedText>
                                <ThemedText type="defaultSemiBold">{formatCurrency(total, currencySymbol)}</ThemedText>
                            </View>
                            <ThemedText style={styles.totalAverage}>{t("income.averagePeriod")}</ThemedText>
                        </>
                    :   <View style={styles.total}>
                            <ThemedText>{t("income.monthlyTotal")}:</ThemedText>
                            <ThemedText type="defaultSemiBold">{formatCurrency(total, currencySymbol)}</ThemedText>
                        </View>
                    }

                    <View style={styles.total}>
                        <ThemedText>{t("income.yearlyTotal")}:</ThemedText>
                        <ThemedText type="defaultSemiBold">{formatCurrency(total * 12, currencySymbol)}</ThemedText>
                    </View>

                    <ThemedView style={styles.buttons}>
                        <Pressable style={styles.closeButton} onPress={() => router.back()}>
                            <ThemedText style={styles.closeButtonText}>{t("common.close")}</ThemedText>
                        </Pressable>

                        <Pressable
                            style={[styles.saveButton, saveButtonDisabled && baseInactive]}
                            disabled={saveButtonDisabled}
                            onPress={handleSave}
                        >
                            <ThemedText style={styles.saveButtonText}>
                                {saving ? t("common.saving") : t("common.save")}
                            </ThemedText>
                        </Pressable>
                    </ThemedView>
                </ThemedView>
            </ScrollView>
            <Modal
                transparent
                animationType="fade"
                visible={paymentHistoryVisible}
                onRequestClose={() => setPaymentHistoryVisible(false)}
            >
                <View style={styles.overlay}>
                    <View style={styles.modal}>
                        <View style={styles.header}>
                            <ThemedText type="defaultSemiBold">
                                {selectedSource ?
                                    `${t("income.category." + selectedSource.type)} · ${t("income.frequency." + selectedSource.frequency)}`
                                :   t("income.paymentHistory")}
                            </ThemedText>
                            <Pressable
                                onPress={() => setPaymentHistoryVisible(false)}
                                style={[styles.icon, { borderColor: redColor }]}
                                accessibilityRole="button"
                                accessibilityLabel={t("common.close")}
                            >
                                <Ionicons name="close" size={18} color={redColor} />
                            </Pressable>
                        </View>
                        <ScrollView style={{ flexGrow: 0, flexShrink: 1 }} keyboardShouldPersistTaps="handled">
                            {selectedSource?.id ?
                                <>
                                    <TextInput
                                        style={styles.paymentInput}
                                        value={paymentAmount}
                                        placeholder={t("income.receivedAmount")}
                                        placeholderTextColor={theme.placeholder}
                                        keyboardType="decimal-pad"
                                        onChangeText={setPaymentAmount}
                                        accessibilityLabel={t("income.receivedAmount")}
                                    />
                                    {Platform.OS === "web" ?
                                        <input
                                            type="date"
                                            value={paymentDate}
                                            onChange={(event) => setPaymentDate(event.currentTarget.value)}
                                            aria-label={t("income.receivedDate")}
                                            style={styles.dateInput}
                                        />
                                    :   <Pressable
                                            style={styles.paymentInput}
                                            onPress={() => {
                                                const date = new Date(`${paymentDate}T12:00:00`);
                                                setTempPaymentDate(Number.isNaN(date.getTime()) ? new Date() : date);
                                                setShowPaymentDatePicker(true);
                                            }}
                                            accessibilityRole="button"
                                            accessibilityLabel={t("income.receivedDate")}
                                        >
                                            <ThemedText>
                                                {new Date(`${paymentDate}T12:00:00`).toLocaleDateString(t("seo.lang"))}
                                            </ThemedText>
                                        </Pressable>
                                    }
                                    {Platform.OS === "android" && showPaymentDatePicker && (
                                        <DateTimePicker
                                            value={tempPaymentDate}
                                            mode="date"
                                            display="default"
                                            onValueChange={(_, date) => {
                                                setShowPaymentDatePicker(false);
                                                if (date) setPaymentDate(toDateOnly(date));
                                            }}
                                            onDismiss={() => setShowPaymentDatePicker(false)}
                                        />
                                    )}
                                    <View style={styles.buttons}>
                                        <Pressable
                                            style={[
                                                styles.saveButton,
                                                styles.paymentAction,
                                                savingPayment && baseInactive,
                                            ]}
                                            disabled={savingPayment || paymentAmount.trim() === ""}
                                            onPress={handleAddPayment}
                                        >
                                            <ThemedText style={styles.saveButtonText}>{paymentActionText}</ThemedText>
                                        </Pressable>
                                        {editingPaymentId && (
                                            <Pressable
                                                style={[styles.closeButton, styles.paymentAction]}
                                                disabled={savingPayment}
                                                onPress={cancelPaymentEdit}
                                            >
                                                <ThemedText style={styles.closeButtonText}>
                                                    {t("common.cancel")}
                                                </ThemedText>
                                            </Pressable>
                                        )}
                                    </View>

                                    <View style={styles.paymentList}>
                                        {selectedPayments.length === 0 ?
                                            <ThemedText style={styles.noPayments}>{t("income.noPayments")}</ThemedText>
                                        :   selectedPayments.map((payment) => (
                                                <View key={payment.id} style={styles.paymentRow}>
                                                    <ThemedText>
                                                        {new Date(`${payment.received_at}T12:00:00`).toLocaleDateString(
                                                            t("seo.lang"),
                                                        )}
                                                    </ThemedText>
                                                    <View style={styles.paymentAmountIcons}>
                                                        <ThemedText type="defaultSemiBold" style={styles.paymentAmount}>
                                                            {formatCurrency(payment.amount, currencySymbol)}
                                                        </ThemedText>
                                                        <Pressable
                                                            onPress={() => {
                                                                setEditingPaymentId(payment.id);
                                                                setPaymentAmount(payment.amount.toFixed(2));
                                                                setPaymentDate(payment.received_at);
                                                            }}
                                                            accessibilityRole="button"
                                                            accessibilityLabel={t("income.editPayment")}
                                                            style={[styles.icon, { borderColor: mediumGreyColor }]}
                                                        >
                                                            <Ionicons name="pencil" size={16} color={mediumGreyColor} />
                                                        </Pressable>
                                                        <Pressable
                                                            onPress={() => void handleDeletePayment(payment)}
                                                            accessibilityRole="button"
                                                            accessibilityLabel={t("income.deletePayment")}
                                                            style={[styles.icon, { borderColor: redColor }]}
                                                        >
                                                            <Ionicons name="trash" size={16} color={redColor} />
                                                        </Pressable>
                                                    </View>
                                                </View>
                                            ))
                                        }
                                    </View>
                                    {selectedPayments.length > 0 && (
                                        <>
                                            <ThemedText style={styles.averageText}>
                                                {t("income.trackingStartsOn")}:{" "}
                                                {new Date(
                                                    `${selectedSource.tracking_started_at}T12:00:00`,
                                                ).toLocaleDateString(t("seo.lang"))}
                                            </ThemedText>
                                            <ThemedText style={styles.averageDescription}>
                                                {t("income.trackingStartHelp")}
                                            </ThemedText>
                                        </>
                                    )}
                                </>
                            :   <ThemedText style={styles.averageText}>{t("income.saveSourceFirst")}</ThemedText>}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
            <Modal
                transparent
                animationType="fade"
                visible={nextIncomeVisible}
                onRequestClose={() => setNextIncomeVisible(false)}
            >
                <View style={styles.overlay}>
                    <View style={styles.modal}>
                        <View style={styles.header}>
                            <ThemedText type="defaultSemiBold">
                                {nextIncomeSource ?
                                    `${t("income.category." + nextIncomeSource.type)} · ${t("income.frequency." + nextIncomeSource.frequency)}`
                                :   t("income.nextIncome")}
                            </ThemedText>
                            <Pressable
                                onPress={() => setNextIncomeVisible(false)}
                                style={[styles.icon, { borderColor: redColor }]}
                                accessibilityRole="button"
                                accessibilityLabel={t("common.close")}
                            >
                                <Ionicons name="close" size={18} color={redColor} />
                            </Pressable>
                        </View>
                        <ThemedText style={styles.averageDescription}>{t("income.nextIncomeHelp")}</ThemedText>
                        <View style={{ marginTop: 12 }}>
                            {Platform.OS === "web" ?
                                <input
                                    type="date"
                                    value={nextIncomeDate}
                                    onChange={(event) => setNextIncomeDate(event.currentTarget.value)}
                                    aria-label={t("income.nextIncomeDate")}
                                    style={styles.dateInput}
                                />
                            :   <Pressable
                                    style={styles.paymentInput}
                                    onPress={() => {
                                        const date = new Date(`${nextIncomeDate}T12:00:00`);
                                        setTempNextIncomeDate(Number.isNaN(date.getTime()) ? new Date() : date);
                                        setShowNextIncomePicker(true);
                                    }}
                                    accessibilityRole="button"
                                    accessibilityLabel={t("income.nextIncomeDate")}
                                >
                                    <ThemedText>
                                        {new Date(`${nextIncomeDate}T12:00:00`).toLocaleDateString(t("seo.lang"))}
                                    </ThemedText>
                                </Pressable>
                            }
                            {Platform.OS === "android" && showNextIncomePicker && (
                                <DateTimePicker
                                    value={tempNextIncomeDate}
                                    mode="date"
                                    display="default"
                                    onValueChange={(_, date) => {
                                        setShowNextIncomePicker(false);
                                        if (date) setNextIncomeDate(toDateOnly(date));
                                    }}
                                    onDismiss={() => setShowNextIncomePicker(false)}
                                />
                            )}
                        </View>
                        <View style={styles.buttons}>
                            {nextIncomeSource?.next_expected_at && (
                                <Pressable
                                    style={[styles.closeButton, styles.paymentAction, savingNextIncome && baseInactive]}
                                    disabled={savingNextIncome}
                                    onPress={() => void persistNextIncome(null)}
                                >
                                    <ThemedText style={styles.closeButtonText}>
                                        {t("income.clearNextIncome")}
                                    </ThemedText>
                                </Pressable>
                            )}
                            <Pressable
                                style={[styles.saveButton, styles.paymentAction, savingNextIncome && baseInactive]}
                                disabled={savingNextIncome}
                                onPress={() => void persistNextIncome(nextIncomeDate)}
                            >
                                <ThemedText style={styles.saveButtonText}>
                                    {savingNextIncome ? t("common.saving") : t("common.save")}
                                </ThemedText>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
            {Platform.OS === "ios" && (
                <Modal
                    transparent
                    animationType="fade"
                    visible={showNextIncomePicker}
                    onRequestClose={() => setShowNextIncomePicker(false)}
                >
                    <View style={styles.overlay}>
                        <View style={styles.datePicker}>
                            <DateTimePicker
                                value={tempNextIncomeDate}
                                mode="date"
                                display="spinner"
                                onValueChange={(_, date) => date && setTempNextIncomeDate(date)}
                            />
                            <View style={styles.paymentActions}>
                                <Pressable
                                    style={[styles.closeButton, styles.paymentAction]}
                                    onPress={() => setShowNextIncomePicker(false)}
                                >
                                    <ThemedText style={styles.closeButtonText}>{t("common.cancel")}</ThemedText>
                                </Pressable>
                                <Pressable
                                    style={[styles.saveButton, styles.paymentAction]}
                                    onPress={() => {
                                        setNextIncomeDate(toDateOnly(tempNextIncomeDate));
                                        setShowNextIncomePicker(false);
                                    }}
                                >
                                    <ThemedText style={styles.saveButtonText}>{t("common.save")}</ThemedText>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}
            {Platform.OS === "ios" && (
                <Modal
                    transparent
                    animationType="fade"
                    visible={showPaymentDatePicker}
                    onRequestClose={() => setShowPaymentDatePicker(false)}
                >
                    <View style={styles.overlay}>
                        <View style={styles.datePicker}>
                            <DateTimePicker
                                value={tempPaymentDate}
                                mode="date"
                                display="spinner"
                                onValueChange={(_, date) => date && setTempPaymentDate(date)}
                            />
                            <View style={styles.paymentActions}>
                                <Pressable
                                    style={[styles.closeButton, styles.paymentAction]}
                                    onPress={() => setShowPaymentDatePicker(false)}
                                >
                                    <ThemedText style={styles.closeButtonText}>{t("common.cancel")}</ThemedText>
                                </Pressable>
                                <Pressable
                                    style={[styles.saveButton, styles.paymentAction]}
                                    onPress={() => {
                                        setPaymentDate(toDateOnly(tempPaymentDate));
                                        setShowPaymentDatePicker(false);
                                    }}
                                >
                                    <ThemedText style={styles.saveButtonText}>{t("common.save")}</ThemedText>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}
        </AuthGate>
    );
}
