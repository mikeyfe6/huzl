import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

import { linkColor, whiteColor } from "@/constants/theme";
import {
    baseBold,
    baseCorner,
    baseFlex,
    baseHorizontal,
    baseLarge,
    baseMini,
    baseOutline,
    baseSize,
    baseVertical,
    baseWeight,
} from "@/styles/base";

const AVAILABLE_LANGUAGES: LanguageItem[] = [
    { code: "nl", name: "Dutch", nativeName: "Nederlands" },
    { code: "en", name: "English", nativeName: "English" },
];

export function LanguagePickerModal({ visible, onClose, theme }: Readonly<LanguagePickerModalProps>) {
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

    const styles = useMemo(
        () =>
            StyleSheet.create({
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
                    paddingTop: 8,
                    paddingHorizontal: 20,
                },
                languageItem: {
                    ...baseFlex("space-between", "center"),
                    ...baseOutline(theme),
                    ...baseCorner,
                    ...baseHorizontal,
                    ...baseVertical,
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
                    ...baseBold,
                    color: whiteColor,
                },
                selectedText: {
                    color: whiteColor,
                },
            }),
        [theme],
    );

    return (
        <Modal visible={visible} animationType="fade" presentationStyle="pageSheet" onRequestClose={onClose}>
            <ThemedView style={styles.container}>
                <ThemedView style={styles.header}>
                    <ThemedText type="title">{t("language.title")}</ThemedText>
                    <Pressable onPress={onClose} disabled={saving} style={{ ...baseOutline(theme) }}>
                        <ThemedText type="danger">{t("common.close")}</ThemedText>
                    </Pressable>
                </ThemedView>

                <ScrollView style={styles.list}>
                    {AVAILABLE_LANGUAGES.map((language) => {
                        const isSelected = language.code === i18n.language;
                        return (
                            <Pressable
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
                            </Pressable>
                        );
                    })}
                </ScrollView>
            </ThemedView>
        </Modal>
    );
}
