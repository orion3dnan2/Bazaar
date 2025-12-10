import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useAppStore, Address, Order } from "@/store";
import { kuwaitAreas } from "@/data/mockData";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { cart, addresses, getCartTotal, addOrder, clearCart, addAddress } = useAppStore();
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? null
  );
  const [isLoading, setIsLoading] = useState(false);

  const deliveryFee = 2.0;
  const subtotal = getCartTotal();
  const total = subtotal + deliveryFee;

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  const handlePlaceOrder = async () => {
    if (!selectedAddress && addresses.length === 0) {
      const defaultAddress: Address = {
        id: Date.now().toString(),
        label: "Home",
        fullName: "Guest User",
        phone: "+965 5000 0000",
        area: kuwaitAreas[0].nameAr,
        block: "1",
        street: "1",
        building: "1",
        isDefault: true,
      };
      addAddress(defaultAddress);
      setSelectedAddressId(defaultAddress.id);
    }

    setIsLoading(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const order: Order = {
      id: `ORD-${Date.now()}`,
      items: [...cart],
      total,
      deliveryFee,
      status: "pending",
      address: selectedAddress ?? {
        id: "temp",
        label: "Home",
        fullName: "Guest User",
        phone: "+965 5000 0000",
        area: kuwaitAreas[0].nameAr,
        block: "1",
        street: "1",
        building: "1",
        isDefault: true,
      },
      createdAt: new Date(),
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    };

    addOrder(order);
    clearCart();
    setIsLoading(false);
    navigation.replace("OrderConfirmation", { orderId: order.id });
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={{
          paddingTop: Spacing.lg,
          paddingHorizontal: Spacing.lg,
          paddingBottom: 150 + insets.bottom,
        }}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="h3">Delivery Address</ThemedText>
            <Pressable onPress={() => navigation.navigate("Address", { mode: "add" })}>
              <ThemedText type="link">Add New</ThemedText>
            </Pressable>
          </View>

          {addresses.length > 0 ? (
            addresses.map((address) => (
              <Pressable
                key={address.id}
                onPress={() => setSelectedAddressId(address.id)}
                style={[
                  styles.addressCard,
                  {
                    backgroundColor: theme.backgroundDefault,
                    borderColor:
                      selectedAddressId === address.id ? theme.primary : theme.border,
                    borderWidth: selectedAddressId === address.id ? 2 : 1,
                  },
                ]}
              >
                <View style={styles.addressHeader}>
                  <View style={styles.addressLabel}>
                    <Feather name="map-pin" size={16} color={theme.primary} />
                    <ThemedText type="body" style={{ fontWeight: "600", marginLeft: Spacing.sm }}>
                      {address.label}
                    </ThemedText>
                  </View>
                  {selectedAddressId === address.id ? (
                    <Feather name="check-circle" size={20} color={theme.primary} />
                  ) : null}
                </View>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  {address.fullName}
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textMuted }}>
                  {address.area}, Block {address.block}, Street {address.street}
                </ThemedText>
              </Pressable>
            ))
          ) : (
            <View style={[styles.emptyAddress, { backgroundColor: theme.backgroundDefault }]}>
              <Feather name="map-pin" size={32} color={theme.textMuted} />
              <ThemedText type="body" style={{ color: theme.textMuted, marginTop: Spacing.md }}>
                No saved addresses
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textMuted }}>
                A default address will be used for this order
              </ThemedText>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Payment Method
          </ThemedText>
          <View style={[styles.paymentCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.primary }]}>
            <View style={styles.paymentLeft}>
              <Feather name="dollar-sign" size={24} color={theme.primary} />
              <View style={styles.paymentInfo}>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  Cash on Delivery
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textMuted }}>
                  Pay when you receive your order
                </ThemedText>
              </View>
            </View>
            <Feather name="check-circle" size={20} color={theme.primary} />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Order Summary
          </ThemedText>
          <View style={[styles.summaryCard, { backgroundColor: theme.backgroundDefault }]}>
            {cart.map((item) => (
              <View key={item.product.id} style={styles.summaryItem}>
                <ThemedText type="caption" style={{ flex: 1 }} numberOfLines={1}>
                  {item.product.nameAr} x{item.quantity}
                </ThemedText>
                <ThemedText type="caption">
                  {(item.product.price * item.quantity).toFixed(2)} KWD
                </ThemedText>
              </View>
            ))}
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.summaryItem}>
              <ThemedText type="body" style={{ color: theme.textSecondary }}>
                Subtotal
              </ThemedText>
              <ThemedText type="body">{subtotal.toFixed(2)} KWD</ThemedText>
            </View>
            <View style={styles.summaryItem}>
              <ThemedText type="body" style={{ color: theme.textSecondary }}>
                Delivery
              </ThemedText>
              <ThemedText type="body">{deliveryFee.toFixed(2)} KWD</ThemedText>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.summaryItem}>
              <ThemedText type="h3">Total</ThemedText>
              <ThemedText type="h2" style={{ color: theme.price }}>
                {total.toFixed(2)} KWD
              </ThemedText>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollViewCompat>

      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: theme.backgroundRoot,
            paddingBottom: insets.bottom + Spacing.lg,
          },
          Shadows.lg,
        ]}
      >
        <Button
          onPress={handlePlaceOrder}
          disabled={isLoading || cart.length === 0}
          style={styles.placeOrderButton}
        >
          {isLoading ? "Placing Order..." : "Place Order"}
        </Button>
      </View>
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  addressCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  addressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  addressLabel: {
    flexDirection: "row",
    alignItems: "center",
  },
  emptyAddress: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  paymentCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
  },
  paymentLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentInfo: {
    marginLeft: Spacing.md,
  },
  summaryCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.sm,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  placeOrderButton: {
    width: "100%",
  },
});
