import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

import { linkColor, whiteColor } from "@/constants/theme";
import { baseCorner, baseFlex, baseLarge, baseMini, baseSize, baseWeight } from "@/styles/base";

type Language = {
    code: string;
    name: string;
    nativeName: string;
};

const AVAILABLE_LANGUAGES: Language[] = [
    { code: "nl", name: "Dutch", nativeName: "Nederlands" },
    { code: "en", name: "English", nativeName: "English" },
];

interface LanguageModalProps {
    readonly visible: boolean;
    readonly onClose: () => void;
}

export function LanguageModal({ visible, onClose }: LanguageModalProps) {
    const { i18n, t } = useTranslation();
    const [saving, setSaving] = useState(false);

    const handleSelect = async (languageCode: string) => {
        setSaving(true);
        try {
            await i18n.changeLanguage(languageCode);
            onClose();
        } catch (e) {
            console.error("Language change error:", e);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <ThemedView style={styles.container}>
                <ThemedView style={styles.header}>
                    <ThemedText type="title">{t("language.selectLanguage")}</ThemedText>
                    <TouchableOpacity onPress={onClose} disabled={saving}>
                        <ThemedText type="danger">{t("language.close")}</ThemedText>
                    </TouchableOpacity>
                </ThemedView>

                <ScrollView style={styles.list}>
                    {AVAILABLE_LANGUAGES.map((language) => {
                        const isSelected = language.code === i18n.language;
                        return (
                            <TouchableOpacity
                                key={language.code}
                                style={[styles.languageItem, isSelected && styles.languageItemSelected]}
                                onPress={() => handleSelect(language.code)}
                                disabled={saving}
                            >
                                <View style={styles.languageInfo}>
                                    <ThemedText style={[styles.languageName, isSelected && styles.selectedText]}>
                                        {language.name}
                                    </ThemedText>
                                    <ThemedText style={[styles.languageNative, isSelected && styles.selectedText]}>
                                        {language.nativeName}
                                    </ThemedText>
                                </View>
                                {isSelected && <ThemedText style={styles.checkmark}>✓</ThemedText>}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </ThemedView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
    },
    header: {
        ...baseFlex("space-between", "center"),
        paddingHorizontal: 20,
        paddingBottom: 32,
    },
    list: {
        flex: 1,
        paddingHorizontal: 20,
    },
    languageItem: {
        ...baseFlex("space-between", "center"),
        ...baseCorner,
        paddingVertical: 16,
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    languageItemSelected: {
        backgroundColor: linkColor,
    },
    languageInfo: {
        flex: 1,
    },
    languageName: {
        ...baseWeight,
        ...baseSize,
    },
    languageNative: {
        ...baseMini,
        opacity: 0.7,
        marginTop: 4,
    },
    checkmark: {
        ...baseLarge,
        fontWeight: "bold",
        color: whiteColor,
    },
    selectedText: {
        color: whiteColor,
    },
});
