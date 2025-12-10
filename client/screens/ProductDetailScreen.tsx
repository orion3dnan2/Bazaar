import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useAppStore } from "@/store";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type RouteProps = RouteProp<RootStackParamList, "ProductDetail">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ProductDetailScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { product } = route.params;
  
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.variants?.sizes?.[0]
  );
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product.variants?.colors?.[0]?.name
  );
  
  const { addToCart, toggleWishlist, isInWishlist } = useAppStore();
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addToCart({
      product,
      quantity,
      selectedSize,
      selectedColor,
    });
    navigation.navigate("Cart");
  };

  const handleWishlistToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleWishlist(product.id);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.imageContainer, { backgroundColor: theme.backgroundSecondary }]}>
          <Feather name="package" size={80} color={theme.textMuted} />
          {discount > 0 ? (
            <View style={[styles.discountBadge, { backgroundColor: theme.error }]}>
              <ThemedText type="body" style={styles.discountText}>
                -{discount}%
              </ThemedText>
            </View>
          ) : null}
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <ThemedText type="h1" style={styles.title}>
              {product.nameAr}
            </ThemedText>
            <Pressable onPress={handleWishlistToggle} hitSlop={8}>
              <Feather
                name="heart"
                size={28}
                color={isWishlisted ? theme.error : theme.textMuted}
                style={{ opacity: isWishlisted ? 1 : 0.6 }}
              />
            </Pressable>
          </View>

          <ThemedText type="caption" style={{ color: theme.textMuted, marginBottom: Spacing.md }}>
            {product.name}
          </ThemedText>

          <View style={styles.ratingRow}>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Feather
                  key={star}
                  name="star"
                  size={16}
                  color={star <= Math.floor(product.rating) ? theme.rating : theme.textMuted}
                />
              ))}
            </View>
            <ThemedText type="caption" style={{ color: theme.textMuted }}>
              {product.rating} ({product.reviewCount} reviews)
            </ThemedText>
          </View>

          <View style={styles.priceRow}>
            <ThemedText type="hero" style={{ color: theme.price }}>
              {product.price.toFixed(2)} KWD
            </ThemedText>
            {product.originalPrice ? (
              <ThemedText
                type="h3"
                style={[styles.originalPrice, { color: theme.textMuted }]}
              >
                {product.originalPrice.toFixed(2)} KWD
              </ThemedText>
            ) : null}
          </View>

          <View style={[styles.sellerCard, { backgroundColor: theme.backgroundDefault }]}>
            <View style={[styles.sellerAvatar, { backgroundColor: theme.primary }]}>
              <Feather name="shopping-bag" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.sellerInfo}>
              <ThemedText type="body" style={{ fontWeight: "600" }}>
                {product.sellerName}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textMuted }}>
                Verified Seller
              </ThemedText>
            </View>
          </View>

          {product.variants?.sizes ? (
            <View style={styles.variantSection}>
              <ThemedText type="h3" style={styles.sectionTitle}>
                Size
              </ThemedText>
              <View style={styles.variantRow}>
                {product.variants.sizes.map((size) => (
                  <Pressable
                    key={size}
                    onPress={() => setSelectedSize(size)}
                    style={[
                      styles.variantChip,
                      {
                        backgroundColor:
                          selectedSize === size ? theme.primary : theme.backgroundSecondary,
                        borderColor:
                          selectedSize === size ? theme.primary : theme.border,
                      },
                    ]}
                  >
                    <ThemedText
                      type="body"
                      style={{
                        color: selectedSize === size ? "#FFFFFF" : theme.text,
                      }}
                    >
                      {size}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          {product.variants?.colors ? (
            <View style={styles.variantSection}>
              <ThemedText type="h3" style={styles.sectionTitle}>
                Color
              </ThemedText>
              <View style={styles.variantRow}>
                {product.variants.colors.map((color) => (
                  <Pressable
                    key={color.name}
                    onPress={() => setSelectedColor(color.name)}
                    style={[
                      styles.colorChip,
                      {
                        borderColor:
                          selectedColor === color.name ? theme.primary : theme.border,
                        borderWidth: selectedColor === color.name ? 2 : 1,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.colorSwatch,
                        { backgroundColor: color.value },
                      ]}
                    />
                    <ThemedText type="small">{color.name}</ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.quantitySection}>
            <ThemedText type="h3" style={styles.sectionTitle}>
              Quantity
            </ThemedText>
            <View style={styles.quantityRow}>
              <Pressable
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                style={[styles.quantityButton, { backgroundColor: theme.backgroundSecondary }]}
              >
                <Feather name="minus" size={20} color={theme.text} />
              </Pressable>
              <ThemedText type="h3" style={styles.quantityText}>
                {quantity}
              </ThemedText>
              <Pressable
                onPress={() => setQuantity(quantity + 1)}
                style={[styles.quantityButton, { backgroundColor: theme.backgroundSecondary }]}
              >
                <Feather name="plus" size={20} color={theme.text} />
              </Pressable>
            </View>
          </View>

          <View style={styles.descriptionSection}>
            <ThemedText type="h3" style={styles.sectionTitle}>
              Description
            </ThemedText>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              {product.descriptionAr}
            </ThemedText>
            <ThemedText
              type="caption"
              style={{ color: theme.textMuted, marginTop: Spacing.sm }}
            >
              {product.description}
            </ThemedText>
          </View>
        </View>
      </ScrollView>

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
        <View style={styles.totalContainer}>
          <ThemedText type="caption" style={{ color: theme.textMuted }}>
            Total
          </ThemedText>
          <ThemedText type="h2" style={{ color: theme.price }}>
            {(product.price * quantity).toFixed(2)} KWD
          </ThemedText>
        </View>
        <Button onPress={handleAddToCart} style={styles.addToCartButton}>
          Add to Cart
        </Button>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  discountBadge: {
    position: "absolute",
    top: Spacing.xl,
    left: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  discountText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  content: {
    padding: Spacing.lg,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    flex: 1,
    marginRight: Spacing.md,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  stars: {
    flexDirection: "row",
    gap: 2,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  originalPrice: {
    textDecorationLine: "line-through",
  },
  sellerCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  sellerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  sellerInfo: {
    marginLeft: Spacing.md,
  },
  variantSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  variantRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  variantChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  colorChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
  },
  colorSwatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  quantitySection: {
    marginBottom: Spacing.xl,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    minWidth: 40,
    textAlign: "center",
  },
  descriptionSection: {
    marginBottom: Spacing.xl,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  totalContainer: {},
  addToCartButton: {
    flex: 1,
    marginLeft: Spacing.lg,
  },
});
