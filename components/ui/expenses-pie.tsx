import { TouchableOpacity, useWindowDimensions } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

import {
    businessColor,
    careColor,
    Colors,
    entertainmentColor,
    familyColor,
    healthColor,
    housingColor,
    investColor,
    personalColor,
    petColor,
    taxesColor,
    travelColor,
} from "@/constants/theme";
import { baseOutline } from "@/styles/base";

const CATEGORY_COLORS: Record<Category, string> = {
    personal: personalColor,
    business: businessColor,
    family: familyColor,
    invest: investColor,
    entertainment: entertainmentColor,
    housing: housingColor,
    taxes: taxesColor,
    travel: travelColor,
    pet: petColor,
    care: careColor,
    health: healthColor,
};

const CATEGORIES: Category[] = [
    "personal",
    "business",
    "family",
    "invest",
    "entertainment",
    "housing",
    "taxes",
    "travel",
    "pet",
    "care",
    "health",
];

export function ExpensesPie({ expenses, selectedCategory, onCategorySelect, theme }: ExpensePieProps) {
    const { width: windowWidth } = useWindowDimensions();
    const isLight = theme.background === Colors.light.background;

    // Calculate totals
    const totalYearlySpend = expenses.filter((e) => e.active).reduce((sum, expense) => sum + expense.yearlyTotal, 0);

    // Calculate yearly spend per category
    const categorySpends = CATEGORIES.map((cat) =>
        expenses.filter((e) => e.active && e.category === cat).reduce((sum, e) => sum + e.yearlyTotal, 0),
    );

    // Calculate percentages
    const percents = categorySpends.map((spend) => (totalYearlySpend > 0 ? (spend / totalYearlySpend) * 100 : 0));

    // Pie chart calculations - responsive
    const responsiveSize = Math.min(windowWidth * 0.9, 450);
    const chartRadius = 145;
    const chartCenterX = 150;
    const chartCenterY = 150;

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
    let startAngle = 0;
    const angles = percents.map((percent) => {
        const endAngle = startAngle + (percent / 100) * 360;
        const angles = [startAngle, endAngle];
        startAngle = endAngle;
        return angles;
    });

    const strokePie = isLight ? 0.75 : 1;
    const strokeSelected = 0.95;
    const strokeOpacity = isLight ? 0.75 : 0.625;

    return (
        <TouchableOpacity
            activeOpacity={1}
            style={{
                ...baseOutline(theme),
                width: responsiveSize,
                height: responsiveSize,
                justifyContent: "center",
                alignItems: "center",
                borderRadius: responsiveSize / 2,
            }}
        >
            <Svg width={responsiveSize} height={responsiveSize} viewBox="0 0 300 300" style={{ opacity: strokePie }}>
                {CATEGORIES.map((cat, i) => (
                    <Path
                        key={cat}
                        d={getPieSlicePath(angles[i][0], angles[i][1], chartRadius, 0)}
                        fill={CATEGORY_COLORS[cat]}
                        opacity={selectedCategory === cat ? strokeSelected : strokeOpacity}
                        onPress={() => onCategorySelect(cat)}
                    />
                ))}
                <Circle
                    cx={chartCenterX}
                    cy={chartCenterY}
                    r={chartRadius}
                    fill="none"
                    stroke={CATEGORY_COLORS[selectedCategory]}
                    strokeWidth={1.5}
                />
            </Svg>
        </TouchableOpacity>
    );
}
