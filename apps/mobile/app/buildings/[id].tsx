import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "../../src/lib/supabase";
import StatusBadge from "../../src/components/StatusBadge";
import { colors, spacing } from "../../src/lib/theme";

interface Building {
  id: string;
  name: string;
  address: string;
  floors: number;
  timezone: string | null;
  after_hours_start: string | null;
  after_hours_end: string | null;
}

interface Elevator {
  id: string;
  car_number: string;
  manufacturer: string | null;
  model: string | null;
  status: string;
}

export default function BuildingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [building, setBuilding] = useState<Building | null>(null);
  const [elevators, setElevators] = useState<Elevator[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  async function loadData() {
    const [bRes, eRes] = await Promise.all([
      supabase.from("buildings").select("*").eq("id", id).single(),
      supabase.from("elevators").select("id, car_number, manufacturer, model, status").eq("building_id", id).order("car_number"),
    ]);
    if (bRes.data) setBuilding(bRes.data);
    if (eRes.data) setElevators(eRes.data);
  }

  useEffect(() => { loadData(); }, [id]);

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  if (!building) return <View style={styles.center}><Text style={styles.loading}>Loading...</Text></View>;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand[500]} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{building.name}</Text>
        <Text style={styles.address}>{building.address}</Text>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoCard}>
          <Text style={styles.infoValue}>{building.floors}</Text>
          <Text style={styles.infoLabel}>Floors</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoValue}>{elevators.length}</Text>
          <Text style={styles.infoLabel}>Elevators</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoValue}>{elevators.filter(e => e.status === "operational").length}</Text>
          <Text style={styles.infoLabel}>Online</Text>
        </View>
      </View>

      {building.after_hours_start && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>After Hours</Text>
          <Text style={styles.sectionText}>{building.after_hours_start} — {building.after_hours_end}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Elevator Fleet</Text>
        {elevators.map((el) => (
          <TouchableOpacity
            key={el.id}
            style={styles.elevatorCard}
            onPress={() => router.push(`/elevators/${el.id}`)}
            activeOpacity={0.7}
          >
            <View style={styles.elevatorInfo}>
              <Text style={styles.elevatorName}>{el.car_number}</Text>
              <Text style={styles.elevatorMeta}>
                {[el.manufacturer, el.model].filter(Boolean).join(" ") || "—"}
              </Text>
            </View>
            <StatusBadge status={el.status} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loading: { color: colors.gray[400] },
  header: { padding: spacing.lg, paddingTop: spacing.xl },
  title: { fontSize: 22, fontWeight: "700", color: colors.gray[900] },
  address: { fontSize: 14, color: colors.gray[500], marginTop: 4 },
  infoRow: { flexDirection: "row", gap: 12, paddingHorizontal: spacing.lg },
  infoCard: {
    flex: 1, backgroundColor: "#fff", borderRadius: 12, padding: 14,
    alignItems: "center", borderWidth: 1, borderColor: colors.gray[200],
  },
  infoValue: { fontSize: 24, fontWeight: "700", color: colors.gray[900] },
  infoLabel: { fontSize: 11, color: colors.gray[500], marginTop: 2 },
  section: { marginTop: spacing.xl, paddingHorizontal: spacing.lg },
  sectionTitle: { fontSize: 17, fontWeight: "600", color: colors.gray[900], marginBottom: 12 },
  sectionText: { fontSize: 14, color: colors.gray[600] },
  elevatorCard: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#fff", borderRadius: 10, padding: 14,
    marginBottom: 8, borderWidth: 1, borderColor: colors.gray[200],
  },
  elevatorInfo: { flex: 1 },
  elevatorName: { fontSize: 15, fontWeight: "600", color: colors.gray[900] },
  elevatorMeta: { fontSize: 12, color: colors.gray[500], marginTop: 2 },
});
