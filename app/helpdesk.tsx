import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";

import { formatCapitalize } from "@/utils/helpers";
import { supabase } from "@/utils/supabase";

import { AuthGate } from "@/components/loading";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

import { Colors, greenColor, redColor } from "@/constants/theme";
import {
    baseButton,
    baseButtonText,
    baseCard,
    baseEmpty,
    baseEmptyText,
    baseFlex,
    baseInput,
    baseLabel,
    baseList,
    baseMain,
    baseMini,
    baseSelect,
    baseSize,
    baseSpace,
} from "@/styles/base";

type Ticket = {
    id: string;
    type: string;
    message: string;
    created_at: string;
};

export default function HelpdeskScreen() {
    const { t } = useTranslation();
    const { user } = useAuth();

    const [message, setMessage] = useState("");
    const [type, setType] = useState("feedback");
    const [submitting, setSubmitting] = useState(false);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(false);

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? "light"];

    const handleDeleteTicket = async (id: string) => {
        if (!user) return;
        setLoading(true);
        const { error } = await supabase.from("helpdesk").delete().eq("id", id).eq("user_id", user.id);
        if (!error) {
            setTickets((prev) => prev.filter((t) => t.id !== id));
        }
        setLoading(false);
    };

    const confirmDeleteTicket = (id: string, message: string) => {
        if (Platform.OS === "web") {
            const ok = globalThis.confirm(`${t("helpdesk.delete")} "${message.slice(0, 20)}"?`);
            if (ok) handleDeleteTicket(id);
            return;
        }
        Alert.alert(t("helpdesk.deleteTicket"), `${t("helpdesk.delete")} "${message.slice(0, 20)}"?`, [
            { text: t("helpdesk.cancel"), style: "cancel" },
            {
                text: t("helpdesk.delete"),
                style: "destructive",
                onPress: () => {
                    void handleDeleteTicket(id);
                },
            },
        ]);
    };

    const fetchTickets = async () => {
        if (!user?.id) return;
        setLoading(true);
        const { data, error } = await supabase
            .from("helpdesk")
            .select("id, type, message, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });
        if (!error) setTickets(data || []);
        setLoading(false);
    };

    const handleSubmit = async () => {
        if (!message.trim()) {
            Alert.alert("Please enter your feedback.");
            return;
        }
        setSubmitting(true);
        try {
            const { error } = await supabase.from("helpdesk").insert([
                {
                    user_id: user?.id,
                    message,
                    type,
                    created_at: new Date().toISOString(),
                },
            ]);
            if (error) {
                Alert.alert("Error", error.message);
            } else {
                setMessage("");
                setType("feedback");
                Alert.alert("Thank you for your feedback!");
                fetchTickets();
            }
        } catch (e) {
            console.error("Helpdesk submission error:", e);
            Alert.alert("Error", "Could not send feedback.");
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, [user?.id]);

    const styles = useMemo(
        () =>
            StyleSheet.create({
                container: {
                    paddingBottom: 24,
                },
                fieldset: {
                    ...baseMain,
                },
                heading: {
                    marginBottom: 16,
                },
                label: {
                    ...baseLabel(theme),
                },
                input: {
                    ...baseInput(theme),
                    ...baseSelect,
                    height: 100,
                },
                select: {
                    ...baseInput(theme),
                    justifyContent: "center",
                    overflow: Platform.select({
                        ios: "hidden",
                        android: "hidden",
                        default: "visible",
                    }),
                    height: Platform.select({
                        ios: 125,
                        android: undefined,
                        default: undefined,
                    }),
                },
                selectInput: {
                    ...baseInput(theme),
                    borderWidth: 0,
                    fontFamily: "System",
                    color: theme.inputText,
                    height: Platform.select({
                        ios: 216,
                        android: 44,
                        default: 44,
                    }),
                    paddingHorizontal: Platform.select({
                        ios: 0,
                        android: 0,
                        default: 12,
                    }),
                    paddingVertical: Platform.select({
                        ios: 0,
                        android: 0,
                        default: 10,
                    }),
                    minHeight: Platform.select({
                        android: "100%",
                    }),
                },
                selectOption: {
                    ...baseSize,
                    color: theme.inputText,
                },
                selectIcon: {
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    marginTop: -9,
                    pointerEvents: "none",
                },
                button: {
                    ...baseButton,
                    marginTop: 8,
                    backgroundColor: greenColor,
                },
                buttonText: { ...baseButtonText },
                list: { ...baseList },
                header: {
                    marginBottom: 8,
                },
                item: {
                    ...baseFlex("space-between", "flex-start"),
                    ...baseCard(theme),
                },
                itemContent: {
                    ...baseSpace,
                    flex: 1,
                },
                time: {
                    ...baseMini,
                    opacity: 0.7,
                    color: theme.label,
                },
                emptyState: {
                    ...baseEmpty,
                },
                emptyStateText: {
                    ...baseEmptyText(theme),
                },
            }),
        [theme]
    );

    return (
        <AuthGate>
            <ScrollView contentContainerStyle={styles.container}>
                <ThemedView style={styles.fieldset}>
                    <ThemedText type="title" style={styles.heading}>
                        {t("helpdesk.title")}
                    </ThemedText>

                    <ThemedText style={styles.label}>{t("helpdesk.type")}</ThemedText>
                    <View style={styles.select}>
                        <Picker
                            selectedValue={type}
                            onValueChange={(value) => setType(value)}
                            style={[
                                styles.selectInput,
                                Platform.OS === "web"
                                    ? ([
                                          {
                                              appearance: "none",
                                              WebkitAppearance: "none",
                                              MozAppearance: "none",
                                          } as any,
                                      ] as any)
                                    : null,
                            ]}
                            itemStyle={styles.selectOption}
                        >
                            <Picker.Item label={t("helpdesk.bug")} value="bug" />
                            <Picker.Item label={t("helpdesk.feedback")} value="feedback" />
                            <Picker.Item label={t("helpdesk.support")} value="support" />
                        </Picker>
                        {Platform.OS === "web" && (
                            <Ionicons name="chevron-down" size={18} color={theme.inputText} style={styles.selectIcon} />
                        )}
                    </View>

                    <ThemedText style={styles.label}>{t("helpdesk.message")}</ThemedText>
                    <TextInput
                        style={styles.input}
                        placeholder={t("helpdesk.messagePlaceholder")}
                        placeholderTextColor={theme.placeholder}
                        value={message}
                        onChangeText={setMessage}
                        multiline
                    />

                    <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading || submitting}>
                        <ThemedText style={styles.buttonText}>
                            {submitting ? t("helpdesk.sending") : t("helpdesk.send")}
                        </ThemedText>
                    </TouchableOpacity>
                </ThemedView>

                {tickets.length > 0 && (
                    <ThemedView style={styles.list}>
                        <ThemedText type="subtitle" style={styles.header}>
                            {t("helpdesk.yourTickets")}
                        </ThemedText>
                        {tickets.map((ticket) => (
                            <View key={ticket.id} style={styles.item}>
                                <View style={styles.itemContent}>
                                    <ThemedText type="defaultSemiBold">{formatCapitalize(ticket.type)}</ThemedText>
                                    <ThemedText>{ticket.message}</ThemedText>
                                    <ThemedText style={styles.time}>
                                        {new Date(ticket.created_at).toLocaleString()}
                                    </ThemedText>
                                </View>
                                <TouchableOpacity
                                    onPress={() => confirmDeleteTicket(ticket.id, ticket.message)}
                                    disabled={loading}
                                >
                                    <Ionicons name="trash" size={18} color={redColor} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ThemedView>
                )}

                {loading ? (
                    <ThemedView style={styles.emptyState}>
                        <ThemedText style={styles.emptyStateText}>
                            <Ionicons name="time-outline" size={24} color={theme.inputText} />
                        </ThemedText>
                    </ThemedView>
                ) : (
                    !loading &&
                    tickets.length === 0 && (
                        <ThemedView style={styles.emptyState}>
                            <ThemedText style={styles.emptyStateText}>{t("helpdesk.noTickets")}</ThemedText>
                        </ThemedView>
                    )
                )}
            </ScrollView>
        </AuthGate>
    );
}
