import React from "react";
import { View, StyleSheet, FlatList, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useAppStore, Order } from "@/store";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const statusLabels: Record<Order["status"], { label: string; color: string }> = {
  pending: { label: "Pending", color: "#F59E0B" },
  confirmed: { label: "Confirmed", color: "#3B82F6" },
  out_for_delivery: { label: "Out for Delivery", color: "#8B5CF6" },
  delivered: { label: "Delivered", color: "#10B981" },
};

function OrderCard({ order, onPress }: { order: Order; onPress: () => void }) {
  const { theme } = useTheme();
  const status = statusLabels[order.status];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.orderCard,
        { backgroundColor: pressed ? theme.backgroundSecondary : theme.backgroundDefault },
      ]}
    >
      <View style={styles.orderHeader}>
        <View>
          <ThemedText type="caption" style={{ color: theme.textMuted }}>
            {order.createdAt.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </ThemedText>
          <ThemedText type="body" style={{ fontWeight: "600" }}>
            {order.id}
          </ThemedText>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status.color + "20" }]}>
          <ThemedText type="small" style={{ color: status.color, fontWeight: "600" }}>
            {status.label}
          </ThemedText>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <View style={styles.itemsPreview}>
        {order.items.slice(0, 3).map((item, index) => (
          <View
            key={item.product.id}
            style={[styles.itemThumbnail, { backgroundColor: theme.backgroundSecondary }]}
          >
            <Feather name="package" size={16} color={theme.textMuted} />
          </View>
        ))}
        {order.items.length > 3 ? (
          <View style={[styles.moreItems, { backgroundColor: theme.backgroundSecondary }]}>
            <ThemedText type="small" style={{ color: theme.textMuted }}>
              +{order.items.length - 3}
            </ThemedText>
          </View>
        ) : null}
      </View>

      <View style={styles.orderFooter}>
        <View>
          <ThemedText type="small" style={{ color: theme.textMuted }}>
            {order.items.reduce((sum, i) => sum + i.quantity, 0)} items
          </ThemedText>
        </View>
        <View style={styles.totalRow}>
          <ThemedText type="price">{order.total.toFixed(2)} KWD</ThemedText>
          <Feather name="chevron-right" size={20} color={theme.textMuted} />
        </View>
      </View>
    </Pressable>
  );
}

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const orders = useAppStore((state) => state.orders);

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onPress={() => navigation.navigate("OrderTracking", { orderId: item.id })}
          />
        )}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingHorizontal: Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl,
          flexGrow: 1,
        }}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="package" size={64} color={theme.textMuted} />
            <ThemedText
              type="h3"
              style={[styles.emptyTitle, { color: theme.textMuted }]}
            >
              No orders yet
            </ThemedText>
            <ThemedText
              type="body"
              style={[styles.emptyText, { color: theme.textMuted }]}
            >
              Your order history will appear here
            </ThemedText>
            <Button
              onPress={() => navigation.navigate("Main")}
              style={styles.shopButton}
            >
              Start Shopping
            </Button>
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  orderCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  itemsPreview: {
    flexDirection: "row",
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  itemThumbnail: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.xs,
    justifyContent: "center",
    alignItems: "center",
  },
  moreItems: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.xs,
    justifyContent: "center",
    alignItems: "center",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyTitle: {
    marginTop: Spacing.xl,
  },
  emptyText: {
    marginTop: Spacing.sm,
    textAlign: "center",
  },
  shopButton: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing["3xl"],
  },
});
