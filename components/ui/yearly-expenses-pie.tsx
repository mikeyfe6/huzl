import React from "react";
import { Platform, StyleSheet, View, useWindowDimensions } from "react-native";
import PieChart from "react-native-pie-chart";

import type { Slice } from "react-native-pie-chart";

const DEFAULT_COVER = Platform.select({
    // TODO later nader checken
    ios: 0.5,
    android: 0.5,
    default: 0.5,
});

export function YearlyExpensesPie({
    data,
    cover = DEFAULT_COVER,
}: Readonly<{
    data: Array<Slice>;
    widthAndHeight?: number;
    cover?: number;
}>) {
    const { width: windowWidth } = useWindowDimensions();
    const responsiveSize = Math.min(windowWidth * 0.9, 450);

    return (
        <View style={styles.container}>
            <PieChart
                widthAndHeight={responsiveSize}
                series={data}
                cover={cover}
                style={{ overflow: "visible" }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
    },
});
