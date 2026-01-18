import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Modal, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import { useColorScheme } from "@/hooks/use-color-scheme";

import { supabase } from "@/utils/supabase";

import { ThemedText } from "@/components/themed-text";

import { Colors, greenColor, redColor } from "@/constants/theme";
import {
    baseButton,
    baseButtonText,
    baseFlex,
    baseGap,
    baseInput,
    baseModal,
    baseOverlay,
    baseSelect,
} from "@/styles/base";

interface ForgotPasswordModalProps {
    visible: boolean;
    onClose: () => void;
}

export function ForgotPasswordModal({ visible, onClose }: Readonly<ForgotPasswordModalProps>) {
    const { t } = useTranslation();

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? "light"];

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleForgotPassword = async () => {
        if (!email.trim()) {
            Alert.alert(t("auth.errors.missingCredentials"));
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
            if (error) {
                Alert.alert(t("auth.errors.generic"), error.message);
            } else {
                Alert.alert(t("auth.success"), t("auth.resetEmailSent"));
                setEmail("");
                onClose();
            }
        } catch (err) {
            console.error("ForgotPasswordModal error:", err);
            Alert.alert(t("auth.errors.generic"));
        } finally {
            setLoading(false);
        }
    };

    const styles = StyleSheet.create({
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
    });

    return (
        <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <ThemedText type="subtitle" style={styles.title}>
                        {t("forgot.title")}
                    </ThemedText>
                    <ThemedText style={styles.subtitle}>{t("forgot.text")}</ThemedText>
                    <TextInput
                        style={styles.input}
                        placeholder={t("auth.emailPlaceholder")}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        value={email}
                        placeholderTextColor={theme.placeholder}
                        onChangeText={setEmail}
                    />
                    <View style={styles.buttons}>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: redColor }]}
                            onPress={onClose}
                            disabled={loading}
                        >
                            <ThemedText style={styles.buttonText}>{t("common.cancel")}</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: greenColor }]}
                            onPress={handleForgotPassword}
                            disabled={loading}
                        >
                            <ThemedText style={styles.buttonText}>
                                {loading ? t("common.sending") : t("common.send")}
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
