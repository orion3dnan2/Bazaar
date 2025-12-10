import React, { useRef, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  Pressable,
  Dimensions,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  useAnimatedScrollHandler,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ProductCard } from "@/components/ProductCard";
import { CategoryCard } from "@/components/CategoryCard";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useTheme } from "@/hooks/useTheme";
import { useProducts, useCategories } from "@/hooks/useProducts";
import { Spacing, BorderRadius, Typography } from "@/constants/theme";
import { banners } from "@/data/mockData";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useAppStore } from "@/store";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BANNER_WIDTH = SCREEN_WIDTH - Spacing.lg * 2;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const scrollX = useSharedValue(0);
  const [refreshing, setRefreshing] = useState(false);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const bannerRef = useRef<FlatList>(null);
  const cart = useAppStore((state) => state.cart);
  const getCartItemCount = useAppStore((state) => state.getCartItemCount);

  const { products, loading: productsLoading, refetch: refetchProducts } = useProducts();
  const { categories, loading: categoriesLoading, refetch: refetchCategories } = useCategories();

  const featuredProducts = products.slice(0, 4);
  const popularProducts = products.slice(2, 6);
  const newArrivals = products.slice(4, 8);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (activeBannerIndex + 1) % banners.length;
      bannerRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setActiveBannerIndex(nextIndex);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeBannerIndex]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchProducts(), refetchCategories()]);
    setRefreshing(false);
  };

  const renderBanner = ({ item, index }: { item: typeof banners[0]; index: number }) => (
    <View
      style={[
        styles.bannerCard,
        { backgroundColor: item.color, width: BANNER_WIDTH },
      ]}
    >
      <ThemedText type="h2" style={styles.bannerTitle}>
        {item.titleAr}
      </ThemedText>
      <ThemedText type="caption" style={styles.bannerSubtitle}>
        {item.subtitleAr}
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.lg,
          paddingBottom: tabBarHeight + Spacing.xl,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <HeaderTitle title="Sudanese Bazaar" />
          <View style={styles.headerRight}>
            <Pressable
              style={styles.iconButton}
              onPress={() => navigation.navigate("Cart")}
            >
              <Feather name="shopping-cart" size={24} color={theme.text} />
              {getCartItemCount() > 0 ? (
                <View style={[styles.cartBadge, { backgroundColor: theme.primary }]}>
                  <ThemedText type="small" style={styles.cartBadgeText}>
                    {getCartItemCount()}
                  </ThemedText>
                </View>
              ) : null}
            </Pressable>
          </View>
        </View>

        <Pressable
          style={[styles.searchBar, { backgroundColor: theme.backgroundSecondary }]}
          onPress={() => navigation.navigate("Main", { screen: "SearchTab" } as any)}
        >
          <Feather name="search" size={20} color={theme.textMuted} />
          <ThemedText type="body" style={{ color: theme.textMuted, marginLeft: Spacing.sm }}>
            Search products...
          </ThemedText>
        </Pressable>

        <View style={styles.bannerContainer}>
          <FlatList
            ref={bannerRef}
            data={banners}
            renderItem={renderBanner}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            snapToInterval={BANNER_WIDTH + Spacing.md}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: Spacing.lg }}
            ItemSeparatorComponent={() => <View style={{ width: Spacing.md }} />}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / (BANNER_WIDTH + Spacing.md));
              setActiveBannerIndex(index);
            }}
          />
          <View style={styles.bannerDots}>
            {banners.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      index === activeBannerIndex ? theme.primary : theme.textMuted,
                    opacity: index === activeBannerIndex ? 1 : 0.3,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="h2">Categories</ThemedText>
            <Pressable onPress={() => navigation.navigate("Main", { screen: "CategoriesTab" } as any)}>
              <ThemedText type="link">View All</ThemedText>
            </Pressable>
          </View>
          <FlatList
            data={categories.slice(0, 6)}
            renderItem={({ item }) => (
              <CategoryCard
                category={item}
                onPress={() => navigation.navigate("ProductList", { category: item })}
              />
            )}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: Spacing.lg }}
            ItemSeparatorComponent={() => <View style={{ width: Spacing.md }} />}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="h2">Featured Products</ThemedText>
          </View>
          <FlatList
            data={featuredProducts}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                onPress={() => navigation.navigate("ProductDetail", { product: item })}
                style={{ width: 160 }}
              />
            )}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: Spacing.lg }}
            ItemSeparatorComponent={() => <View style={{ width: Spacing.md }} />}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="h2">Popular Items</ThemedText>
          </View>
          <View style={styles.productGrid}>
            {popularProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onPress={() => navigation.navigate("ProductDetail", { product })}
                style={styles.gridItem}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="h2">New Arrivals</ThemedText>
          </View>
          <FlatList
            data={newArrivals}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                onPress={() => navigation.navigate("ProductDetail", { product: item })}
                style={{ width: 160 }}
              />
            )}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: Spacing.lg }}
            ItemSeparatorComponent={() => <View style={{ width: Spacing.md }} />}
          />
        </View>
      </ScrollView>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  iconButton: {
    padding: Spacing.xs,
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  bannerContainer: {
    marginBottom: Spacing.xl,
  },
  bannerCard: {
    height: 140,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    justifyContent: "center",
  },
  bannerTitle: {
    color: "#FFFFFF",
    marginBottom: Spacing.xs,
  },
  bannerSubtitle: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  bannerDots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  gridItem: {
    width: (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.md) / 2,
  },
});
