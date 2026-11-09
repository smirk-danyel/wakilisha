import { BlurTargetView } from "expo-blur";
import { StyleSheet } from "react-native";

import HomeScreen from "../screens/HomeScreen";
import { useBlurTargetRef } from "../context/BlurTargetContext";

export default function Home() {
  const blurTargetRef = useBlurTargetRef();

  return (
    <BlurTargetView ref={blurTargetRef} style={styles.container}>
      <HomeScreen />
    </BlurTargetView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
});
