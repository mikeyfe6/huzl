import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import i18n from "@/utils/i18n";

const DEBT_REMINDER_CHANNEL_ID = "debt-reminders";
const DEBT_REMINDER_ID_PREFIX = "debt-reminder-";
const DEBT_NOTIFICATIONS_PREFERENCE_KEY = "@huzl_debt_notifications_enabled";
export const REMINDER_HOUR = 12;
export const REMINDER_MINUTE = 0;

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export async function ensureNotificationPermissionAsync(): Promise<boolean> {
    if (Platform.OS === "web" || !Device.isDevice) return false;

    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync(DEBT_REMINDER_CHANNEL_ID, {
            name: "Debt reminders",
            importance: Notifications.AndroidImportance.DEFAULT,
        });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    if (existingStatus === "granted") return true;

    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
}

const debtReminderId = (debtId: string) => `${DEBT_REMINDER_ID_PREFIX}${debtId}`;

export async function cancelDebtPaymentReminder(debtId: string) {
    if (Platform.OS === "web") return;
    await Notifications.cancelScheduledNotificationAsync(debtReminderId(debtId));
}

export async function cancelAllDebtPaymentReminders() {
    if (Platform.OS === "web") return;
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
        scheduled
            .filter((notification) => notification.identifier.startsWith(DEBT_REMINDER_ID_PREFIX))
            .map((notification) => Notifications.cancelScheduledNotificationAsync(notification.identifier)),
    );
}

export async function getDebtNotificationsPreferenceAsync(): Promise<boolean> {
    const value = await AsyncStorage.getItem(DEBT_NOTIFICATIONS_PREFERENCE_KEY);
    return value !== "false";
}

export async function setDebtNotificationsPreferenceAsync(enabled: boolean) {
    await AsyncStorage.setItem(DEBT_NOTIFICATIONS_PREFERENCE_KEY, String(enabled));
    if (!enabled) await cancelAllDebtPaymentReminders();
}

export async function scheduleDebtPaymentReminder(debt: {
    id: string;
    name: string;
    next_payment_date?: string | null;
}) {
    if (Platform.OS === "web") return;
    await cancelDebtPaymentReminder(debt.id);

    if (!debt.next_payment_date) return;
    if (!(await getDebtNotificationsPreferenceAsync())) return;

    const paymentDate = new Date(debt.next_payment_date);
    if (Number.isNaN(paymentDate.getTime())) return;

    const reminderDate = new Date(paymentDate);
    reminderDate.setDate(reminderDate.getDate() - 1);
    reminderDate.setHours(REMINDER_HOUR, REMINDER_MINUTE, 0, 0);

    if (reminderDate.getTime() <= Date.now()) return;

    const granted = await ensureNotificationPermissionAsync();
    if (!granted) return;

    await Notifications.scheduleNotificationAsync({
        identifier: debtReminderId(debt.id),
        content: {
            title: i18n.t("debts.notifications.reminderTitle"),
            body: i18n.t("debts.notifications.reminderBody", { name: debt.name }),
            data: { debtId: debt.id },
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: reminderDate,
            ...(Platform.OS === "android" && { channelId: DEBT_REMINDER_CHANNEL_ID }),
        },
    });
}
