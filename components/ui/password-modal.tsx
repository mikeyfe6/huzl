import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Modal, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import { supabase } from "@/utils/supabase";

import { useColorScheme } from "@/hooks/use-color-scheme";

import { ThemedText } from "@/components/themed-text";

import { Colors, greenColor, redColor } from "@/constants/theme";
import {
    baseButton,
    baseButtonText,
    baseCenter,
    baseCorner,
    baseFlex,
    baseGap,
    baseInput,
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

    const handleChangePassword = async () => {
        if (!newPassword || !confirmPassword) {
            Alert.alert(t("password.error"), t("password.passwordRequired"));
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert(t("password.error"), t("password.passwordMismatch"));
            return;
        }
        if (newPassword.length < 6) {
            Alert.alert(t("password.error"), t("password.passwordTooShort"));
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) {
                Alert.alert(t("password.error"), error.message);
            } else {
                Alert.alert(t("password.success"), t("password.passwordChanged"));
                setNewPassword("");
                setConfirmPassword("");
                onClose();
            }
        } catch (err) {
            console.error("ChangePasswordModal error:", err);
            Alert.alert(t("password.error"), t("password.unexpectedError"));
        } finally {
            setLoading(false);
        }
    };

    const styles = useMemo(
        () =>
            StyleSheet.create({
                overlay: {
                    ...baseCenter,
                    flex: 1,
                    backgroundColor: "rgba(0,0,0,0.4)",
                },
                modal: {
                    ...baseCorner,
                    backgroundColor: theme.background,
                    padding: 24,
                    width: "90%",
                    maxWidth: 400,
                    alignItems: "stretch",
                },
                title: {
                    marginBottom: 24,
                },
                input: {
                    ...baseInput(theme),
                    ...baseSelect,
                },
                buttons: {
                    ...baseFlex("center", "center"),
                    ...baseGap,
                    marginTop: 16,
                },
                button: {
                    ...baseButton,
                },
                buttonText: {
                    ...baseButtonText,
                },
            }),
        [theme],
    );

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
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
                            style={[styles.button, { backgroundColor: redColor }]}
                            onPress={onClose}
                            disabled={loading}
                        >
                            <ThemedText style={styles.buttonText}>{t("password.cancel")}</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: greenColor }]}
                            onPress={handleChangePassword}
                            disabled={loading}
                        >
                            <ThemedText style={styles.buttonText}>
                                {loading ? t("password.saving") : t("password.save")}
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
