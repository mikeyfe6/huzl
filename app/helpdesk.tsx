import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Linking, Platform, Pressable, ScrollView, TextInput, View } from "react-native";

import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";

import { formatCapitalize } from "@/utils/helpers";
import { supabase } from "@/utils/supabase";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

import { Colors, redColor } from "@/constants/theme";
import { getHelpdeskStyles } from "@/styles/helpdesk";

export default function HelpdeskScreen() {
    const { t } = useTranslation();
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [message, setMessage] = useState("");
    const [type, setType] = useState("feedback");
    const [submitting, setSubmitting] = useState(false);
    const [tickets, setTickets] = useState<TicketItem[]>([]);
    const [loading, setLoading] = useState(false);

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? "light"];
    const styles = useMemo(() => getHelpdeskStyles(theme), [theme]);

    const handleDelete = async (id: string) => {
        if (!user) return;
        setLoading(true);
        const { error } = await supabase.from("helpdesk").delete().eq("id", id).eq("user_id", user.id);
        if (!error) {
            setTickets((prev) => prev.filter((t) => t.id !== id));
        }
        setLoading(false);
    };

    const confirmDelete = (id: string, message: string) => {
        if (Platform.OS === "web") {
            const ok = globalThis.confirm(`${t("common.delete")} "${message.slice(0, 20)}"?`);
            if (ok) void handleDelete(id);
            return;
        }
        Alert.alert(t("helpdesk.deleteTicket"), `${t("common.delete")} "${message.slice(0, 20)}"?`, [
            { text: t("common.cancel"), style: "cancel" },
            {
                text: t("common.delete"),
                style: "destructive",
                onPress: () => {
                    void handleDelete(id);
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
        if (!user) return;
        if (!message.trim()) {
            Alert.alert("Please enter your feedback.");
            return;
        }
        setSubmitting(true);
        try {
            const { error } = await supabase.from("helpdesk").insert([
                {
                    user_id: user.id,
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
                void fetchTickets();
            }
        } catch (e) {
            console.error("Helpdesk submission error:", e);
            Alert.alert("Error", "Could not send feedback.");
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        void fetchTickets();
    }, [user?.id]);

    return (
        <ScrollView contentContainerStyle={styles.container} contentInsetAdjustmentBehavior="automatic">
            <ThemedView style={styles.fieldset}>
                <ThemedText type="title" style={styles.heading}>
                    {t("helpdesk.title")}
                </ThemedText>

                <ThemedText style={styles.subtitle}>
                    {t("helpdesk.supportIntro")}
                    {(!authLoading && !user && t("helpdesk.supportMailUs")) || t("helpdesk.supportTicket")}
                </ThemedText>

                {!authLoading && !user && (
                    <Pressable onPress={() => Linking.openURL(`mailto:${t("helpdesk.supportEmail")}`)}>
                        <ThemedText type="link" style={styles.email}>
                            {t("helpdesk.supportEmail")}
                        </ThemedText>
                        <ThemedText style={styles.or}>{t("helpdesk.supportOr")}</ThemedText>
                    </Pressable>
                )}
            </ThemedView>

            {!authLoading && !user && (
                <ThemedView style={styles.login}>
                    <Pressable onPress={() => router.dismiss()} style={styles.loginButton}>
                        <ThemedText style={styles.loginButtonText}>{t("helpdesk.signInPrompt")}</ThemedText>
                    </Pressable>
                    <ThemedView style={styles.emptyState}>
                        <ThemedText style={styles.emptyStateText}>{t("helpdesk.signInText")}</ThemedText>
                    </ThemedView>
                </ThemedView>
            )}

            {user && (
                <ThemedView style={styles.fieldset}>
                    <ThemedText style={styles.label}>{t("helpdesk.label.type")}</ThemedText>
                    <View style={styles.select}>
                        <Picker
                            selectedValue={type}
                            onValueChange={(value) => setType(value)}
                            style={
                                Platform.OS === "android" ?
                                    styles.selectInputAndroid
                                :   [
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
                                    ]
                            }
                            dropdownIconColor={Platform.OS === "android" ? theme.inputText : undefined}
                            itemStyle={styles.selectOption}
                        >
                            <Picker.Item label={t("helpdesk.type.bug")} value="bug" />
                            <Picker.Item label={t("helpdesk.type.feedback")} value="feedback" />
                            <Picker.Item label={t("helpdesk.type.support")} value="support" />
                        </Picker>
                        {Platform.OS === "web" && (
                            <Ionicons name="chevron-down" size={18} color={theme.inputText} style={styles.selectIcon} />
                        )}
                    </View>

                    <ThemedText style={styles.label}>{t("helpdesk.label.message")}</ThemedText>
                    <TextInput
                        style={styles.input}
                        placeholder={t("helpdesk.placeholder.message")}
                        placeholderTextColor={theme.placeholder}
                        value={message}
                        onChangeText={setMessage}
                        multiline
                    />

                    <Pressable style={styles.button} onPress={handleSubmit} disabled={loading || submitting}>
                        <ThemedText style={styles.buttonText}>
                            {submitting ? t("common.sending") : t("common.send")}
                        </ThemedText>
                    </Pressable>
                </ThemedView>
            )}

            {user && tickets.length > 0 && (
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
                            <Pressable
                                onPress={() => confirmDelete(ticket.id, ticket.message)}
                                disabled={loading}
                                style={styles.icon}
                            >
                                <Ionicons name="trash" size={18} color={redColor} />
                            </Pressable>
                        </View>
                    ))}
                </ThemedView>
            )}

            {user && loading ?
                <ThemedView style={styles.emptyState}>
                    <ThemedText style={styles.emptyStateText}>
                        <Ionicons name="time-outline" size={24} color={theme.inputText} />
                    </ThemedText>
                </ThemedView>
            :   user &&
                !loading &&
                tickets.length === 0 && (
                    <ThemedView style={styles.emptyState}>
                        <ThemedText style={styles.emptyStateText}>{t("helpdesk.noTickets")}</ThemedText>
                    </ThemedView>
                )
            }
        </ScrollView>
    );
}
