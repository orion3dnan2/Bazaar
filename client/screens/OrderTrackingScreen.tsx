import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useAppStore } from "@/store";

type RouteProps = RouteProp<RootStackParamList, "OrderTracking">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const orderSteps = [
  { key: "pending", label: "Order Placed", labelAr: "تم تقديم الطلب", icon: "check-circle" as const },
  { key: "confirmed", label: "Order Confirmed", labelAr: "تم تأكيد الطلب", icon: "package" as const },
  { key: "out_for_delivery", label: "Out for Delivery", labelAr: "في الطريق", icon: "truck" as const },
  { key: "delivered", label: "Delivered", labelAr: "تم التوصيل", icon: "home" as const },
];

export default function OrderTrackingScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { orderId } = route.params;
  const orders = useAppStore((state) => state.orders);
  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.notFound}>
          <ThemedText type="h3">Order not found</ThemedText>
          <Button onPress={() => navigation.goBack()} style={{ marginTop: Spacing.lg }}>
            Go Back
          </Button>
        </View>
      </ThemedView>
    );
  }

  const currentStepIndex = orderSteps.findIndex((s) => s.key === order.status);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingHorizontal: Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.orderHeader, { backgroundColor: theme.backgroundDefault }]}>
          <View>
            <ThemedText type="caption" style={{ color: theme.textMuted }}>
              Order Number
            </ThemedText>
            <ThemedText type="h3">{order.id}</ThemedText>
          </View>
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { backgroundColor: theme.success }]} />
            <ThemedText type="caption" style={{ color: theme.success }}>
              {orderSteps[currentStepIndex]?.label ?? "Processing"}
            </ThemedText>
          </View>
        </View>

        {order.estimatedDelivery ? (
          <View style={[styles.deliveryCard, { backgroundColor: theme.primary + "15" }]}>
            <Feather name="calendar" size={24} color={theme.primary} />
            <View style={styles.deliveryInfo}>
              <ThemedText type="caption" style={{ color: theme.textMuted }}>
                Estimated Delivery
              </ThemedText>
              <ThemedText type="h3">
                {order.estimatedDelivery.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </ThemedText>
            </View>
          </View>
        ) : null}

        <View style={styles.stepsContainer}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Order Status
          </ThemedText>
          {orderSteps.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <View key={step.key} style={styles.stepRow}>
                <View style={styles.stepIndicator}>
                  <View
                    style={[
                      styles.stepCircle,
                      {
                        backgroundColor: isCompleted ? theme.success : theme.backgroundSecondary,
                        borderColor: isCompleted ? theme.success : theme.border,
                      },
                    ]}
                  >
                    <Feather
                      name={step.icon}
                      size={16}
                      color={isCompleted ? "#FFFFFF" : theme.textMuted}
                    />
                  </View>
                  {index < orderSteps.length - 1 ? (
                    <View
                      style={[
                        styles.stepLine,
                        {
                          backgroundColor:
                            index < currentStepIndex ? theme.success : theme.border,
                        },
                      ]}
                    />
                  ) : null}
                </View>
                <View style={styles.stepContent}>
                  <ThemedText
                    type="body"
                    style={{
                      fontWeight: isCurrent ? "600" : "400",
                      color: isCompleted ? theme.text : theme.textMuted,
                    }}
                  >
                    {step.labelAr}
                  </ThemedText>
                  <ThemedText type="small" style={{ color: theme.textMuted }}>
                    {step.label}
                  </ThemedText>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.addressSection}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Delivery Address
          </ThemedText>
          <View style={[styles.addressCard, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.addressIcon}>
              <Feather name="map-pin" size={20} color={theme.primary} />
            </View>
            <View style={styles.addressContent}>
              <ThemedText type="body" style={{ fontWeight: "600" }}>
                {order.address.label}
              </ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                {order.address.fullName}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textMuted }}>
                {order.address.area}, Block {order.address.block}, Street {order.address.street}
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.itemsSection}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Order Items
          </ThemedText>
          {order.items.map((item) => (
            <View
              key={item.product.id}
              style={[styles.orderItem, { backgroundColor: theme.backgroundDefault }]}
            >
              <View style={[styles.itemImage, { backgroundColor: theme.backgroundSecondary }]}>
                <Feather name="package" size={20} color={theme.textMuted} />
              </View>
              <View style={styles.itemContent}>
                <ThemedText type="caption" numberOfLines={1}>
                  {item.product.nameAr}
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textMuted }}>
                  Qty: {item.quantity}
                </ThemedText>
              </View>
              <ThemedText type="body" style={{ fontWeight: "600" }}>
                {(item.product.price * item.quantity).toFixed(2)} KWD
              </ThemedText>
            </View>
          ))}
        </View>

        <View style={[styles.totalCard, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.totalRow}>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              Subtotal
            </ThemedText>
            <ThemedText type="body">
              {(order.total - order.deliveryFee).toFixed(2)} KWD
            </ThemedText>
          </View>
          <View style={styles.totalRow}>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              Delivery
            </ThemedText>
            <ThemedText type="body">{order.deliveryFee.toFixed(2)} KWD</ThemedText>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.totalRow}>
            <ThemedText type="h3">Total Paid</ThemedText>
            <ThemedText type="h2" style={{ color: theme.price }}>
              {order.total.toFixed(2)} KWD
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  notFound: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  deliveryCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  deliveryInfo: {
    marginLeft: Spacing.lg,
  },
  stepsContainer: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  stepRow: {
    flexDirection: "row",
  },
  stepIndicator: {
    alignItems: "center",
    marginRight: Spacing.lg,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  stepLine: {
    width: 2,
    flex: 1,
    minHeight: 30,
  },
  stepContent: {
    flex: 1,
    paddingBottom: Spacing.xl,
  },
  addressSection: {
    marginBottom: Spacing.xl,
  },
  addressCard: {
    flexDirection: "row",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  addressIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  addressContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  itemsSection: {
    marginBottom: Spacing.xl,
  },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  itemImage: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.xs,
    justifyContent: "center",
    alignItems: "center",
  },
  itemContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  totalCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.sm,
  },
});
