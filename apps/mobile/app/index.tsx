import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../src/lib/auth-context";
import { supabase } from "../src/lib/supabase";
import { StatCard } from "../src/components/Card";
import StatusBadge from "../src/components/StatusBadge";
import { colors, spacing } from "../src/lib/theme";

interface AlertRow { id: string; severity: string; title: string; created_at: string; }
interface EventRow { id: string; event_type: string; status: string; priority: string; description: string | null; }

export default function HomeScreen() {
  const { profile } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [buildingCount, setBuildingCount] = useState(0);
  const [elevatorCount, setElevatorCount] = useState(0);
  const [outOfOrder, setOutOfOrder] = useState(0);
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);

  async function loadData() {
    const [bRes, eRes, oRes, aRes, evRes] = await Promise.all([
      supabase.from("buildings").select("id", { count: "exact", head: true }),
      supabase.from("elevators").select("id", { count: "exact", head: true }),
      supabase.from("elevators").select("id", { count: "exact", head: true }).eq("status", "out_of_order"),
      supabase.from("alerts").select("id, severity, title, created_at").eq("status", "active").order("created_at", { ascending: false }).limit(5),
      supabase.from("service_events").select("id, event_type, status, priority, description").in("status", ["open", "dispatched", "in_progress"]).order("reported_at", { ascending: false }).limit(5),
    ]);
    setBuildingCount(bRes.count ?? 0);
    setElevatorCount(eRes.count ?? 0);
    setOutOfOrder(oRes.count ?? 0);
    if (aRes.data) setAlerts(aRes.data);
    if (evRes.data) setEvents(evRes.data);
  }

  useEffect(() => { loadData(); }, []);

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand[500]} />}
    >
      <View style={styles.greeting}>
        <Text style={styles.greetingText}>Welcome back, {profile?.full_name?.split(" ")[0]}</Text>
        <Text style={styles.orgText}>{profile?.organization?.name}</Text>
      </View>

      <View style={styles.statsRow}>
        <StatCard label="Buildings" value={buildingCount} color={colors.brand[500]} onPress={() => router.push("/buildings")} />
        <StatCard label="Elevators" value={elevatorCount} color="#10B981" onPress={() => router.push("/buildings")} />
      </View>
      <View style={styles.statsRow}>
        <StatCard label="Out of Order" value={outOfOrder} color="#EF4444" />
        <StatCard label="Active Alerts" value={alerts.length} color="#F97316" onPress={() => router.push("/alerts")} />
      </View>

      {/* Active Alerts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Alerts</Text>
          <TouchableOpacity onPress={() => router.push("/alerts")}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        {alerts.length === 0 ? (
          <Text style={styles.emptyText}>No active alerts</Text>
        ) : (
          alerts.map((a) => (
            <View key={a.id} style={styles.listItem}>
              <StatusBadge status={a.severity} />
              <View style={styles.listItemContent}>
                <Text style={styles.listItemTitle} numberOfLines={1}>{a.title}</Text>
                <Text style={styles.listItemSub}>{new Date(a.created_at).toLocaleString()}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Open Events */}
      <View style={[styles.section, { marginBottom: 32 }]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Open Events</Text>
          <TouchableOpacity onPress={() => router.push("/events")}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        {events.length === 0 ? (
          <Text style={styles.emptyText}>No open events</Text>
        ) : (
          events.map((e) => (
            <TouchableOpacity key={e.id} style={styles.listItem} onPress={() => router.push(`/events/${e.id}`)}>
              <StatusBadge status={e.status} />
              <View style={styles.listItemContent}>
                <Text style={styles.listItemTitle} numberOfLines={1}>
                  {e.event_type.replace(/_/g, " ")} — {e.description?.slice(0, 50) || "No description"}
                </Text>
              </View>
              <StatusBadge status={e.priority} />
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  greeting: { padding: spacing.lg, paddingTop: spacing.xl },
  greetingText: { fontSize: 22, fontWeight: "700", color: colors.gray[900] },
  orgText: { fontSize: 14, color: colors.gray[500], marginTop: 2 },
  statsRow: { flexDirection: "row", gap: 12, paddingHorizontal: spacing.lg, marginBottom: 12 },
  section: { marginTop: spacing.lg, paddingHorizontal: spacing.lg },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: "600", color: colors.gray[900] },
  seeAll: { fontSize: 13, color: colors.brand[500], fontWeight: "500" },
  emptyText: { fontSize: 13, color: colors.gray[400], paddingVertical: 12 },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  listItemContent: { flex: 1 },
  listItemTitle: { fontSize: 13, fontWeight: "500", color: colors.gray[900] },
  listItemSub: { fontSize: 11, color: colors.gray[500], marginTop: 2 },
});
