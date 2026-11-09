import { useEffect } from "react";
import { useRouter } from "expo-router";
import SplashScreen from "../screens/SplashScreen";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/home");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return <SplashScreen />;
}
