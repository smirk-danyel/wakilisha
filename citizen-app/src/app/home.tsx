import { useState } from "react";
import { Alert, StyleSheet } from "react-native";
import { BlurTargetView } from "expo-blur";
import { useRouter } from "expo-router";

import HomeScreen from "../screens/HomeScreen";
import { useBlurTargetRef } from "../context/BlurTargetContext";
import { submitEmergencyReport } from "../services/reportService";

export default function Home() {
  const blurTargetRef = useBlurTargetRef();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReport = async (report: any) => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const result = await submitEmergencyReport(report);

      if (!result?.tracking_token) {
        throw new Error("The server did not return a tracking token.");
      }

      router.replace({
        pathname: "/success",
        params: { token: result.tracking_token },
      });
    } catch (error: any) {
      console.error("Report submission error:", error);

      Alert.alert(
        "Submission failed",
        error.message ||
          "Unable to submit your emergency report. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BlurTargetView ref={blurTargetRef} style={styles.container}>
      <HomeScreen onSubmitReport={handleSubmitReport} />
    </BlurTargetView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
});
