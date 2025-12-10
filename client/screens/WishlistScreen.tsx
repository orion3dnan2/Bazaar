import React from "react";
import { View, StyleSheet, FlatList, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { products } from "@/data/mockData";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useAppStore } from "@/store";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function WishlistScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const wishlist = useAppStore((state) => state.wishlist);

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={wishlistProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => navigation.navigate("ProductDetail", { product: item })}
            style={styles.productCard}
          />
        )}
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.xl,
          paddingHorizontal: Spacing.lg,
          paddingBottom: tabBarHeight + Spacing.xl,
          gap: Spacing.md,
          flexGrow: 1,
        }}
        columnWrapperStyle={wishlistProducts.length > 1 ? { gap: Spacing.md } : undefined}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <ThemedText type="h1" style={styles.title}>
            Wishlist
          </ThemedText>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="heart" size={64} color={theme.textMuted} />
            <ThemedText
              type="h3"
              style={[styles.emptyTitle, { color: theme.textMuted }]}
            >
              Your wishlist is empty
            </ThemedText>
            <ThemedText
              type="body"
              style={[styles.emptyText, { color: theme.textMuted }]}
            >
              Save items you love by tapping the heart icon
            </ThemedText>
            <Button
              onPress={() => navigation.navigate("Main", { screen: "HomeTab" } as any)}
              style={styles.browseButton}
            >
              Browse Products
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
  title: {
    marginBottom: Spacing.xl,
  },
  productCard: {
    width: (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.md) / 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
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
});
