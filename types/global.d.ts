import { Colors } from "@/constants/theme";
import { getBudgetsStyles } from "@/styles/budgets";
import { getDebtsStyles } from "@/styles/debts";
import { getExpensesStyles } from "@/styles/expenses";
import type { AuthError, User } from "@supabase/supabase-js";

export {};

declare global {
    var RNFBDebug: boolean | undefined;

    // DRY types

    interface itemUserIdProp {
        readonly user_id: string;
    }
    interface itemIdProp {
        readonly id: string;
    }
    interface itemNameProp {
        readonly name: string;
    }
    interface itemActiveProp {
        readonly active: boolean;
    }
    interface itemAmountProp {
        readonly amount: number;
    }
    interface itemTypeProp {
        readonly type: string;
    }
    interface itemThemeProp {
        readonly theme: ThemeProps;
    }
    interface itemCodeProp {
        readonly code: string;
    }
    interface itemLoadingProp {
        readonly loading: boolean;
    }
    interface itemCreatedAtProp {
        readonly created_at: string;
    }
    interface itemTranslationProp {
        readonly t: (key: string) => string;
    }

    interface baseItemProps {
        readonly currencySymbol: string;
        readonly onToggleActive: (id: string, active: boolean) => void;
        readonly onDelete: (id: string, name: string) => void;
    }

    interface baseModalProps extends itemThemeProp {
        readonly visible: boolean;
        readonly onClose: () => void;
    }

    // modals

    interface TerminateAccountModalProps extends baseModalProps {}

    interface ForgotPasswordModalProps extends baseModalProps {}

    interface LanguagePickerModalProps extends baseModalProps {}

    interface ChangePasswordModalProps extends baseModalProps {}

    interface CurrencyPickerModalProps extends baseModalProps {
        readonly currentSymbol: string;
    }

    interface SortModalProps extends baseModalProps {
        readonly sortOption: SortOption;
        readonly onSelect: (opt: SortOption) => void;
    }

    // components

    interface ExpensePieProps extends itemThemeProp {
        readonly expenses: ReadonlyArray<ExpenseItem>;
        readonly selectedCategory: Category;
        readonly onCategorySelect: (category: Category) => void;
    }

    // simple types

    type ThemeProps = (typeof Colors)[keyof typeof Colors];

    type Category =
        | "personal"
        | "business"
        | "family"
        | "invest"
        | "entertainment"
        | "housing"
        | "taxes"
        | "travel"
        | "pet"
        | "care"
        | "health";

    type Frequency = "daily" | "weekly" | "monthly" | "quarterly" | "halfyearly" | "yearly";

    type SortOption = "default" | "alphabetic-asc" | "alphabetic-desc" | "cost-asc" | "cost-desc";

    // items

    interface ExpenseItem extends itemIdProp, itemNameProp, itemAmountProp, itemActiveProp {
        frequency: Frequency;
        category: Category;
        yearlyTotal: number;
    }

    interface BudgetItem extends itemIdProp, itemNameProp, itemActiveProp {
        total: number;
        spent: number;
        expenses: { id: string; name: string; amount: number; active: boolean }[];
    }

    interface BudgetExpenseItem extends itemIdProp, itemNameProp, itemAmountProp, itemActiveProp, itemCreatedAtProp {}

    interface DebtItem
        extends itemUserIdProp, itemIdProp, itemNameProp, itemAmountProp, itemActiveProp, itemCreatedAtProp {
        pay_per_month?: number | null;
        next_payment_date?: string | null;
    }

    interface TicketItem extends itemIdProp, itemTypeProp, itemCreatedAtProp {
        message: string;
    }

    interface IncomeSource extends itemAmountProp, itemTypeProp, itemActiveProp {
        id?: string;
    }

    interface LanguageItem extends itemNameProp, itemCodeProp {
        nativeName: string;
    }

    interface CurrencyItem extends itemNameProp, itemCodeProp {
        symbol: string;
    }

    interface ExpenseListProps extends baseItemProps, itemTranslationProp {
        expense: ExpenseItem;
        onEdit: (expense: ExpenseItem) => void;
        frequencyLabel: string;
        categoryLabelMap: Record<string, string>;
        styles: ReturnType<typeof getExpensesStyles>;
    }

    interface BudgetListProps extends baseItemProps {
        budget: BudgetItem;
        onEdit: (budget: BudgetItem) => void;
        styles: ReturnType<typeof getBudgetsStyles>;
        selectedBudgetId: string | null;
        setSelectedBudgetId: (id: string | null) => void;
    }

    interface BudgetExpenseListProps extends baseItemProps, itemTranslationProp {
        expense: BudgetExpenseItem;
        onEdit: (expense: BudgetExpenseItem) => void;
        styles: ReturnType<typeof getBudgetsStyles>;
    }

    interface DebtListProps extends itemThemeProp, itemLoadingProp, baseItemProps, itemTranslationProp {
        debt: DebtItem;
        onEdit: (debt: DebtItem) => void;
        styles: ReturnType<typeof getDebtsStyles>;
        paymentAmount: string;
        setPaymentAmount: (amount: string) => void;
        paymentId: string | null;
        setPaymentId: (id: string | null) => void;
        onPayment: (debtId: string, amount: number) => Promise<{ error: string | null }>;
    }

    type BudgetListItem =
        | { type: "budget"; budget: BudgetItem }
        | { type: "expenseHeader" }
        | { type: "expense"; expense: BudgetExpenseItem };

    interface AuthContextValue extends itemLoadingProp {
        user: User | null;
        signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
        signUp: (
            email: string,
            password: string,
        ) => Promise<{ error: AuthError | null; success: boolean; user: User | null }>;
        signOut: () => Promise<void>;
        refreshUser: () => Promise<void>;
    }
}
