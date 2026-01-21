import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Modal, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import { useAuth } from "@/hooks/use-auth";

import { supabase } from "@/utils/supabase";

import { ThemedText } from "@/components/themed-text";

import { redColor, whiteColor } from "@/constants/theme";
import {
    baseButton,
    baseButtonText,
    baseFlex,
    baseGap,
    baseInput,
    baseModal,
    baseOverlay,
    baseRed,
    baseSelect,
    baseTrans,
    baseTransText,
} from "@/styles/base";

export function TerminateAccountModal({ visible, onClose, theme }: Readonly<TerminateAccountModalProps>) {
    const { t } = useTranslation();
    const { user, signOut } = useAuth();

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const isPendingDeletion = user?.user_metadata?.deleteRequested;

    const handleTerminateOrUndo = async () => {
        if (!email.trim()) {
            Alert.alert(t("terminate.errors.missingEmail"));
            return;
        }
        if (user?.email !== email.trim()) {
            Alert.alert(t("terminate.errors.emailMismatch"), t("terminate.errors.emailMismatchDesc"));
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    deleteRequested: !isPendingDeletion,
                    requestDate: new Date().toISOString(),
                },
            });
            if (error) {
                Alert.alert(t("terminate.errors.generic"), error.message);
            } else {
                setEmail("");
                onClose();
                if (!isPendingDeletion) {
                    await signOut();
                }
            }
        } catch (err) {
            console.error("Terminate Account error:", err);
            Alert.alert(t("terminate.errors.generic"));
        } finally {
            setLoading(false);
        }
    };

    const styles = useMemo(
        () =>
            StyleSheet.create({
                overlay: {
                    ...baseOverlay,
                },
                modal: {
                    ...baseModal(theme),
                },
                title: {
                    marginBottom: 16,
                },
                subtitle: {
                    marginBottom: 24,
                },
                input: {
                    ...baseInput(theme),
                    ...baseSelect,
                },
                buttons: {
                    ...baseFlex("center", "center"),
                    ...baseGap,
                    flexWrap: "wrap",
                    marginTop: 24,
                },
                button: {
                    ...baseButton(theme),
                },
                buttonText: {
                    ...baseButtonText,
                },
                transButton: {
                    ...baseTrans(theme, redColor),
                    backgroundColor: whiteColor,
                },
                transButtonText: {
                    ...baseTransText,
                    color: redColor,
                },
            }),
        [theme],
    );

    let buttonLabel;
    if (loading) {
        buttonLabel = isPendingDeletion ? t("terminate.undoing") : t("terminate.terminating");
    } else {
        buttonLabel = isPendingDeletion ? t("terminate.button.undoTermination") : t("terminate.button.terminate");
    }

    return (
        <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <ThemedText type="subtitle" style={styles.title}>
                        {t("terminate.title")}
                    </ThemedText>
                    <ThemedText style={styles.subtitle}>{t("terminate.subtitle")}</ThemedText>
                    <TextInput
                        style={styles.input}
                        value={email}
                        placeholder={user?.email || t("auth.placeholder.email")}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        placeholderTextColor={theme.placeholder}
                        onChangeText={setEmail}
                    />
                    <View style={styles.buttons}>
                        <TouchableOpacity style={[styles.button, { ...baseRed }]} onPress={onClose} disabled={loading}>
                            <ThemedText style={styles.buttonText}>{t("common.cancel")}</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.transButton} onPress={handleTerminateOrUndo} disabled={loading}>
                            <ThemedText style={styles.transButtonText} numberOfLines={1}>
                                {buttonLabel}
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
