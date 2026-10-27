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
    handleNotification: () =>
        Promise.resolve({
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

type ReminderDebt = {
    id: string;
    name: string;
    amount: number;
    next_payment_date?: string | null;
};

const debtRegistry = new Map<string, ReminderDebt>();
let registryLoaded = false;
let runningSync: Promise<void> = Promise.resolve();
let queuedSync: Promise<void> | null = null;

const reminderDateFor = (paymentDate: string) => {
    const date = new Date(paymentDate);
    if (Number.isNaN(date.getTime())) return null;

    date.setDate(date.getDate() - 1);
    date.setHours(REMINDER_HOUR, REMINDER_MINUTE, 0, 0);
    return date;
};

async function cancelAllScheduledDebtReminders() {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
        scheduled
            .filter((notification) => notification.identifier.startsWith(DEBT_REMINDER_ID_PREFIX))
            .map((notification) => Notifications.cancelScheduledNotificationAsync(notification.identifier)),
    );
}

// One reminder per due date: the first debt by name, plus "(+N)" for the others due on the same date.
async function syncDebtReminders() {
    await cancelAllScheduledDebtReminders();
    if (!(await getDebtNotificationsPreferenceAsync())) return;

    const groups = new Map<string, ReminderDebt[]>();
    for (const debt of debtRegistry.values()) {
        if (debt.amount <= 0 || !debt.next_payment_date) continue;

        const reminderDate = reminderDateFor(debt.next_payment_date);
        if (!reminderDate || reminderDate.getTime() <= Date.now()) continue;

        groups.set(debt.next_payment_date, [...(groups.get(debt.next_payment_date) ?? []), debt]);
    }

    if (groups.size === 0 || !(await ensureNotificationPermissionAsync())) return;

    await Promise.all(
        [...groups].map(async ([paymentDate, debts]) => {
            const reminderDate = reminderDateFor(paymentDate);
            if (!reminderDate) return;

            const sorted = [...debts].sort((a, b) => a.name.localeCompare(b.name));
            const extra = sorted.length - 1;
            const name = extra > 0 ? `${sorted[0].name} [+${extra}]` : sorted[0].name;

            await Notifications.scheduleNotificationAsync({
                identifier: `${DEBT_REMINDER_ID_PREFIX}${paymentDate}`,
                content: {
                    title: i18n.t("debts.notifications.reminderTitle"),
                    body: i18n.t("debts.notifications.reminderBody", { name }),
                    data: { debtIds: sorted.map((debt) => debt.id) },
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: reminderDate,
                    ...(Platform.OS === "android" && { channelId: DEBT_REMINDER_CHANNEL_ID }),
                },
            });
        }),
    );
}

// Calls made together (e.g. one per debt on load) share a single sync run, and runs never overlap.
function requestSync(): Promise<void> {
    if (queuedSync) return queuedSync;

    queuedSync = runningSync.then(async () => {
        queuedSync = null;
        runningSync = (async () => {
            try {
                await syncDebtReminders();
            } catch (error) {
                console.warn("Debt reminder sync failed", error);
            }
        })();
        await runningSync;
    });
    return queuedSync;
}

export async function cancelDebtPaymentReminder(debtId: string) {
    if (Platform.OS === "web") return;
    debtRegistry.delete(debtId);
    registryLoaded = true;
    await requestSync();
}

export async function cancelAllDebtPaymentReminders() {
    if (Platform.OS === "web") return;
    await cancelAllScheduledDebtReminders();
}

export async function getDebtNotificationsPreferenceAsync(): Promise<boolean> {
    const value = await AsyncStorage.getItem(DEBT_NOTIFICATIONS_PREFERENCE_KEY);
    return value !== "false";
}

export async function setDebtNotificationsPreferenceAsync(enabled: boolean) {
    await AsyncStorage.setItem(DEBT_NOTIFICATIONS_PREFERENCE_KEY, String(enabled));
    if (!enabled) await cancelAllDebtPaymentReminders();
    else if (registryLoaded) await requestSync();
}

export async function scheduleDebtPaymentReminder(debt: ReminderDebt) {
    if (Platform.OS === "web") return;
    debtRegistry.set(debt.id, debt);
    registryLoaded = true;
    await requestSync();
}
