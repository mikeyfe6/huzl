import { useAuth } from "./use-auth";

export interface Currency {
    symbol: string;
    code: string;
    name: string;
}

export const AVAILABLE_CURRENCIES: Currency[] = [
    { symbol: "€", code: "EUR", name: "Euro" },
    { symbol: "$", code: "USD", name: "US Dollar" },
    { symbol: "£", code: "GBP", name: "British Pound" },
    { symbol: "¥", code: "JPY", name: "Japanese Yen" },
    { symbol: "₹", code: "INR", name: "Indian Rupee" },
    { symbol: "R$", code: "BRL", name: "Brazilian Real" },
    { symbol: "C$", code: "CAD", name: "Canadian Dollar" },
    { symbol: "A$", code: "AUD", name: "Australian Dollar" },
    { symbol: "Fr", code: "CHF", name: "Swiss Franc" },
    { symbol: "kr", code: "SEK", name: "Swedish Krona" },
];

export function useCurrency() {
    const { user } = useAuth();

    const symbol = (user?.user_metadata?.currency_symbol as string) || "€";
    const code = (user?.user_metadata?.currency_code as string) || "EUR";

    return { symbol, code };
}
