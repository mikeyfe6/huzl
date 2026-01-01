import { TouchableOpacity, useWindowDimensions } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

import { businessColor, familyColor, personalColor } from "@/constants/theme";

type Category = "personal" | "business" | "family";

interface ExpenseItem {
    id: string;
    name: string;
    amount: number;
    frequency: "daily" | "monthly" | "yearly";
    category: Category;
    yearlyTotal: number;
    active: boolean;
}

interface ExpensePieChartProps {
    readonly expenses: ReadonlyArray<ExpenseItem>;
    readonly selectedCategory: Category;
    readonly onCategorySelect: (category: Category) => void;
}

export function ExpensePieChart({ expenses, selectedCategory, onCategorySelect }: ExpensePieChartProps) {
    const { width: windowWidth } = useWindowDimensions();

    // Calculate totals
    const totalYearlySpend = expenses.filter((e) => e.active).reduce((sum, expense) => sum + expense.yearlyTotal, 0);

    const personalYearlySpend = expenses
        .filter((e) => e.active && e.category === "personal")
        .reduce((sum, e) => sum + e.yearlyTotal, 0);

    const businessYearlySpend = expenses
        .filter((e) => e.active && e.category === "business")
        .reduce((sum, e) => sum + e.yearlyTotal, 0);

    // Pie chart calculations - responsive
    const responsiveSize = Math.min(windowWidth * 0.9, 450);
    const chartRadius = 145;
    const chartCenterX = 150;
    const chartCenterY = 150;

    const personalPercent = totalYearlySpend > 0 ? (personalYearlySpend / totalYearlySpend) * 100 : 0;
    const businessPercent = totalYearlySpend > 0 ? (businessYearlySpend / totalYearlySpend) * 100 : 0;

    // Helper function to create SVG pie slice path with offset for selected slice
    const getPieSlicePath = (startAngle: number, endAngle: number, radius: number, offsetAmount: number = 0) => {
        const midAngle = (startAngle + endAngle) / 2;
        const midRad = (midAngle - 90) * (Math.PI / 180);

        const offsetX = offsetAmount * Math.cos(midRad);
        const offsetY = offsetAmount * Math.sin(midRad);

        const centerX = chartCenterX + offsetX;
        const centerY = chartCenterY + offsetY;

        const startRad = (startAngle - 90) * (Math.PI / 180);
        const endRad = (endAngle - 90) * (Math.PI / 180);

        const x1 = centerX + radius * Math.cos(startRad);
        const y1 = centerY + radius * Math.sin(startRad);
        const x2 = centerX + radius * Math.cos(endRad);
        const y2 = centerY + radius * Math.sin(endRad);

        const largeArc = endAngle - startAngle > 180 ? 1 : 0;

        return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    };

    // Calculate angles for each slice (starting from top)
    const personalStartAngle = 0;
    const personalEndAngle = (personalPercent / 100) * 360;
    const businessStartAngle = personalEndAngle;
    const businessEndAngle = businessStartAngle + (businessPercent / 100) * 360;
    const familyStartAngle = businessEndAngle;
    const familyEndAngle = 360;

    const getStrokeColor = (category: Category): string => {
        if (category === "personal") return personalColor;
        if (category === "business") return businessColor;
        return familyColor;
    };

    const strokeColor = getStrokeColor(selectedCategory);

    return (
        <TouchableOpacity
            activeOpacity={1}
            style={{ width: responsiveSize, height: responsiveSize, justifyContent: "center", alignItems: "center" }}
        >
            <Svg width={responsiveSize} height={responsiveSize} viewBox="0 0 300 300">
                <Path
                    d={getPieSlicePath(personalStartAngle, personalEndAngle, chartRadius, 0)}
                    fill={personalColor}
                    opacity={selectedCategory === "personal" ? 1 : 0.6}
                    onPress={() => onCategorySelect("personal")}
                />
                <Path
                    d={getPieSlicePath(businessStartAngle, businessEndAngle, chartRadius, 0)}
                    fill={businessColor}
                    opacity={selectedCategory === "business" ? 1 : 0.6}
                    onPress={() => onCategorySelect("business")}
                />
                <Path
                    d={getPieSlicePath(familyStartAngle, familyEndAngle, chartRadius, 0)}
                    fill={familyColor}
                    opacity={selectedCategory === "family" ? 1 : 0.6}
                    onPress={() => onCategorySelect("family")}
                />
                <Circle
                    cx={chartCenterX}
                    cy={chartCenterY}
                    r={chartRadius}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={0.75}
                />
            </Svg>
        </TouchableOpacity>
    );
}
