import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Svg, Path } from "react-native-svg";
import { BlurView } from "expo-blur";
import { useFonts } from "expo-font";

import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";

function SuccessBadge() {
  return (
    <View style={styles.badgeContainer}>
      <Svg width={88} height={88} viewBox="0 0 88 100">
        {/* Original 12-lobed green rosette */}
        <Path
          d="
            M44 4
            C48.5 4 52.4 9.1 56.6 10.6
            C60.8 12.1 66.2 10.3 69.8 13.5
            C73.4 16.7 73.2 22.4 75.9 26.2
            C78.6 30.0 84.0 32.5 85.3 36.8
            C86.6 41.1 83.7 45.7 83.7 50.0
            C83.7 54.3 86.6 58.9 85.3 63.2
            C84.0 67.5 78.6 70.0 75.9 73.8
            C73.2 77.6 73.4 83.3 69.8 86.5
            C66.2 89.7 60.8 87.9 56.6 89.4
            C52.4 90.9 48.5 96.0 44 96.0
            C39.5 96.0 35.6 90.9 31.4 89.4
            C27.2 87.9 21.8 89.7 18.2 86.5
            C14.6 83.3 14.8 77.6 12.1 73.8
            C9.4 70.0 4.0 67.5 2.7 63.2
            C1.4 58.9 4.3 54.3 4.3 50.0
            C4.3 45.7 1.4 41.1 2.7 36.8
            C4.0 32.5 9.4 30.0 12.1 26.2
            C14.8 22.4 14.6 16.7 18.2 13.5
            C21.8 10.3 27.2 12.1 31.4 10.6
            C35.6 9.1 39.5 4 44 4Z
          "
          transform="translate(0, 0) scale(0.88)"
          fill="#175349"
        />

        {/* Original thick white checkmark */}
        <Path
          d="M26 44.5L37.5 56L62 31.5"
          stroke="#FFFFFF"
          strokeWidth={7}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    </View>
  );
}

export default function SuccessScreen({
  reportToken,
  onBackToHome,
  blurTargetRef,
}) {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const slideY = useRef(new Animated.Value(1000)).current;
  const sheetOpacity = useRef(new Animated.Value(0.7)).current;
  const hasAnimated = useRef(false);

  useEffect(() => {
    return () => {
      slideY.stopAnimation();
      sheetOpacity.stopAnimation();
    };
  }, [slideY, sheetOpacity]);

  const animateSheet = (height) => {
    if (hasAnimated.current) return;

    hasAnimated.current = true;
    slideY.setValue(height * 1.05);

    Animated.parallel([
      Animated.timing(slideY, {
        toValue: 0,
        duration: 300,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: true,
      }),
      Animated.timing(sheetOpacity, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  };

  if (!fontsLoaded) {
    return <View style={styles.loadingContainer} />;
  }

  return (
    <View style={styles.overlay}>
      <StatusBar hidden />

      {/* Blurred Home Screen behind the success sheet */}
      <BlurView
        style={StyleSheet.absoluteFill}
        intensity={80}
        tint="light"
        blurReductionFactor={4}
        blurMethod="dimezisBlurViewSdk31Plus"
        blurTarget={blurTargetRef}
      />

      {/* Original 40% white frost overlay */}
      <View pointerEvents="none" style={styles.frostOverlay} />

      {/* Tap outside the sheet to return home */}
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onBackToHome}
        accessibilityLabel="Close success screen"
      />

      {/* Animated bottom sheet */}
      <Animated.View
        onLayout={(event) => animateSheet(event.nativeEvent.layout.height)}
        style={[
          styles.bottomSheet,
          {
            opacity: sheetOpacity,
            transform: [{ translateY: slideY }],
          },
        ]}
      >
        <SuccessBadge />

        {/* Confirmation headings */}
        <View style={styles.headingContainer}>
          <Text style={styles.mainHeading}>Report Submitted Successfully</Text>

          <Text style={styles.secondaryHeading}>Help Is On the Way</Text>
        </View>

        {/* Actual report reference token */}
        <View style={styles.tokenContainer}>
          <Text style={styles.tokenLabel}>Your Report Token</Text>

          <Text selectable style={styles.tokenValue}>
            {reportToken || "Pending confirmation"}
          </Text>
        </View>

        {/* Return to Home */}
        <Pressable
          onPress={onBackToHome}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.homeButton,
            pressed && styles.homeButtonPressed,
          ]}
        >
          <Text style={styles.homeButtonText}>Back To Home</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "transparent",
  },

  overlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "flex-end",
  },

  frostOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.4)",
  },

  // Original floating white sheet
  bottomSheet: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    alignItems: "center",

    shadowColor: "#0F3831",
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 12,

    borderWidth: 1,
    borderColor: "rgba(23,83,73,0.06)",
  },

  badgeContainer: {
    width: 88,
    height: 88,
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#175349",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 5,
  },

  headingContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },

  mainHeading: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 22,
    color: "#1A1A1A",
    lineHeight: 30,
    letterSpacing: -0.5,
    textAlign: "center",
  },

  secondaryHeading: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 22,
    color: "#175349",
    lineHeight: 30,
    letterSpacing: -0.5,
    textAlign: "center",
    marginTop: 4,
  },

  tokenContainer: {
    width: "100%",
    backgroundColor: "#F2F7F6",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E1ECE9",
    padding: 16,
    marginTop: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  tokenLabel: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 16,
  },

  tokenValue: {
    fontFamily: "Poppins_700Bold",
    fontSize: 24,
    color: "#175349",
    letterSpacing: 0.96,
    lineHeight: 32,
    marginTop: 4,
    textAlign: "center",
  },

  homeButton: {
    width: "100%",
    height: 56,
    backgroundColor: "#175349",
    borderRadius: 16,
    marginTop: 24,
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#175349",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },

  homeButtonPressed: {
    backgroundColor: "#13463E",
    transform: [{ scale: 0.985 }],
  },

  homeButtonText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: "#FFFFFF",
  },
});
