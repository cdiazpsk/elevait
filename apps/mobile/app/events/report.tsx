import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import { supabase } from "../../src/lib/supabase";
import { colors, spacing } from "../../src/lib/theme";

interface ElevatorOption {
  id: string;
  car_number: string;
  building_name: string;
}

export default function ReportEventScreen() {
  const router = useRouter();
  const { elevator_id } = useLocalSearchParams<{ elevator_id?: string }>();

  const [elevators, setElevators] = useState<ElevatorOption[]>([]);
  const [elevatorId, setElevatorId] = useState(elevator_id || "");
  const [eventType, setEventType] = useState("callback");
  const [priority, setPriority] = useState("normal");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase
      .from("elevators")
      .select("id, car_number, building:buildings(name)")
      .then(({ data }) => {
        if (data) {
          setElevators(data.map((e: any) => ({
            id: e.id,
            car_number: e.car_number,
            building_name: e.building?.name || "Unknown",
          })));
        }
      });
  }, []);

  async function handleSubmit() {
    if (!elevatorId) { Alert.alert("Error", "Please select an elevator"); return; }
    if (!description.trim()) { Alert.alert("Error", "Please enter a description"); return; }

    setLoading(true);
    const { error } = await supabase.from("service_events").insert({
      elevator_id: elevatorId,
      event_type: eventType,
      priority,
      status: "open",
      description: description.trim(),
      reported_at: new Date().toISOString(),
    });
    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "Service call reported", [
        { text: "OK", onPress: () => router.back() },
      ]);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container}>
        <View style={styles.form}>
          <Text style={styles.label}>Elevator</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={elevatorId}
              onValueChange={setElevatorId}
              style={styles.picker}
            >
              <Picker.Item label="Select elevator..." value="" />
              {elevators.map((el) => (
                <Picker.Item
                  key={el.id}
                  label={`${el.building_name} — ${el.car_number}`}
                  value={el.id}
                />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Event Type</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={eventType} onValueChange={setEventType} style={styles.picker}>
              <Picker.Item label="Callback" value="callback" />
              <Picker.Item label="Entrapment" value="entrapment" />
              <Picker.Item label="Preventive Maintenance" value="pm_visit" />
              <Picker.Item label="Repair" value="repair" />
              <Picker.Item label="Inspection" value="inspection" />
              <Picker.Item label="Emergency" value="emergency" />
            </Picker>
          </View>

          <Text style={styles.label}>Priority</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={priority} onValueChange={setPriority} style={styles.picker}>
              <Picker.Item label="Low" value="low" />
              <Picker.Item label="Normal" value="normal" />
              <Picker.Item label="High" value="high" />
              <Picker.Item label="Critical" value="critical" />
            </Picker>
          </View>

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.textArea}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the issue..."
            placeholderTextColor={colors.gray[400]}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>Report Service Call</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  form: { padding: spacing.lg },
  label: { fontSize: 13, fontWeight: "600", color: colors.gray[700], marginBottom: 6, marginTop: 16 },
  pickerContainer: {
    backgroundColor: "#fff", borderWidth: 1, borderColor: colors.gray[300],
    borderRadius: 10, overflow: "hidden",
  },
  picker: { height: 50 },
  textArea: {
    backgroundColor: "#fff", borderWidth: 1, borderColor: colors.gray[300],
    borderRadius: 10, padding: 14, fontSize: 15, minHeight: 100,
    color: colors.gray[900],
  },
  submitBtn: {
    backgroundColor: colors.brand[600], borderRadius: 10,
    paddingVertical: 14, alignItems: "center", marginTop: 24,
  },
  submitBtnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  cancelBtn: {
    borderWidth: 1, borderColor: colors.gray[300], borderRadius: 10,
    paddingVertical: 14, alignItems: "center", marginTop: 10,
  },
  cancelBtnText: { color: colors.gray[700], fontWeight: "500", fontSize: 15 },
});
