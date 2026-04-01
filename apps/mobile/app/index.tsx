import { View, Text, StyleSheet } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>ELEVaiT</Text>
      <Text style={styles.subtitle}>Elevator Monitoring Platform</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#1B4F72" },
  title: { fontSize: 48, fontWeight: "bold", color: "#fff" },
  subtitle: { fontSize: 18, color: "rgba(255,255,255,0.7)", marginTop: 8 },
});
