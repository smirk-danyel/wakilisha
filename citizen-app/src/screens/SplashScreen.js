import React, { useEffect, useRef } from "react";
import { Animated, Easing, Image, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Svg, Circle } from "react-native-svg";
import { useFonts } from "expo-font";

import { Poppins_400Regular } from "@expo-google-fonts/poppins";
import { SourceSans3_700Bold } from "@expo-google-fonts/source-sans-3";

const LOGO_URI =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBRrw3cmfPrBQbUWTWFqu7Pm3U56eAOwP53OTJu-j-Z4gC1kWnQkDcVRKmsC0-jJXuNjVDB40AxSHnDMiLv5FblgDAMGFg7C1OAWbK1txB3hlTOmiDystVTLBjfpZKHMcRxcm0lHr1Gh5XAm_bfRPDwrxat9mo6v5Lt6IL1tC05tHQ4QqfXucTdA2Zkl4NtrjnxOym1YSGENWq2SR7NFTmy2uuopmWj_Q2MAv67BX2G-s_-yPJ72kpJ";

const DOTS = [
  [32, 6, 5, 1],
  [41.95, 7.99, 4.6, 0.95],
  [50.38, 13.62, 4.2, 0.9],
  [56.01, 22.05, 3.9, 0.84],
  [58, 32, 3.6, 0.78],
  [56.01, 41.95, 3.3, 0.72],
  [50.38, 50.38, 3, 0.66],
  [41.95, 56.01, 2.8, 0.6],
  [32, 58, 2.6, 0.54],
  [22.05, 56.01, 2.4, 0.48],
  [13.62, 50.38, 2.2, 0.42],
  [7.99, 41.95, 2, 0.36],
  [6, 32, 1.9, 0.31],
  [7.99, 22.05, 1.8, 0.27],
  [13.62, 13.62, 1.6, 0.23],
  [22.05, 7.99, 1.5, 0.2],
];

function LoadingSpinner({ rotation }) {
  return (
    <Animated.View style={{ transform: [{ rotate: rotation }] }}>
      <Svg width={64} height={64} viewBox="0 0 64 64">
        {DOTS.map(([cx, cy, radius, opacity], index) => (
          <Circle
            key={index}
            cx={cx}
            cy={cy}
            r={radius}
            fill="#175349"
            fillOpacity={opacity}
          />
        ))}
      </Svg>
    </Animated.View>
  );
}

export default function SplashScreen() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    SourceSans3_700Bold,
  });

  const reveal = useRef(new Animated.Value(0)).current;
  const shift = useRef(new Animated.Value(0)).current;
  const loaderReveal = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!fontsLoaded) return;

    const brandingAnimation = Animated.parallel([
      Animated.timing(reveal, {
        toValue: 1,
        duration: 1200,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(1200),
        Animated.timing(shift, {
          toValue: 1,
          duration: 400,
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(1200),
        Animated.timing(loaderReveal, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]);

    brandingAnimation.start();

    const spinnerAnimation = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 600,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    spinnerAnimation.start();

    return () => {
      brandingAnimation.stop();
      spinnerAnimation.stop();
    };
  }, [fontsLoaded, reveal, shift, loaderReveal, spin]);

  if (!fontsLoaded) {
    return <View style={styles.container} />;
  }

  const brandingScale = reveal.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });

  const brandingTranslateY = shift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -40],
  });

  const loaderTranslateY = loaderReveal.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 0],
  });

  const spinnerRotation = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <Animated.View
        style={[
          styles.brandingGroup,
          {
            opacity: reveal,
            transform: [
              { translateY: brandingTranslateY },
              { scale: brandingScale },
            ],
          },
        ]}
      >
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: LOGO_URI }}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Wakilisha Logo"
          />
        </View>

        <Text style={styles.wordmark}>WAKILISHA</Text>

        <Animated.View
          style={[
            styles.loaderGroup,
            {
              opacity: loaderReveal,
              transform: [{ translateY: loaderTranslateY }],
            },
          ]}
        >
          <View style={styles.spinnerContainer}>
            <LoadingSpinner rotation={spinnerRotation} />
          </View>

          <Text style={styles.loadingLabel}>loading..</Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  brandingGroup: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    width: 170,
    height: 170,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  wordmark: {
    fontFamily: "SourceSans3_700Bold",
    fontSize: 36,
    letterSpacing: -0.72,
    lineHeight: 39.6,
    color: "#181818",
    marginTop: 14,
  },
  loaderGroup: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 56,
  },
  spinnerContainer: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingLabel: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#9E9E9E",
    marginTop: 16,
    letterSpacing: 0.28,
  },
});
