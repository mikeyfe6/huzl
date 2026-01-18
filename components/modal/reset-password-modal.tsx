import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import { supabase } from "@/utils/supabase";

import { useColorScheme } from "@/hooks/use-color-scheme";

import { ThemedText } from "@/components/themed-text";

import { Colors, greenColor, redColor } from "@/constants/theme";
import {
    baseButton,
    baseButtonText,
    baseError,
    baseFlex,
    baseGap,
    baseInput,
    baseModal,
    baseOverlay,
    baseSelect,
} from "@/styles/base";

interface ChangePasswordModalProps {
    visible: boolean;
    onClose: () => void;
}

export function ChangePasswordModal({ visible, onClose }: Readonly<ChangePasswordModalProps>) {
    const { t } = useTranslation();

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? "light"];

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChangePassword = async () => {
        setError(null);
        if (!newPassword || !confirmPassword) {
            setError(t("password.passwordRequired"));
            setTimeout(() => setError(null), 7000);
            return;
        }
        if (newPassword !== confirmPassword) {
            setError(t("password.passwordMismatch"));
            setTimeout(() => setError(null), 7000);
            return;
        }
        if (newPassword.length < 6) {
            setError(t("password.passwordTooShort"));
            setTimeout(() => setError(null), 7000);
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) {
                setError(error.message);
                setTimeout(() => setError(null), 7000);
            } else {
                setNewPassword("");
                setConfirmPassword("");
                onClose();
            }
        } catch (err) {
            console.error("ChangePasswordModal error:", err);
            setError(t("password.unexpectedError"));
            setTimeout(() => setError(null), 7000);
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
                input: {
                    ...baseInput(theme),
                    ...baseSelect,
                },
                buttons: {
                    ...baseFlex("center", "center"),
                    ...baseGap,
                    marginTop: 24,
                },
                button: {
                    ...baseButton,
                },
                buttonText: {
                    ...baseButtonText,
                },
                errorContainer: {
                    marginTop: 24,
                },
                errorText: {
                    ...baseError,
                },
            }),
        [theme],
    );

    return (
        <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <ThemedText type="subtitle" style={styles.title}>
                        {t("password.changePassword")}
                    </ThemedText>
                    <TextInput
                        style={styles.input}
                        placeholder={t("password.newPassword")}
                        secureTextEntry
                        value={newPassword}
                        placeholderTextColor={theme.placeholder}
                        onChangeText={setNewPassword}
                        autoCapitalize="none"
                        autoComplete="off"
                    />
                    <TextInput
                        style={[styles.input, { marginTop: 12 }]}
                        placeholder={t("password.confirmPassword")}
                        secureTextEntry
                        value={confirmPassword}
                        placeholderTextColor={theme.placeholder}
                        onChangeText={setConfirmPassword}
                        autoCapitalize="none"
                        autoComplete="off"
                    />
                    <View style={styles.buttons}>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: greenColor }]}
                            onPress={handleChangePassword}
                            disabled={loading}
                        >
                            <ThemedText style={styles.buttonText}>
                                {loading ? t("password.saving") : t("password.save")}
                            </ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: redColor }]}
                            onPress={onClose}
                            disabled={loading}
                        >
                            <ThemedText style={styles.buttonText}>{t("common.cancel")}</ThemedText>
                        </TouchableOpacity>
                    </View>
                    {error ?
                        <View style={styles.errorContainer} accessible accessibilityLiveRegion="polite">
                            <ThemedText style={styles.errorText}>{error}</ThemedText>
                        </View>
                    :   null}
                </View>
            </View>
        </Modal>
    );
}
