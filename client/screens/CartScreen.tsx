import React from "react";
import { View, StyleSheet, FlatList, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useAppStore, CartItem } from "@/store";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function CartItemCard({ item }: { item: CartItem }) {
  const { theme } = useTheme();
  const { updateCartQuantity, removeFromCart } = useAppStore();

  const handleQuantityChange = (delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateCartQuantity(item.product.id, item.quantity + delta);
  };

  const handleRemove = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    removeFromCart(item.product.id);
  };

  return (
    <Animated.View
      entering={FadeInRight}
      exiting={FadeOutLeft}
      style={[styles.cartItem, { backgroundColor: theme.backgroundDefault }]}
    >
      <View style={[styles.itemImage, { backgroundColor: theme.backgroundSecondary }]}>
        <Feather name="package" size={30} color={theme.textMuted} />
      </View>
      <View style={styles.itemContent}>
        <ThemedText type="body" numberOfLines={2} style={styles.itemName}>
          {item.product.nameAr}
        </ThemedText>
        {item.selectedSize || item.selectedColor ? (
          <ThemedText type="small" style={{ color: theme.textMuted }}>
            {[item.selectedSize, item.selectedColor].filter(Boolean).join(" - ")}
          </ThemedText>
        ) : null}
        <View style={styles.itemFooter}>
          <ThemedText type="price">
            {(item.product.price * item.quantity).toFixed(2)} KWD
          </ThemedText>
          <View style={styles.quantityControls}>
            <Pressable
              onPress={() => handleQuantityChange(-1)}
              style={[styles.quantityBtn, { backgroundColor: theme.backgroundTertiary }]}
            >
              <Feather name="minus" size={16} color={theme.text} />
            </Pressable>
            <ThemedText type="body" style={styles.quantityText}>
              {item.quantity}
            </ThemedText>
            <Pressable
              onPress={() => handleQuantityChange(1)}
              style={[styles.quantityBtn, { backgroundColor: theme.backgroundTertiary }]}
            >
              <Feather name="plus" size={16} color={theme.text} />
            </Pressable>
          </View>
        </View>
      </View>
      <Pressable onPress={handleRemove} style={styles.removeBtn} hitSlop={8}>
        <Feather name="trash-2" size={20} color={theme.error} />
      </Pressable>
    </Animated.View>
  );
}

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { cart, getCartTotal, clearCart } = useAppStore();

  const deliveryFee = cart.length > 0 ? 2.0 : 0;
  const subtotal = getCartTotal();
  const total = subtotal + deliveryFee;

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={cart}
        keyExtractor={(item) => item.product.id}
        renderItem={({ item }) => <CartItemCard item={item} />}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingHorizontal: Spacing.lg,
          paddingBottom: 200 + insets.bottom,
          flexGrow: 1,
        }}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="shopping-cart" size={64} color={theme.textMuted} />
            <ThemedText
              type="h3"
              style={[styles.emptyTitle, { color: theme.textMuted }]}
            >
              Your cart is empty
            </ThemedText>
            <ThemedText
              type="body"
              style={[styles.emptyText, { color: theme.textMuted }]}
            >
              Add items to your cart to get started
            </ThemedText>
            <Button
              onPress={() => navigation.goBack()}
              style={styles.browseButton}
            >
              Continue Shopping
            </Button>
          </View>
        }
      />

      {cart.length > 0 ? (
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
          <View style={[styles.summaryCard, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.summaryRow}>
              <ThemedText type="body" style={{ color: theme.textSecondary }}>
                Subtotal
              </ThemedText>
              <ThemedText type="body">{subtotal.toFixed(2)} KWD</ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText type="body" style={{ color: theme.textSecondary }}>
                Delivery Fee
              </ThemedText>
              <ThemedText type="body">{deliveryFee.toFixed(2)} KWD</ThemedText>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.summaryRow}>
              <ThemedText type="h3">Total</ThemedText>
              <ThemedText type="h2" style={{ color: theme.price }}>
                {total.toFixed(2)} KWD
              </ThemedText>
            </View>
          </View>
          <Button onPress={() => navigation.navigate("Checkout")} style={styles.checkoutButton}>
            Proceed to Checkout
          </Button>
        </View>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cartItem: {
    flexDirection: "row",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  itemContent: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: "space-between",
  },
  itemName: {
    marginBottom: Spacing.xs,
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  quantityBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    minWidth: 24,
    textAlign: "center",
  },
  removeBtn: {
    padding: Spacing.sm,
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
  browseButton: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing["3xl"],
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  summaryCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.sm,
  },
  checkoutButton: {
    width: "100%",
  },
});
