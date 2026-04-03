import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { supabase } from "../../src/lib/supabase";
import StatusBadge from "../../src/components/StatusBadge";
import { colors, spacing } from "../../src/lib/theme";

interface ServiceEvent {
  id: string;
  event_type: string;
  status: string;
  priority: string;
  reported_at: string;
  dispatched_at: string | null;
  arrived_at: string | null;
  completed_at: string | null;
  description: string | null;
  root_cause: string | null;
  is_after_hours: boolean;
  vendor: { name: string } | null;
  technician: { full_name: string } | null;
  elevator: { car_number: string; building: { name: string } | null } | null;
}

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<ServiceEvent | null>(null);
  const [updating, setUpdating] = useState(false);

  async function loadEvent() {
    const { data } = await supabase
      .from("service_events")
      .select("*, elevator:elevators(car_number, building:buildings(name)), vendor:organizations!vendor_org_id(name), technician:users!technician_id(full_name)")
      .eq("id", id)
      .single();
    if (data) setEvent(data as unknown as ServiceEvent);
  }

  useEffect(() => { loadEvent(); }, [id]);

  async function updateStatus(newStatus: string) {
    setUpdating(true);
    const updates: Record<string, unknown> = { status: newStatus };
    if (newStatus === "dispatched") updates.dispatched_at = new Date().toISOString();
    if (newStatus === "in_progress") updates.arrived_at = new Date().toISOString();
    if (newStatus === "completed") updates.completed_at = new Date().toISOString();
    await supabase.from("service_events").update(updates).eq("id", id);
    await loadEvent();
    setUpdating(false);
  }

  function confirmStatusChange(newStatus: string, label: string) {
    Alert.alert("Update Status", `Mark this event as ${label}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Confirm", onPress: () => updateStatus(newStatus) },
    ]);
  }

  if (!event) return <View style={styles.center}><Text style={styles.loading}>Loading...</Text></View>;

  const el = event.elevator as any;
  const vendor = event.vendor as any;
  const tech = event.technician as any;

  const timeline = [
    { label: "Reported", time: event.reported_at },
    { label: "Dispatched", time: event.dispatched_at },
    { label: "Arrived", time: event.arrived_at },
    { label: "Completed", time: event.completed_at },
  ].filter((t) => t.time);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{event.event_type.replace(/_/g, " ")}</Text>
        <Text style={styles.location}>{el?.building?.name} — {el?.car_number}</Text>
        <View style={styles.badges}>
          <StatusBadge status={event.status} size="md" />
          <StatusBadge status={event.priority} size="md" />
          {event.is_after_hours && (
            <View style={styles.afterHoursBadge}>
              <Text style={styles.afterHoursText}>After Hours</Text>
            </View>
          )}
        </View>
      </View>

      {/* Description */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Description</Text>
        <Text style={styles.cardText}>{event.description || "No description"}</Text>
        {event.root_cause && (
          <>
            <Text style={[styles.cardTitle, { marginTop: 12 }]}>Root Cause</Text>
            <Text style={styles.cardText}>{event.root_cause}</Text>
          </>
        )}
      </View>

      {/* Assignment */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Assignment</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Vendor</Text>
          <Text style={vendor?.name ? styles.value : styles.unassigned}>
            {vendor?.name || "Not assigned"}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Technician</Text>
          <Text style={tech?.full_name ? styles.value : styles.unassigned}>
            {tech?.full_name || "Not assigned"}
          </Text>
        </View>
      </View>

      {/* Timeline */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Timeline</Text>
        {timeline.map((step, i) => (
          <View key={step.label} style={styles.timelineStep}>
            <View style={styles.timelineDot} />
            {i < timeline.length - 1 && <View style={styles.timelineLine} />}
            <View style={styles.timelineContent}>
              <Text style={styles.timelineLabel}>{step.label}</Text>
              <Text style={styles.timelineTime}>{new Date(step.time!).toLocaleString()}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Actions */}
      {event.status !== "completed" && event.status !== "cancelled" && (
        <View style={styles.actions}>
          {event.status === "open" && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#8B5CF6" }]}
              onPress={() => confirmStatusChange("dispatched", "Dispatched")}
              disabled={updating}
            >
              <Text style={styles.actionBtnText}>Mark Dispatched</Text>
            </TouchableOpacity>
          )}
          {event.status === "dispatched" && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#F59E0B" }]}
              onPress={() => confirmStatusChange("in_progress", "In Progress")}
              disabled={updating}
            >
              <Text style={styles.actionBtnText}>Technician Arrived</Text>
            </TouchableOpacity>
          )}
          {(event.status === "dispatched" || event.status === "in_progress") && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#10B981" }]}
              onPress={() => confirmStatusChange("completed", "Completed")}
              disabled={updating}
            >
              <Text style={styles.actionBtnText}>Mark Completed</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#fff", borderWidth: 1, borderColor: colors.gray[300] }]}
            onPress={() => confirmStatusChange("cancelled", "Cancelled")}
            disabled={updating}
          >
            <Text style={[styles.actionBtnText, { color: colors.gray[700] }]}>Cancel Event</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loading: { color: colors.gray[400] },
  header: { padding: spacing.lg, paddingTop: spacing.xl },
  title: { fontSize: 22, fontWeight: "700", color: colors.gray[900], textTransform: "capitalize" },
  location: { fontSize: 14, color: colors.gray[500], marginTop: 4 },
  badges: { flexDirection: "row", gap: 8, marginTop: 10 },
  afterHoursBadge: { backgroundColor: "#F3E8FF", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  afterHoursText: { fontSize: 11, fontWeight: "600", color: "#7C3AED" },
  card: {
    backgroundColor: "#fff", borderRadius: 12, padding: 16, marginHorizontal: spacing.lg,
    marginBottom: 12, borderWidth: 1, borderColor: colors.gray[200],
  },
  cardTitle: { fontSize: 13, fontWeight: "600", color: colors.gray[500], marginBottom: 8 },
  cardText: { fontSize: 14, color: colors.gray[900], lineHeight: 20 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  label: { fontSize: 13, color: colors.gray[500] },
  value: { fontSize: 13, fontWeight: "500", color: colors.gray[900] },
  unassigned: { fontSize: 13, color: "#F97316", fontWeight: "500" },
  timelineStep: { flexDirection: "row", marginBottom: 16, position: "relative" },
  timelineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.brand[500], marginTop: 4, marginRight: 12 },
  timelineLine: { position: "absolute", left: 4, top: 16, width: 2, height: 20, backgroundColor: colors.gray[200] },
  timelineContent: { flex: 1 },
  timelineLabel: { fontSize: 14, fontWeight: "500", color: colors.gray[900] },
  timelineTime: { fontSize: 12, color: colors.gray[500], marginTop: 2 },
  actions: { paddingHorizontal: spacing.lg, paddingBottom: 32, gap: 10, marginTop: 4 },
  actionBtn: { borderRadius: 10, paddingVertical: 14, alignItems: "center" },
  actionBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
});
