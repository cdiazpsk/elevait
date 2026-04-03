import React from "react";
import { Tabs, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider, useAuth } from "../src/lib/auth-context";
import { colors } from "../src/lib/theme";

function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const onAuthScreen = segments[0] === "auth";
    if (!session && !onAuthScreen) {
      router.replace("/auth/login");
    } else if (session && onAuthScreen) {
      router.replace("/");
    }
  }, [session, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.brand[700] }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return <>{children}</>;
}

function AppTabs() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.brand[500],
        tabBarInactiveTintColor: colors.gray[400],
        tabBarStyle: { borderTopColor: colors.gray[200] },
        headerStyle: { backgroundColor: colors.brand[700] },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "700" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: () => null, headerTitle: "ELEVaiT" }} />
      <Tabs.Screen name="buildings" options={{ title: "Buildings", tabBarIcon: () => null }} />
      <Tabs.Screen name="events" options={{ title: "Events", tabBarIcon: () => null }} />
      <Tabs.Screen name="alerts" options={{ title: "Alerts", tabBarIcon: () => null }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: () => null }} />
      <Tabs.Screen name="auth/login" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="buildings/[id]" options={{ href: null, headerTitle: "Building" }} />
      <Tabs.Screen name="elevators/[id]" options={{ href: null, headerTitle: "Elevator" }} />
      <Tabs.Screen name="events/[id]" options={{ href: null, headerTitle: "Event Details" }} />
      <Tabs.Screen name="events/report" options={{ href: null, headerTitle: "Report Service Call" }} />
    </Tabs>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGate>
        <AppTabs />
      </AuthGate>
    </AuthProvider>
  );
}
