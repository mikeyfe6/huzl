import { Colors } from "@/constants/theme";
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
