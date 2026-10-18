/**
 * Format a number as a currency amount with 2 decimal places and comma separator
 * @param amount - The numeric amount to format
 * @returns Formatted string with 2 decimals and comma (e.g., "123,45")
 */
export const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat("nl-NL", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

/**
 * Format a number as a full currency display with symbol
 * @param amount - The numeric amount to format
 * @param symbol - The currency symbol (e.g., "€", "$")
 * @returns Formatted string with symbol and amount (e.g., "€ 123,45")
 */
export const formatCurrency = (amount: number, symbol: string): string => {
    return `${symbol} ${formatAmount(amount)}`;
};

/**
 * Capitalize the first letter of a string
 * @param string - The input string
 * @returns The string with the first letter capitalized
 */
export const formatCapitalize = (string: string): string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

/**
 * Replace all commas in a string with periods
 * @param value - The input string
 * @returns The string with commas replaced by periods
 */
export const formatNumber = (value: string): string => {
    return value.replaceAll(",", ".");
};

export const INCOME_FREQUENCIES = ["weekly", "biweekly", "fourweekly", "monthly", "quarterly", "yearly"] as const;

const INCOME_PAYMENTS_PER_YEAR: Record<string, number> = {
    weekly: 52,
    biweekly: 26,
    fourweekly: 13,
    monthly: 12,
    quarterly: 4,
    yearly: 1,
};

/**
 * Convert an income amount to its average monthly equivalent
 */
export const formatToMonthlyIncome = (amount: number, frequency?: string | null): number => {
    const perYear = INCOME_PAYMENTS_PER_YEAR[frequency ?? "monthly"] ?? 12;
    return (amount * perYear) / 12;
};

export const formatIncomeAverage = (
    fallbackAmount: number,
    frequency: string | null | undefined,
    payments: ReadonlyArray<{ amount: number; received_at: string }>,
    now = new Date(),
    variable = false,
    trackingStartedAt?: string | null,
): { amount: number; monthsCovered: number; paymentCount: number } => {
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startDate = new Date(endDate);
    startDate.setFullYear(startDate.getFullYear() - 1);
    if (variable) {
        const rollingPeriodStart = new Date(endDate.getFullYear(), endDate.getMonth() - 11, 1);
        const trackingDate = trackingStartedAt ? new Date(`${trackingStartedAt}T12:00:00`) : rollingPeriodStart;
        const periodStart =
            trackingDate > rollingPeriodStart ?
                new Date(trackingDate.getFullYear(), trackingDate.getMonth(), 1)
            :   rollingPeriodStart;
        const periodStartString = `${periodStart.getFullYear()}-${String(periodStart.getMonth() + 1).padStart(2, "0")}-01`;
        const endDateString = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;
        const recentPayments = payments.filter(
            (payment) => payment.received_at >= periodStartString && payment.received_at <= endDateString,
        );
        const monthsCovered =
            (endDate.getFullYear() - periodStart.getFullYear()) * 12 + endDate.getMonth() - periodStart.getMonth() + 1;
        const totalReceived = recentPayments.reduce((sum, payment) => sum + payment.amount, 0);

        return {
            amount: recentPayments.length > 0 ? totalReceived / monthsCovered : 0,
            monthsCovered,
            paymentCount: recentPayments.length,
        };
    }

    const endDateString = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;
    const startDateString = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, "0")}-${String(startDate.getDate()).padStart(2, "0")}`;
    const recentPayments = payments.filter(
        (payment) => payment.received_at >= startDateString && payment.received_at <= endDateString,
    );

    if (recentPayments.length === 0) {
        return {
            amount: formatToMonthlyIncome(fallbackAmount, frequency),
            monthsCovered: 0,
            paymentCount: 0,
        };
    }

    const paymentsPerYear = INCOME_PAYMENTS_PER_YEAR[frequency ?? "monthly"] ?? 12;
    const monthsCovered = Math.min(12, recentPayments.length * (12 / paymentsPerYear));
    const totalReceived = recentPayments.reduce((sum, payment) => sum + payment.amount, 0);

    return {
        amount: totalReceived / monthsCovered,
        monthsCovered,
        paymentCount: recentPayments.length,
    };
};

export const formatTotalMonthlyIncome = (
    sources: ReadonlyArray<{
        id?: string;
        amount: number;
        frequency?: string | null;
        active?: boolean;
        variable?: boolean;
        tracking_started_at?: string | null;
    }>,
    payments: ReadonlyArray<{ income_id: string; amount: number; received_at: string }>,
): number =>
    sources.reduce((sum, source) => {
        if (source.active === false) return sum;

        if (source.variable) {
            const sourcePayments = source.id ? payments.filter((payment) => payment.income_id === source.id) : [];
            return (
                sum +
                formatIncomeAverage(0, source.frequency, sourcePayments, new Date(), true, source.tracking_started_at)
                    .amount
            );
        }
        if (!Number.isFinite(source.amount)) return sum;

        return sum + formatToMonthlyIncome(source.amount, source.frequency);
    }, 0);

/**
 * Format a date/time string prefixed with the locale's day name abbreviation (e.g., "wo 29 jun 2026, 15:57:48" for nl, "Wed 29 Jun 2026, 15:57:48" for en)
 * @param dateString - The date string to format
 * @param locale - The locale to use (e.g., "nl", "en")
 * @returns Formatted string with day abbreviation prefix
 */
export const formatDate = (dateString: string, locale: string): string => {
    const date = new Date(dateString);
    const isEnglish = locale.startsWith("en");
    const dayLength = isEnglish ? 3 : 2;
    const rawDay = date.toLocaleDateString(locale, { weekday: "short" }).slice(0, dayLength);
    const day = isEnglish ? formatCapitalize(rawDay.toLowerCase()) : rawDay.toLowerCase();
    const month = date.toLocaleDateString(locale, { month: "short" }).replace(".", "").slice(0, 3);
    const datePart = `${date.getDate()} ${isEnglish ? formatCapitalize(month) : month} ${date.getFullYear()}`;
    const timePart = date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    return `${day} ${datePart}, ${timePart}`;
};
