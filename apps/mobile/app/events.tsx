import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../src/lib/supabase";
import StatusBadge from "../src/components/StatusBadge";
import { colors, spacing } from "../src/lib/theme";

interface EventRow {
  id: string;
  event_type: string;
  status: string;
  priority: string;
  reported_at: string;
  description: string | null;
  elevator: { car_number: string; building: { name: string } | null } | null;
}

export default function EventsScreen() {
  const router = useRouter();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadEvents() {
    const { data } = await supabase
      .from("service_events")
      .select("id, event_type, status, priority, reported_at, description, elevator:elevators(car_number, building:buildings(name))")
      .order("reported_at", { ascending: false })
      .limit(50);
    if (data) setEvents(data as unknown as EventRow[]);
    setLoading(false);
  }

  useEffect(() => { loadEvents(); }, []);

  async function onRefresh() { setRefreshing(true); await loadEvents(); setRefreshing(false); }

  function renderEvent({ item }: { item: EventRow }) {
    const el = item.elevator as any;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/events/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.cardTop}>
          <StatusBadge status={item.status} />
          <StatusBadge status={item.priority} />
          <Text style={styles.time}>{new Date(item.reported_at).toLocaleDateString()}</Text>
        </View>
        <Text style={styles.eventType}>{item.event_type.replace(/_/g, " ")}</Text>
        <Text style={styles.location} numberOfLines={1}>
          {el?.building?.name} — {el?.car_number}
        </Text>
        {item.description && (
          <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.reportBtn}
        onPress={() => router.push("/events/report")}
      >
        <Text style={styles.reportBtnText}>+ Report Service Call</Text>
      </TouchableOpacity>

      <FlatList
        data={events}
        keyExtractor={(e) => e.id}
        renderItem={renderEvent}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand[500]} />}
        ListEmptyComponent={loading ? null : <Text style={styles.empty}>No service events</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  reportBtn: {
    backgroundColor: colors.brand[600], margin: spacing.lg, marginBottom: 0,
    paddingVertical: 12, borderRadius: 10, alignItems: "center",
  },
  reportBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  list: { padding: spacing.lg, gap: 10 },
  card: {
    backgroundColor: "#fff", borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: colors.gray[200],
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  time: { marginLeft: "auto", fontSize: 11, color: colors.gray[400] },
  eventType: { fontSize: 15, fontWeight: "600", color: colors.gray[900], textTransform: "capitalize" },
  location: { fontSize: 13, color: colors.gray[500], marginTop: 2 },
  desc: { fontSize: 12, color: colors.gray[400], marginTop: 6 },
  empty: { textAlign: "center", color: colors.gray[400], marginTop: 40, fontSize: 14 },
});
