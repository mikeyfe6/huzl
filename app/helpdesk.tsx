import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Button, Platform, ScrollView, StyleSheet, TextInput, View } from "react-native";

import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";

import { supabase } from "@/utils/supabase";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

import { Colors } from "@/constants/theme";
import {
    baseEmpty,
    baseEmptyText,
    baseInput,
    baseLabel,
    baseList,
    baseMain,
    baseSelect,
    baseSize,
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
    const [loadingTickets, setLoadingTickets] = useState(false);

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? "light"];

    const fetchTickets = async () => {
        if (!user?.id) return;
        setLoadingTickets(true);
        const { data, error } = await supabase
            .from("helpdesk")
            .select("id, type, message, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });
        if (!error) setTickets(data || []);
        setLoadingTickets(false);
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                list: { ...baseList },
                header: {
                    marginBottom: 8,
                },
                emptyState: {
                    ...baseEmpty,
                },
                emptyStateText: {
                    ...baseEmptyText(theme),
                },
                // input: {
                //     ...baseInput(theme),
                //     ...baseSelect,
                // },
                // buttons: {
                //     ...baseFlex("center"),
                //     ...baseGap,
                //     marginTop: 8,
                // },
                // button: {
                //     ...baseButton,
                // },
                // buttonText: { ...baseButtonText },
                // list: { ...baseList },
                // header: {
                //     marginBottom: 8,
                // },
                // item: {
                //     ...baseCard(theme),
                // },
                // itemHeader: {
                //     ...baseFlex("space-between", "flex-start"),
                //     ...baseGap,
                // },
                // itemTitle: {
                //     flex: 1,
                // },
                // itemLabel: {
                //     ...baseWeight,
                //     ...baseSmall,
                //     opacity: 0.7,
                //     marginTop: 4,
                // },
                // itemIcons: {
                //     ...baseIcons,
                // },
                // itemIcon: {
                //     ...baseIcon,
                // },
                // itemAmount: {
                //     ...baseFlex("space-between"),
                //     flexWrap: "wrap",
                //     gap: 4,
                //     paddingTop: 8,
                //     borderTopWidth: StyleSheet.hairlineWidth,
                //     borderTopColor: theme.dividerColor,
                // },
                // itemPayment: {
                //     ...baseMini,
                //     color: slateColor,
                // },
                // itemRemaining: {
                //     ...baseWeight,
                //     ...baseMini,
                //     opacity: 0.6,
                // },
                // paymentSection: {
                //     ...baseFlex("center"),
                //     ...baseGap,
                //     flexWrap: "wrap",
                // },
                // paymentInput: {
                //     ...baseInput(theme),
                //     ...baseSelect,
                //     flex: 2,
                //     minWidth: 150,
                // },
                // paymentButton: {
                //     ...baseButton,
                //     minWidth: 100,
                // },
                // paymentButtonDisabled: {
                //     opacity: 0.5,
                // },
                // paymentButtonText: {
                //     ...baseButtonText,
                // },
                // emptyState: {
                //     ...baseEmpty,
                // },
                // emptyStateText: {
                //     ...baseEmptyText(theme),
                // },
            }),
        [theme, colorScheme]
    );

    let ticketsContent;

    if (loadingTickets) {
        ticketsContent = <ThemedText>Loading...</ThemedText>;
    } else if (tickets.length === 0) {
        ticketsContent = (
            <ThemedView style={styles.emptyState}>
                <ThemedText style={styles.emptyStateText}>No tickets found.</ThemedText>
            </ThemedView>
        );
    } else {
        ticketsContent = (
            <>
                <ThemedText type="subtitle" style={styles.header}>
                    Jouw tickets
                </ThemedText>
                {tickets.map((ticket) => (
                    <View key={ticket.id} style={{ marginBottom: 12, padding: 10, borderWidth: 1, borderRadius: 6 }}>
                        <ThemedText style={{ fontWeight: "bold" }}>{ticket.type}</ThemedText>
                        <ThemedText>{ticket.message}</ThemedText>
                        <ThemedText style={{ fontSize: 12, color: "#888" }}>
                            {new Date(ticket.created_at).toLocaleString()}
                        </ThemedText>
                    </View>
                ))}
            </>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <ThemedView style={styles.fieldset}>
                <ThemedText type="title" style={styles.heading}>
                    Bugs, feedback & ondersteuning
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
                    placeholder="Your message"
                    placeholderTextColor={theme.placeholder}
                    value={message}
                    onChangeText={setMessage}
                    multiline
                />
                <Button title={submitting ? "Sending..." : "Send"} onPress={handleSubmit} disabled={submitting} />
            </ThemedView>

            <ThemedView style={styles.list}>{ticketsContent}</ThemedView>
        </ScrollView>
    );
}
