import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "../../src/lib/supabase";
import StatusBadge from "../../src/components/StatusBadge";
import { colors, spacing } from "../../src/lib/theme";

interface Elevator {
  id: string;
  car_number: string;
  manufacturer: string | null;
  model: string | null;
  controller_type: string | null;
  iot_device_id: string | null;
  status: string;
  install_date: string | null;
  floors_served: number[] | null;
  building: { id: string; name: string } | null;
}

interface EventRow {
  id: string;
  event_type: string;
  status: string;
  priority: string;
  reported_at: string;
  description: string | null;
}

export default function ElevatorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [elevator, setElevator] = useState<Elevator | null>(null);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  async function loadData() {
    const [elRes, evRes] = await Promise.all([
      supabase.from("elevators").select("*, building:buildings(id, name)").eq("id", id).single(),
      supabase.from("service_events").select("id, event_type, status, priority, reported_at, description")
        .eq("elevator_id", id).order("reported_at", { ascending: false }).limit(10),
    ]);
    if (elRes.data) setElevator(elRes.data as unknown as Elevator);
    if (evRes.data) setEvents(evRes.data);
  }

  useEffect(() => { loadData(); }, [id]);

  async function onRefresh() { setRefreshing(true); await loadData(); setRefreshing(false); }

  if (!elevator) return <View style={styles.center}><Text style={styles.loading}>Loading...</Text></View>;

  const bldg = elevator.building as any;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand[500]} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{bldg?.name} — {elevator.car_number}</Text>
        <View style={styles.badges}>
          <StatusBadge status={elevator.status} size="md" />
          {elevator.iot_device_id && (
            <View style={styles.iotBadge}>
              <Text style={styles.iotText}>{elevator.iot_device_id}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.infoGrid}>
        {[
          { label: "Manufacturer", value: elevator.manufacturer },
          { label: "Model", value: elevator.model },
          { label: "Controller", value: elevator.controller_type },
          { label: "Installed", value: elevator.install_date ? new Date(elevator.install_date).toLocaleDateString() : null },
        ].map((item) => (
          <View key={item.label} style={styles.infoCard}>
            <Text style={styles.infoLabel}>{item.label}</Text>
            <Text style={styles.infoValue}>{item.value || "—"}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.reportButton}
        onPress={() => router.push(`/events/report?elevator_id=${id}`)}
      >
        <Text style={styles.reportButtonText}>Report Service Call</Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Service History</Text>
        {events.length === 0 ? (
          <Text style={styles.emptyText}>No service events</Text>
        ) : (
          events.map((ev) => (
            <TouchableOpacity
              key={ev.id}
              style={styles.eventCard}
              onPress={() => router.push(`/events/${ev.id}`)}
            >
              <View style={styles.eventTop}>
                <StatusBadge status={ev.status} />
                <StatusBadge status={ev.priority} />
              </View>
              <Text style={styles.eventType}>{ev.event_type.replace(/_/g, " ")}</Text>
              <Text style={styles.eventDesc} numberOfLines={2}>{ev.description || "No description"}</Text>
              <Text style={styles.eventDate}>{new Date(ev.reported_at).toLocaleString()}</Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loading: { color: colors.gray[400] },
  header: { padding: spacing.lg, paddingTop: spacing.xl },
  title: { fontSize: 20, fontWeight: "700", color: colors.gray[900] },
  badges: { flexDirection: "row", gap: 8, marginTop: 8 },
  iotBadge: { backgroundColor: colors.gray[100], paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  iotText: { fontSize: 11, fontFamily: "monospace", color: colors.gray[600] },
  infoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingHorizontal: spacing.lg },
  infoCard: {
    width: "47%", backgroundColor: "#fff", borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: colors.gray[200],
  },
  infoLabel: { fontSize: 11, color: colors.gray[500] },
  infoValue: { fontSize: 14, fontWeight: "600", color: colors.gray[900], marginTop: 4 },
  reportButton: {
    backgroundColor: "#DC2626", borderRadius: 10, marginHorizontal: spacing.lg,
    marginTop: spacing.lg, paddingVertical: 14, alignItems: "center",
  },
  reportButtonText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  section: { marginTop: spacing.xl, paddingHorizontal: spacing.lg, paddingBottom: 32 },
  sectionTitle: { fontSize: 17, fontWeight: "600", color: colors.gray[900], marginBottom: 12 },
  emptyText: { fontSize: 13, color: colors.gray[400] },
  eventCard: {
    backgroundColor: "#fff", borderRadius: 10, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: colors.gray[200],
  },
  eventTop: { flexDirection: "row", gap: 8, marginBottom: 6 },
  eventType: { fontSize: 14, fontWeight: "500", color: colors.gray[900], textTransform: "capitalize" },
  eventDesc: { fontSize: 12, color: colors.gray[500], marginTop: 4 },
  eventDate: { fontSize: 11, color: colors.gray[400], marginTop: 6 },
});
