import { whiteColor } from "@/constants/theme";

export const baseGap = { gap: 12 };
export const baseSpace = { gap: 8 };
export const baseWeight = { fontWeight: "600" as const };
export const baseRadius = { borderRadius: 8 };
export const baseBorder = { borderWidth: 1 };
export const baseSize = { fontSize: 16 };

export const baseFlex = (
    justify: "flex-start" | "center" | "space-between" | undefined = undefined,
    align: "flex-start" | "center" | "flex-end" | undefined = undefined
) => ({
    flexDirection: "row" as const,
    justifyContent: justify,
    alignItems: align,
});

export const baseCenter = {
    justifyContent: "center" as const,
    alignItems: "center" as const,
};

export const baseInput = (theme: any) => ({
    ...baseRadius,
    ...baseBorder,
    ...baseSize,
    borderColor: theme.inputBorder,
    backgroundColor: theme.inputBackground,
    color: theme.inputText,
    outlineWidth: 0,
    minHeight: 44,
});

export const baseSelect = {
    paddingHorizontal: 12,
    paddingVertical: 10,
};

export const baseButton = {
    ...baseFlex("center", "center"),
    ...baseRadius,
    paddingVertical: 12,
    flex: 1,
};

export const baseButtonText = {
    ...baseWeight,
    color: whiteColor,
};

export const baseLabel = (theme: any) => ({
    ...baseWeight,
    color: theme.label,
    fontSize: 14,
    marginTop: 8,
});

export const baseList = {
    ...baseGap,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
};

export const baseCard = (theme: any) => ({
    ...baseInput(theme),
    ...baseGap,
    backgroundColor: theme.cardBackground,
    borderColor: theme.borderColor,
    padding: 12,
});

export const baseMain = {
    ...baseGap,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
};

export const baseEmpty = {
    ...baseFlex("center", "center"),
    paddingVertical: 60,
};

export const baseEmptyText = (theme: any) => ({
    color: theme.emptyStateText,
    textAlign: "center" as const,
    fontSize: 18,
    opacity: 0.6,
});
