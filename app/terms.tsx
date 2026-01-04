import { router } from "expo-router";
import { useMemo } from "react";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";

import { useColorScheme } from "@/hooks/use-color-scheme";

import { ExternalLink } from "@/components/external-link";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

import { Colors, linkColor, whiteColor } from "@/constants/theme";
import { baseButton, baseButtonText, baseSpace } from "@/styles/base";

export default function TermsScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? "light"];

    const styles = useMemo(
        () =>
            StyleSheet.create({
                container: {
                    flex: 1,
                },
                content: {
                    padding: 20,
                    paddingBottom: 40,
                },
                title: {
                    marginBottom: 8,
                },
                subtitle: {
                    marginTop: 24,
                    marginBottom: 12,
                },
                paragraph: {
                    marginBottom: 12,
                    opacity: 0.9,
                },
                updated: {
                    ...baseSpace,
                    opacity: 0.6,
                    fontStyle: "italic",
                },
                backButton: {
                    ...baseButton,
                    backgroundColor: linkColor,
                    marginTop: 16,
                },
                backButtonText: {
                    ...baseButtonText,
                    color: whiteColor,
                },
            }),
        [theme]
    );

    return (
        <ThemedView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <ThemedText type="title" style={styles.title}>
                    Servicevoorwaarden
                </ThemedText>
                <ThemedText style={styles.updated}>Laatst bijgewerkt: 3 januari 2026</ThemedText>

                <ThemedText type="subtitle" style={styles.subtitle}>
                    1. Acceptatie van de Voorwaarden
                </ThemedText>
                <ThemedText style={styles.paragraph}>
                    Door gebruik te maken van Huzl, een product van Menefex, ga je akkoord met deze servicevoorwaarden.
                    Als je niet akkoord gaat met deze voorwaarden, mag je de applicatie niet gebruiken.
                </ThemedText>

                <ThemedText type="subtitle" style={styles.subtitle}>
                    2. Omschrijving van de Dienst
                </ThemedText>
                <ThemedText style={styles.paragraph}>
                    Huzl is een financiële beheerstool waarmee particulieren en ondernemers hun inkomsten, uitgaven,
                    budgetten en schulden kunnen bijhouden. De applicatie biedt inzicht in je financiële situatie door
                    middel van overzichten en grafieken.
                </ThemedText>

                <ThemedText type="subtitle" style={styles.subtitle}>
                    3. Gebruikersaccount
                </ThemedText>
                <ThemedText style={styles.paragraph}>
                    Je bent verantwoordelijk voor het beveiligen van je account en wachtwoord. Je bent volledig
                    verantwoordelijk voor alle activiteiten die onder jouw account plaatsvinden. Je verplicht je om ons
                    onmiddellijk op de hoogte te stellen van ongeautoriseerd gebruik van je account.
                </ThemedText>

                <ThemedText type="subtitle" style={styles.subtitle}>
                    4. Juistheid van Gegevens
                </ThemedText>
                <ThemedText style={styles.paragraph}>
                    Huzl is een tool om je financiën bij te houden. De informatie die je invoert en de berekeningen die
                    de applicatie maakt zijn gebaseerd op jouw invoer. Menefex is niet verantwoordelijk voor
                    onjuistheden in de door jou ingevoerde gegevens of beslissingen die je neemt op basis van de
                    informatie in de applicatie.
                </ThemedText>

                <ThemedText type="subtitle" style={styles.subtitle}>
                    5. Intellectueel Eigendom
                </ThemedText>
                <ThemedText style={styles.paragraph}>
                    Alle rechten op de applicatie, inclusief maar niet beperkt tot software, ontwerp, logo's en teksten,
                    berusten bij Menefex. Het is niet toegestaan om deze te kopiëren, wijzigen of verspreiden zonder
                    voorafgaande schriftelijke toestemming.
                </ThemedText>

                <ThemedText type="subtitle" style={styles.subtitle}>
                    6. Beperking van Aansprakelijkheid
                </ThemedText>
                <ThemedText style={styles.paragraph}>
                    Huzl wordt aangeboden "zoals het is" zonder enige garantie. Menefex is niet aansprakelijk voor enige
                    directe, indirecte, incidentele of gevolgschade die voortvloeit uit het gebruik of de onmogelijkheid
                    om de applicatie te gebruiken, inclusief maar niet beperkt tot financiële verliezen of verlies van
                    gegevens.
                </ThemedText>

                <ThemedText type="subtitle" style={styles.subtitle}>
                    7. Beëindiging
                </ThemedText>
                <ThemedText style={styles.paragraph}>
                    Wij behouden ons het recht voor om je toegang tot de applicatie op elk moment te beëindigen of op te
                    schorten, met of zonder reden, met of zonder kennisgeving. Bij beëindiging blijven alle bepalingen
                    die naar hun aard bedoeld zijn om voort te duren, van kracht.
                </ThemedText>

                <ThemedText type="subtitle" style={styles.subtitle}>
                    8. Wijzigingen
                </ThemedText>
                <ThemedText style={styles.paragraph}>
                    Wij behouden ons het recht voor om deze voorwaarden op elk moment te wijzigen. Wijzigingen worden
                    van kracht zodra ze in de applicatie worden gepubliceerd. Je gebruik van de applicatie na
                    wijzigingen betekent dat je de nieuwe voorwaarden accepteert.
                </ThemedText>

                <ThemedText type="subtitle" style={styles.subtitle}>
                    9. Toepasselijk Recht
                </ThemedText>
                <ThemedText style={styles.paragraph}>
                    Op deze voorwaarden is Nederlands recht van toepassing. Geschillen zullen worden voorgelegd aan de
                    bevoegde rechter in Nederland.
                </ThemedText>

                <ThemedText type="subtitle" style={styles.subtitle}>
                    10. Contact
                </ThemedText>
                <ThemedText style={styles.paragraph}>
                    Voor vragen over deze servicevoorwaarden kun je contact opnemen met Menefex via de website of per
                    e-mail via de contactgegevens op de website.
                </ThemedText>

                <ThemedText style={[styles.paragraph, styles.updated]}>
                    Menefex{"\n"}
                    KVK-nummer: 76045315{"\n"}
                    E-mail: info@menefex.nl{"\n"}
                    Website:{" "}
                    <ExternalLink href="https://menefex.nl">
                        <ThemedText type="link">menefex.nl</ThemedText>
                    </ExternalLink>
                </ThemedText>

                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <ThemedText style={styles.backButtonText}>Terug</ThemedText>
                </TouchableOpacity>
            </ScrollView>
        </ThemedView>
    );
}
