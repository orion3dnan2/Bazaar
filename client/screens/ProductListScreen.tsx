import React, { useMemo } from "react";
import { View, StyleSheet, FlatList, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { ProductCard } from "@/components/ProductCard";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { products } from "@/data/mockData";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type RouteProps = RouteProp<RootStackParamList, "ProductList">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ProductListScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { category } = route.params;

  const categoryProducts = useMemo(() => {
    return products.filter((p) => p.categoryId === category.id);
  }, [category.id]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: category.nameAr,
    });
  }, [navigation, category]);

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={categoryProducts}
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
          paddingTop: headerHeight + Spacing.lg,
          paddingHorizontal: Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl,
          gap: Spacing.md,
        }}
        columnWrapperStyle={categoryProducts.length > 1 ? { gap: Spacing.md } : undefined}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <ThemedText type="caption" style={{ color: theme.textMuted, marginBottom: Spacing.md }}>
            {categoryProducts.length} products
          </ThemedText>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText type="body" style={{ color: theme.textMuted }}>
              No products in this category yet
            </ThemedText>
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
  productCard: {
    width: (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.md) / 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
});
