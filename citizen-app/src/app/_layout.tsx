import { Stack } from "expo-router";
import { BlurTargetProvider } from "../context/BlurTargetContext";

export default function RootLayout() {
  return (
    <BlurTargetProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="home" />

        <Stack.Screen
          name="success"
          options={{
            presentation: "transparentModal",
            animation: "none",
            contentStyle: {
              backgroundColor: "transparent",
            },
          }}
        />
      </Stack>
    </BlurTargetProvider>
  );
}
