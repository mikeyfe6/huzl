import React from "react";
import { StyleSheet, View } from "react-native";
import PieChart from "react-native-pie-chart";

import type { Slice } from "react-native-pie-chart";

export function YearlyExpensesPie({
    data,
    widthAndHeight = 400,
    cover = 0.6,
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
                style={{ overflow: "visible" as const }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        marginVertical: 24,
    },
});
