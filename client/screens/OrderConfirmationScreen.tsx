import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
  withSequence,
} from "react-native-reanimated";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useAppStore } from "@/store";

type RouteProps = RouteProp<RootStackParamList, "OrderConfirmation">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function OrderConfirmationScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { orderId } = route.params;
  const orders = useAppStore((state) => state.orders);
  const order = orders.find((o) => o.id === orderId);

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    scale.value = withSpring(1, { damping: 12 });
    opacity.value = withDelay(300, withSpring(1));
  }, []);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <ThemedView style={styles.container}>
      <View
        style={[
          styles.content,
          { paddingTop: insets.top + 100, paddingBottom: insets.bottom + Spacing.xl },
        ]}
      >
        <Animated.View
          style={[
            styles.iconContainer,
            { backgroundColor: theme.success + "20" },
            iconAnimatedStyle,
          ]}
        >
          <Feather name="check" size={64} color={theme.success} />
        </Animated.View>

        <Animated.View style={[styles.textContainer, contentAnimatedStyle]}>
          <ThemedText type="h1" style={styles.title}>
            Order Confirmed!
          </ThemedText>
          <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
            Thank you for your order. We will notify you when your order is on its way.
          </ThemedText>
        </Animated.View>

        <Animated.View style={[styles.orderCard, { backgroundColor: theme.backgroundDefault }, contentAnimatedStyle]}>
          <View style={styles.orderRow}>
            <ThemedText type="caption" style={{ color: theme.textMuted }}>
              Order Number
            </ThemedText>
            <ThemedText type="body" style={{ fontWeight: "600" }}>
              {orderId}
            </ThemedText>
          </View>
          {order ? (
            <>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <View style={styles.orderRow}>
                <ThemedText type="caption" style={{ color: theme.textMuted }}>
                  Total Amount
                </ThemedText>
                <ThemedText type="price">{order.total.toFixed(2)} KWD</ThemedText>
              </View>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <View style={styles.orderRow}>
                <ThemedText type="caption" style={{ color: theme.textMuted }}>
                  Estimated Delivery
                </ThemedText>
                <ThemedText type="body">
                  {order.estimatedDelivery?.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </ThemedText>
              </View>
            </>
          ) : null}
        </Animated.View>

        <Animated.View style={[styles.buttonContainer, contentAnimatedStyle]}>
          <Button
            onPress={() => navigation.navigate("OrderTracking", { orderId })}
            style={styles.trackButton}
          >
            Track Order
          </Button>
          <Button
            onPress={() => navigation.navigate("Main")}
            style={[styles.homeButton, { backgroundColor: theme.backgroundSecondary }]}
          >
            <ThemedText type="body" style={{ color: theme.text, fontWeight: "600" }}>
              Continue Shopping
            </ThemedText>
          </Button>
        </Animated.View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  textContainer: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  subtitle: {
    textAlign: "center",
    paddingHorizontal: Spacing.xl,
  },
  orderCard: {
    width: "100%",
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing["3xl"],
  },
  orderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  buttonContainer: {
    width: "100%",
    gap: Spacing.md,
  },
  trackButton: {
    width: "100%",
  },
  homeButton: {
    width: "100%",
  },
});
