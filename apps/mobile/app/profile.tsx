import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useAuth } from "../src/lib/auth-context";
import { colors, spacing } from "../src/lib/theme";

export default function ProfileScreen() {
  const { profile, user, signOut } = useAuth();

  function handleSignOut() {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: signOut },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile?.full_name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "?"}
          </Text>
        </View>
        <Text style={styles.name}>{profile?.full_name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Organization</Text>
          <Text style={styles.value}>{profile?.organization?.name || "—"}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>Role</Text>
          <Text style={[styles.value, { textTransform: "capitalize" }]}>{profile?.role || "—"}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>Account Type</Text>
          <Text style={[styles.value, { textTransform: "capitalize" }]}>{profile?.organization?.type || "—"}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>ELEVaiT v0.1.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50], padding: spacing.lg },
  avatarContainer: { alignItems: "center", paddingVertical: 24 },
  avatar: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: colors.brand[600],
    justifyContent: "center", alignItems: "center",
  },
  avatarText: { color: "#fff", fontSize: 24, fontWeight: "700" },
  name: { fontSize: 20, fontWeight: "700", color: colors.gray[900], marginTop: 12 },
  email: { fontSize: 14, color: colors.gray[500], marginTop: 4 },
  card: {
    backgroundColor: "#fff", borderRadius: 12, padding: 16, marginTop: 16,
    borderWidth: 1, borderColor: colors.gray[200],
  },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10 },
  label: { fontSize: 14, color: colors.gray[500] },
  value: { fontSize: 14, fontWeight: "500", color: colors.gray[900] },
  divider: { height: 1, backgroundColor: colors.gray[100] },
  signOutBtn: {
    backgroundColor: "#fff", borderWidth: 1, borderColor: "#EF4444", borderRadius: 10,
    paddingVertical: 14, alignItems: "center", marginTop: 24,
  },
  signOutText: { color: "#EF4444", fontWeight: "600", fontSize: 15 },
  version: { textAlign: "center", color: colors.gray[400], fontSize: 12, marginTop: 24 },
});
