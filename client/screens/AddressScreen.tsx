import React, { useState } from "react";
import { View, StyleSheet, TextInput, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useAppStore, Address } from "@/store";
import { kuwaitAreas } from "@/data/mockData";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function AddressScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { addAddress, addresses } = useAppStore();

  const [label, setLabel] = useState("Home");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedArea, setSelectedArea] = useState(kuwaitAreas[0].id);
  const [block, setBlock] = useState("");
  const [street, setStreet] = useState("");
  const [building, setBuilding] = useState("");
  const [floor, setFloor] = useState("");
  const [apartment, setApartment] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    if (!fullName.trim() || !phone.trim() || !block.trim() || !street.trim() || !building.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    const area = kuwaitAreas.find((a) => a.id === selectedArea);
    const newAddress: Address = {
      id: Date.now().toString(),
      label,
      fullName: fullName.trim(),
      phone: phone.trim(),
      area: area?.nameAr ?? area?.name ?? "",
      block: block.trim(),
      street: street.trim(),
      building: building.trim(),
      floor: floor.trim() || undefined,
      apartment: apartment.trim() || undefined,
      notes: notes.trim() || undefined,
      isDefault: addresses.length === 0,
    };

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addAddress(newAddress);
    navigation.goBack();
  };

  const labelOptions = ["Home", "Work", "Other"];

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={{
          paddingTop: Spacing.lg,
          paddingHorizontal: Spacing.lg,
          paddingBottom: insets.bottom + 100,
        }}
      >
        <View style={styles.section}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Label
          </ThemedText>
          <View style={styles.labelRow}>
            {labelOptions.map((opt) => (
              <Pressable
                key={opt}
                onPress={() => setLabel(opt)}
                style={[
                  styles.labelChip,
                  {
                    backgroundColor: label === opt ? theme.primary : theme.backgroundSecondary,
                    borderColor: label === opt ? theme.primary : theme.border,
                  },
                ]}
              >
                <ThemedText
                  type="body"
                  style={{ color: label === opt ? "#FFFFFF" : theme.text }}
                >
                  {opt}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Contact Information
          </ThemedText>
          <TextInput
            placeholder="Full Name"
            placeholderTextColor={theme.textMuted}
            value={fullName}
            onChangeText={setFullName}
            style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
          />
          <TextInput
            placeholder="Phone Number"
            placeholderTextColor={theme.textMuted}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
          />
        </View>

        <View style={styles.section}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Area
          </ThemedText>
          <View style={styles.areaGrid}>
            {kuwaitAreas.slice(0, 6).map((area) => (
              <Pressable
                key={area.id}
                onPress={() => setSelectedArea(area.id)}
                style={[
                  styles.areaChip,
                  {
                    backgroundColor: selectedArea === area.id ? theme.primary : theme.backgroundSecondary,
                    borderColor: selectedArea === area.id ? theme.primary : theme.border,
                  },
                ]}
              >
                <ThemedText
                  type="caption"
                  style={{ color: selectedArea === area.id ? "#FFFFFF" : theme.text }}
                  numberOfLines={1}
                >
                  {area.nameAr}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Address Details
          </ThemedText>
          <View style={styles.row}>
            <TextInput
              placeholder="Block"
              placeholderTextColor={theme.textMuted}
              value={block}
              onChangeText={setBlock}
              style={[styles.input, styles.halfInput, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
            />
            <TextInput
              placeholder="Street"
              placeholderTextColor={theme.textMuted}
              value={street}
              onChangeText={setStreet}
              style={[styles.input, styles.halfInput, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
            />
          </View>
          <View style={styles.row}>
            <TextInput
              placeholder="Building"
              placeholderTextColor={theme.textMuted}
              value={building}
              onChangeText={setBuilding}
              style={[styles.input, styles.halfInput, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
            />
            <TextInput
              placeholder="Floor (Optional)"
              placeholderTextColor={theme.textMuted}
              value={floor}
              onChangeText={setFloor}
              style={[styles.input, styles.halfInput, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
            />
          </View>
          <TextInput
            placeholder="Apartment (Optional)"
            placeholderTextColor={theme.textMuted}
            value={apartment}
            onChangeText={setApartment}
            style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
          />
          <TextInput
            placeholder="Delivery Notes (Optional)"
            placeholderTextColor={theme.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            style={[styles.input, styles.notesInput, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
          />
        </View>

        <Button onPress={handleSave} style={styles.saveButton}>
          Save Address
        </Button>
      </KeyboardAwareScrollViewCompat>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  labelRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  labelChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    marginBottom: Spacing.md,
    borderWidth: 1,
  },
  row: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  notesInput: {
    height: 80,
    paddingTop: Spacing.md,
    textAlignVertical: "top",
  },
  areaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  areaChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  saveButton: {
    marginTop: Spacing.lg,
  },
});
