/**
 * Format a number as a currency amount with 2 decimal places and comma separator
 * @param amount - The numeric amount to format
 * @returns Formatted string with 2 decimals and comma (e.g., "123,45")
 */
export const formatAmount = (amount: number): string => {
    return amount.toFixed(2).replace(".", ",");
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
