import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import PieChart from "react-native-pie-chart";

import type { Slice } from "react-native-pie-chart";

const DEFAULT_SIZE = Platform.select({
    ios: 350,
    android: 350,
    default: 450,
});

const DEFAULT_COVER = Platform.select({
    ios: 0.4,
    android: 0.4,
    default: 0.5,
});

export function YearlyExpensesPie({
    data,
    widthAndHeight = DEFAULT_SIZE,
    cover = DEFAULT_COVER,
}: Readonly<{
    data: Array<Slice>;
    widthAndHeight?: number;
    cover?: number;
}>) {
    return (
        <View style={styles.container}>
            <PieChart
                widthAndHeight={widthAndHeight}
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
