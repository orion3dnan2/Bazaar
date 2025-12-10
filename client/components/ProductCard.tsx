import React from "react";
import { View, StyleSheet, Pressable, ViewStyle } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { Product, useAppStore } from "@/store";

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ProductCard({ product, onPress, style }: ProductCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const { wishlist, toggleWishlist, isInWishlist } = useAppStore();
  const isWishlisted = isInWishlist(product.id);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const handleWishlistPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleWishlist(product.id);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.container,
        { backgroundColor: theme.cardBackground, borderColor: theme.border },
        animatedStyle,
        style,
      ]}
    >
      <View style={[styles.imageContainer, { backgroundColor: theme.backgroundSecondary }]}>
        <Feather name="package" size={40} color={theme.textMuted} />
        {discount > 0 ? (
          <View style={[styles.discountBadge, { backgroundColor: theme.error }]}>
            <ThemedText type="small" style={styles.discountText}>
              -{discount}%
            </ThemedText>
          </View>
        ) : null}
        <Pressable
          onPress={handleWishlistPress}
          style={[styles.wishlistButton, { backgroundColor: theme.backgroundRoot }]}
          hitSlop={8}
        >
          <Feather
            name={isWishlisted ? "heart" : "heart"}
            size={18}
            color={isWishlisted ? theme.error : theme.textMuted}
            style={{ opacity: isWishlisted ? 1 : 0.6 }}
          />
        </Pressable>
      </View>
      <View style={styles.content}>
        <ThemedText type="caption" numberOfLines={2} style={styles.name}>
          {product.nameAr}
        </ThemedText>
        <View style={styles.ratingRow}>
          <Feather name="star" size={12} color={theme.rating} />
          <ThemedText type="small" style={{ color: theme.textMuted, marginLeft: 4 }}>
            {product.rating} ({product.reviewCount})
          </ThemedText>
        </View>
        <View style={styles.priceRow}>
          <ThemedText type="price">{product.price.toFixed(2)} KWD</ThemedText>
          {product.originalPrice ? (
            <ThemedText
              type="small"
              style={[styles.originalPrice, { color: theme.textMuted }]}
            >
              {product.originalPrice.toFixed(2)}
            </ThemedText>
          ) : null}
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: "hidden",
  },
  imageContainer: {
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  discountBadge: {
    position: "absolute",
    top: Spacing.sm,
    left: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  discountText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  wishlistButton: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: Spacing.md,
  },
  name: {
    marginBottom: Spacing.xs,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  originalPrice: {
    textDecorationLine: "line-through",
  },
});
