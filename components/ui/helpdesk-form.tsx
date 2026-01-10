import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/utils/supabase";
import React, { useState } from "react";
import { Alert, Button, TextInput, View } from "react-native";

export default function HelpdeskForm() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [type, setType] = useState("feedback");
    const [submitting, setSubmitting] = useState(false);
    const { user } = useAuth();

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
                    email,
                    message,
                    type,
                    created_at: new Date().toISOString(),
                },
            ]);
            if (error) {
                Alert.alert("Error", error.message);
            } else {
                setEmail("");
                setMessage("");
                setType("feedback");
                Alert.alert("Thank you for your feedback!");
            }
        } catch (e) {
            Alert.alert("Error", "Could not send feedback.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ThemedView style={{ padding: 20 }}>
            <ThemedText style={{ fontSize: 20, marginBottom: 10 }}>Bugs, feedback & ondersteuning</ThemedText>
            <View style={{ marginBottom: 10 }}>
                <ThemedText style={{ marginBottom: 4 }}>Type</ThemedText>
                <View style={{ borderWidth: 1, borderRadius: 6 }}>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        style={{ padding: 10, borderRadius: 6, width: "100%" }}
                    >
                        <option value="bug">Bug</option>
                        <option value="feedback">Feedback</option>
                        <option value="support">Support</option>
                    </select>
                </View>
            </View>
            <TextInput
                placeholder="Your email (optional)"
                value={email}
                onChangeText={setEmail}
                style={{ marginBottom: 10, padding: 10, borderRadius: 6, borderWidth: 1 }}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                placeholder="Your message"
                value={message}
                onChangeText={setMessage}
                style={{
                    marginBottom: 10,
                    padding: 10,
                    borderRadius: 6,
                    borderWidth: 1,
                    height: 100,
                    textAlignVertical: "top",
                }}
                multiline
            />
            <Button title={submitting ? "Sending..." : "Send"} onPress={handleSubmit} disabled={submitting} />
        </ThemedView>
    );
}
