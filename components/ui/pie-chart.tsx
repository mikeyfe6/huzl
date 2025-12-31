import React from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import PieChart from "react-native-pie-chart";

import type { Slice } from "react-native-pie-chart";

export function PieDiagram({
    data,
    cover = 0.5,
}: Readonly<{
    data: Array<Slice>;
    widthAndHeight?: number;
    cover?: number;
}>) {
    const { width: windowWidth } = useWindowDimensions();
    const responsiveSize = Math.min(windowWidth * 0.9, 450);

    return (
        <View style={styles.container}>
            <PieChart widthAndHeight={responsiveSize} series={data} cover={cover} style={{ overflow: "visible" }} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
    },
});
