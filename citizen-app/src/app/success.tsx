import { router, useLocalSearchParams } from "expo-router";

import SuccessScreen from "../screens/SuccessScreen";
import { useBlurTargetRef } from "../context/BlurTargetContext";

export default function SuccessRoute() {
  const { token } = useLocalSearchParams<{
    token?: string | string[];
  }>();

  const blurTargetRef = useBlurTargetRef();

  const reportToken = Array.isArray(token) ? token[0] : token;

  const handleBackToHome = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/home");
    }
  };

  return (
    <SuccessScreen
      reportToken={reportToken}
      onBackToHome={handleBackToHome}
      blurTargetRef={blurTargetRef}
    />
  );
}
