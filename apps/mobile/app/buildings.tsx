import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../src/lib/supabase";
import { colors, spacing } from "../src/lib/theme";

interface Building {
  id: string;
  name: string;
  address: string;
  floors: number;
  elevator_count?: number;
}

export default function BuildingsScreen() {
  const router = useRouter();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadBuildings() {
    const { data } = await supabase
      .from("buildings")
      .select("id, name, address, floors")
      .order("name");

    if (data) {
      // Get elevator counts per building
      const withCounts = await Promise.all(
        data.map(async (b) => {
          const { count } = await supabase
            .from("elevators")
            .select("id", { count: "exact", head: true })
            .eq("building_id", b.id);
          return { ...b, elevator_count: count ?? 0 };
        })
      );
      setBuildings(withCounts);
    }
    setLoading(false);
  }

  useEffect(() => { loadBuildings(); }, []);

  async function onRefresh() {
    setRefreshing(true);
    await loadBuildings();
    setRefreshing(false);
  }

  function renderBuilding({ item }: { item: Building }) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/buildings/${item.id}`)}
        activeOpacity={0.7}
      >
        <Text style={styles.buildingName}>{item.name}</Text>
        <Text style={styles.address} numberOfLines={1}>{item.address}</Text>
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Text style={styles.metaValue}>{item.floors}</Text>
            <Text style={styles.metaLabel}>Floors</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaValue}>{item.elevator_count}</Text>
            <Text style={styles.metaLabel}>Elevators</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <FlatList
      data={buildings}
      keyExtractor={(b) => b.id}
      renderItem={renderBuilding}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand[500]} />}
      ListEmptyComponent={
        loading ? null : <Text style={styles.empty}>No buildings found</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, gap: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  buildingName: { fontSize: 16, fontWeight: "600", color: colors.gray[900] },
  address: { fontSize: 13, color: colors.gray[500], marginTop: 4 },
  meta: { flexDirection: "row", gap: 24, marginTop: 12 },
  metaItem: { alignItems: "center" },
  metaValue: { fontSize: 18, fontWeight: "700", color: colors.gray[900] },
  metaLabel: { fontSize: 11, color: colors.gray[500], marginTop: 2 },
  empty: { textAlign: "center", color: colors.gray[400], marginTop: 40, fontSize: 14 },
});
