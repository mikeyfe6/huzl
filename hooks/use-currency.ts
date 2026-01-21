import { useTranslation } from "react-i18next";

import { useAuth } from "./use-auth";

const CURRENCY_CONFIGS = [
    { symbol: "€", code: "EUR", nameKey: "currency.eur" },
    { symbol: "$", code: "USD", nameKey: "currency.usd" },
    { symbol: "£", code: "GBP", nameKey: "currency.gbp" },
    { symbol: "¥", code: "JPY", nameKey: "currency.jpy" },
    { symbol: "₹", code: "INR", nameKey: "currency.inr" },
    { symbol: "R$", code: "BRL", nameKey: "currency.brl" },
    { symbol: "C$", code: "CAD", nameKey: "currency.cad" },
    { symbol: "A$", code: "AUD", nameKey: "currency.aud" },
    { symbol: "Fr", code: "CHF", nameKey: "currency.chf" },
    { symbol: "kr", code: "SEK", nameKey: "currency.sek" },
] as const;

export function useAvailableCurrencies(): CurrencyItem[] {
    const { t } = useTranslation();

    return CURRENCY_CONFIGS.map((config) => ({
        symbol: config.symbol,
        code: config.code,
        name: t(config.nameKey),
    }));
}

export function useCurrency() {
    const { user } = useAuth();

    const symbol = (user?.user_metadata?.currency_symbol as string) || "€";
    const code = (user?.user_metadata?.currency_code as string) || "EUR";

    return { symbol, code };
}
