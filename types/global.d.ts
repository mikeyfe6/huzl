import { Colors } from "@/constants/theme";
import { getBudgetsStyles } from "@/styles/budgets";
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

    interface BudgetExpenseItem extends itemIdProp, itemNameProp, itemAmountProp, itemActiveProp {}

    interface DebtItem extends itemUserIdProp, itemIdProp, itemNameProp, itemAmountProp, itemActiveProp {
        pay_per_month?: number | null;
        created_at?: string;
    }

    interface TicketItem extends itemIdProp, itemTypeProp {
        message: string;
        created_at: string;
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

    type ExpenseListProps = {
        expense: ExpenseItem;
        currencySymbol: string;
        onToggleActive: (id: string, active: boolean) => void;
        onEdit: (expense: ExpenseItem) => void;
        onDelete: (id: string, name: string) => void;
        getFrequencyLabel: (freq: Frequency) => string;
        categoryLabelMap: Record<string, string>;
        periodLabel: string;
        styles: ReturnType<typeof getExpensesStyles>;
    };

    type BudgetListProps = {
        budget: BudgetItem;
        currencySymbol: string;
        onToggleActive: (id: string, active: boolean) => void;
        onEdit: (budget: BudgetItem) => void;
        onDelete: (id: string, name: string) => void;
        styles: ReturnType<typeof getBudgetsStyles>;
        selectedBudgetId: string | null;
        setSelectedBudgetId: (id: string | null) => void;
    };

    type BudgetExpenseListProps = {
        expense: BudgetExpenseItem;
        currencySymbol: string;
        onToggleExpenseActive: (id: string, active: boolean) => void;
        onEditExpense: (expense: BudgetExpenseItem) => void;
        onDelete: (id: string, name: string) => void;
        styles: ReturnType<typeof getBudgetsStyles>;
    };

    type DebtListProps = {
        debt: DebtItem;
        currencySymbol: string;
        onToggleActive: (id: string, active: boolean) => void;
        onEdit: (debt: DebtItem) => void;
        onDelete: (id: string, name: string) => void;
        styles: ReturnType<typeof getExpensesStyles>;
        loading: boolean;
        theme: ThemeProps;
        paymentAmount: string;
        setPaymentAmount: (amount: string) => void;
        onToggleActive: (id: string, active: boolean) => void;
        paymentId: string | null;
        setPaymentId: (id: string | null) => void;
        onPayment: (debtId: string, amount: number) => Promise<{ error: string | null }>;
        t: (key: string) => string;
    };

    type BudgetListItem =
        | { type: "budget"; budget: BudgetItem }
        | { type: "expenseHeader" }
        | { type: "expense"; expense: BudgetExpenseItem };

    type AuthContextValue = {
        user: User | null;
        loading: boolean;
        signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
        signUp: (
            email: string,
            password: string,
        ) => Promise<{ error: AuthError | null; success: boolean; user: User | null }>;
        signOut: () => Promise<void>;
        refreshUser: () => Promise<void>;
    };
}
