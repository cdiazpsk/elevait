import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert as RNAlert } from "react-native";
import { supabase } from "../src/lib/supabase";
import { useAuth } from "../src/lib/auth-context";
import StatusBadge from "../src/components/StatusBadge";
import { colors, spacing } from "../src/lib/theme";

interface AlertRow {
  id: string;
  alert_type: string;
  severity: string;
  status: string;
  title: string;
  message: string;
  created_at: string;
  elevator: { car_number: string; building: { name: string } | null } | null;
}

const TABS = ["active", "acknowledged", "resolved"] as const;

export default function AlertsScreen() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [tab, setTab] = useState<typeof TABS[number]>("active");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadAlerts() {
    const { data } = await supabase
      .from("alerts")
      .select("id, alert_type, severity, status, title, message, created_at, elevator:elevators(car_number, building:buildings(name))")
      .eq("status", tab)
      .order("created_at", { ascending: false });
    if (data) setAlerts(data as unknown as AlertRow[]);
    setLoading(false);
  }

  useEffect(() => { setLoading(true); loadAlerts(); }, [tab]);

  async function onRefresh() { setRefreshing(true); await loadAlerts(); setRefreshing(false); }

  async function acknowledge(alertId: string) {
    await supabase.from("alerts").update({ status: "acknowledged", acknowledged_by: user?.id }).eq("id", alertId);
    loadAlerts();
  }

  async function resolve(alertId: string) {
    await supabase.from("alerts").update({ status: "resolved", resolved_at: new Date().toISOString() }).eq("id", alertId);
    loadAlerts();
  }

  function handleAction(alertId: string, action: "acknowledge" | "resolve") {
    const label = action === "acknowledge" ? "Acknowledge" : "Resolve";
    RNAlert.alert(label, `${label} this alert?`, [
      { text: "Cancel", style: "cancel" },
      { text: label, onPress: () => action === "acknowledge" ? acknowledge(alertId) : resolve(alertId) },
    ]);
  }

  function renderAlert({ item }: { item: AlertRow }) {
    const el = item.elevator as any;
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <StatusBadge status={item.severity} />
          <Text style={styles.time}>{new Date(item.created_at).toLocaleDateString()}</Text>
        </View>
        <Text style={styles.alertTitle}>{item.title}</Text>
        <Text style={styles.location}>{el?.building?.name} — {el?.car_number}</Text>
        <Text style={styles.message} numberOfLines={3}>{item.message}</Text>

        {item.status === "active" && (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.ackBtn} onPress={() => handleAction(item.id, "acknowledge")}>
              <Text style={styles.ackBtnText}>Acknowledge</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resolveBtn} onPress={() => handleAction(item.id, "resolve")}>
              <Text style={styles.resolveBtnText}>Resolve</Text>
            </TouchableOpacity>
          </View>
        )}
        {item.status === "acknowledged" && (
          <TouchableOpacity style={styles.resolveBtn} onPress={() => handleAction(item.id, "resolve")}>
            <Text style={styles.resolveBtnText}>Resolve</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={alerts}
        keyExtractor={(a) => a.id}
        renderItem={renderAlert}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand[500]} />}
        ListEmptyComponent={loading ? null : <Text style={styles.empty}>No {tab} alerts</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  tabs: { flexDirection: "row", paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: 8 },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.gray[100] },
  tabActive: { backgroundColor: colors.brand[500] },
  tabText: { fontSize: 13, fontWeight: "500", color: colors.gray[600] },
  tabTextActive: { color: "#fff" },
  list: { padding: spacing.lg, gap: 12 },
  card: {
    backgroundColor: "#fff", borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: colors.gray[200],
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  time: { fontSize: 11, color: colors.gray[400] },
  alertTitle: { fontSize: 15, fontWeight: "600", color: colors.gray[900] },
  location: { fontSize: 12, color: colors.gray[500], marginTop: 2 },
  message: { fontSize: 13, color: colors.gray[600], marginTop: 8, lineHeight: 18 },
  actions: { flexDirection: "row", gap: 10, marginTop: 12 },
  ackBtn: {
    flex: 1, backgroundColor: colors.brand[600], borderRadius: 8,
    paddingVertical: 10, alignItems: "center",
  },
  ackBtnText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  resolveBtn: {
    flex: 1, backgroundColor: "#10B981", borderRadius: 8,
    paddingVertical: 10, alignItems: "center", marginTop: 0,
  },
  resolveBtnText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  empty: { textAlign: "center", color: colors.gray[400], marginTop: 40, fontSize: 14 },
});
