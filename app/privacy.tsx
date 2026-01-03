import { router } from "expo-router";
import { useMemo } from "react";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";

import { useColorScheme } from "@/hooks/use-color-scheme";

import { ExternalLink } from "@/components/external-link";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

import { Colors, linkColor, whiteColor } from "@/constants/theme";
import { baseButton, baseButtonText, baseSpace, baseWeight } from "@/styles/base";

export default function PrivacyScreen() {
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
                    Privacybeleid
                </ThemedText>
                <ThemedText style={styles.updated}>Laatst bijgewerkt: 3 januari 2026</ThemedText>

                <ThemedText type="subtitle" style={styles.subtitle}>
                    1. Inleiding
                </ThemedText>
                <ThemedText style={styles.paragraph}>
                    Menefex, eigenaar van Huzl, hecht veel waarde aan de bescherming van je privacy en persoonlijke
                    gegevens. Dit privacybeleid legt uit welke gegevens we verzamelen, hoe we deze gebruiken en welke
                    rechten je hebt.
                </ThemedText>

                <ThemedText type="subtitle" style={styles.subtitle}>
                    2. Welke Gegevens Verzamelen We?
                </ThemedText>
                <ThemedText style={styles.paragraph}>
                    <ThemedText style={baseWeight}>Accountgegevens: </ThemedText>
                    E-mailadres, wachtwoord (versleuteld opgeslagen), en optionele profielinformatie zoals je naam.
                    {"\n\n"}
                    <ThemedText style={baseWeight}>Financiële gegevens: </ThemedText>
                    De inkomsten, uitgaven, budgetten en schulden die je invoert in de applicatie. Deze gegevens blijven
                    privé en worden alleen door jou ingezien.
                    {"\n\n"}
                    <ThemedText style={baseWeight}>Gebruiksgegevens: </ThemedText>
                    Informatie over hoe je de applicatie gebruikt, zoals inloggegevens en technische informatie
                    (apparaattype, besturingssysteem).
                </ThemedText>

                <ThemedText type="subtitle" style={styles.subtitle}>
                    3. Waarvoor Gebruiken We Je Gegevens?
                </ThemedText>
                <ThemedText style={styles.paragraph}>
                    • Het leveren en verbeteren van onze dienst{"\n"}• Het beheren van je account en authenticatie{"\n"}
                    • Het opslaan en presenteren van je financiële overzichten{"\n"}• Het versturen van belangrijke
                    updates over de applicatie{"\n"}• Het waarborgen van de veiligheid en betrouwbaarheid van de
                    applicatie
                </ThemedText>

                <ThemedText type="subtitle" style={styles.subtitle}>
                    4. Hoe Bewaren We Je Gegevens?
                </ThemedText>
                <ThemedText style={styles.paragraph}>
                    Je gegevens worden veilig opgeslagen via Supabase, een gerenommeerde cloud database provider met
                    servers in de Europese Unie. Alle verbindingen zijn versleuteld via HTTPS. Wachtwoorden worden nooit
                    in platte tekst opgeslagen maar altijd versleuteld (hashed).
                </ThemedText>

                <ThemedText type="subtitle" style={styles.subtitle}>
                    5. Delen We Je Gegevens?
                </ThemedText>
                <ThemedText style={styles.paragraph}>
                    Nee. We verkopen, verhuren of delen je persoonlijke gegevens niet met derden voor marketing- of
                    commerciële doeleinden. Je financiële gegevens zijn strikt privé en alleen voor jou toegankelijk.
                    {"\n\n"}
                    We maken gebruik van Supabase voor hosting en database management. Supabase heeft toegang tot de
                    infrastructuur maar niet tot de inhoud van je gegevens voor andere doeleinden dan het leveren van
                    hun dienst.
                </ThemedText>

                <ThemedText type="subtitle" style={styles.subtitle}>
                    6. Jouw Rechten (AVG/GDPR)
                </ThemedText>
                <ThemedText style={styles.paragraph}>
                    Op grond van de Algemene Verordening Gegevensbescherming (AVG) heb je de volgende rechten:
                    {"\n\n"}• <ThemedText style={baseWeight}>Recht op inzage:</ThemedText> Je kunt opvragen welke
                    gegevens we van je hebben{"\n"}• <ThemedText style={baseWeight}>Recht op rectificatie:</ThemedText>{" "}
                    Je kunt onjuiste gegevens laten corrigeren{"\n"}•{" "}
                    <ThemedText style={baseWeight}>Recht op verwijdering:</ThemedText> Je kunt je account en alle
                    bijbehorende gegevens laten verwijderen{"\n"}•{" "}
                    <ThemedText style={baseWeight}>Recht op dataportabiliteit:</ThemedText> Je kunt je gegevens in een
                    gestructureerd formaat opvragen{"\n"}•{" "}
                    <ThemedText style={baseWeight}>Recht van bezwaar:</ThemedText> Je kunt bezwaar maken tegen de
                    verwerking van je gegevens
                </ThemedText>

                <ThemedText type="subtitle" style={styles.subtitle}>
                    7. Cookies en Tracking
                </ThemedText>
                <ThemedText style={styles.paragraph}>
                    Huzl gebruikt alleen technisch noodzakelijke cookies voor authenticatie en het functioneren van de
                    applicatie. We gebruiken geen tracking cookies voor advertenties of marketing doeleinden.
                </ThemedText>

                <ThemedText type="subtitle" style={styles.subtitle}>
                    8. Bewaartermijn
                </ThemedText>
                <ThemedText style={styles.paragraph}>
                    We bewaren je gegevens zolang je een actief account hebt. Als je je account verwijdert, worden al je
                    gegevens permanent uit onze systemen verwijderd binnen 30 dagen.
                </ThemedText>

                <ThemedText type="subtitle" style={styles.subtitle}>
                    9. Beveiliging
                </ThemedText>
                <ThemedText style={styles.paragraph}>
                    We nemen redelijke technische en organisatorische maatregelen om je gegevens te beschermen tegen
                    verlies, misbruik en ongeautoriseerde toegang. Alle communicatie verloopt via versleutelde
                    verbindingen (HTTPS/SSL).
                </ThemedText>

                <ThemedText type="subtitle" style={styles.subtitle}>
                    10. Minderjarigen
                </ThemedText>
                <ThemedText style={styles.paragraph}>
                    Huzl is bedoeld voor personen van 16 jaar en ouder. We verzamelen niet bewust gegevens van personen
                    jonger dan 16 jaar.
                </ThemedText>

                <ThemedText type="subtitle" style={styles.subtitle}>
                    11. Wijzigingen in dit Beleid
                </ThemedText>
                <ThemedText style={styles.paragraph}>
                    We kunnen dit privacybeleid van tijd tot tijd bijwerken. Wijzigingen worden in de applicatie
                    gepubliceerd. We raden je aan dit beleid regelmatig te bekijken.
                </ThemedText>

                <ThemedText type="subtitle" style={styles.subtitle}>
                    12. Contact
                </ThemedText>
                <ThemedText style={styles.paragraph}>
                    Voor vragen over dit privacybeleid of het uitoefenen van je rechten kun je contact opnemen met:
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
