import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, type ViewStyle } from "react-native";
import { colors } from "../lib/theme";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

export function Card({ children, style, onPress }: CardProps) {
  if (onPress) {
    return (
      <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.7}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

interface StatCardProps {
  label: string;
  value: number | string;
  color?: string;
  onPress?: () => void;
}

export function StatCard({ label, value, color = colors.brand[500], onPress }: StatCardProps) {
  return (
    <Card onPress={onPress} style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={[styles.statBar, { backgroundColor: color }]} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  statCard: {
    flex: 1,
    minWidth: 140,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.gray[900],
  },
  statLabel: {
    fontSize: 13,
    color: colors.gray[500],
    marginTop: 2,
  },
  statBar: {
    height: 3,
    width: 32,
    borderRadius: 2,
    marginTop: 10,
  },
});
