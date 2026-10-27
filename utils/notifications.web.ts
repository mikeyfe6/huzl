import AsyncStorage from "@react-native-async-storage/async-storage";

// Web build: expo-notifications is intentionally not imported, it only logs "not supported" warnings on web.
const DEBT_NOTIFICATIONS_PREFERENCE_KEY = "@huzl_debt_notifications_enabled";
export const REMINDER_HOUR = 12;
export const REMINDER_MINUTE = 0;

export async function ensureNotificationPermissionAsync(): Promise<boolean> {
    return false;
}

export async function cancelDebtPaymentReminder(_debtId: string) {}

export async function cancelAllDebtPaymentReminders() {}

export async function getDebtNotificationsPreferenceAsync(): Promise<boolean> {
    const value = await AsyncStorage.getItem(DEBT_NOTIFICATIONS_PREFERENCE_KEY);
    return value !== "false";
}

export async function setDebtNotificationsPreferenceAsync(enabled: boolean) {
    await AsyncStorage.setItem(DEBT_NOTIFICATIONS_PREFERENCE_KEY, String(enabled));
}

export async function scheduleDebtPaymentReminder(_debt: {
    id: string;
    name: string;
    amount: number;
    next_payment_date?: string | null;
}) {}
