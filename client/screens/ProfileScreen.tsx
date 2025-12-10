import React from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useAppStore } from "@/store";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface MenuItemProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  showBadge?: boolean;
  badgeCount?: number;
}

function MenuItem({ icon, label, onPress, showBadge, badgeCount }: MenuItemProps) {
  const { theme } = useTheme();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.menuItem,
        { backgroundColor: pressed ? theme.backgroundSecondary : theme.backgroundDefault },
      ]}
    >
      <View style={styles.menuItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: theme.backgroundTertiary }]}>
          <Feather name={icon} size={20} color={theme.primary} />
        </View>
        <ThemedText type="body">{label}</ThemedText>
      </View>
      <View style={styles.menuItemRight}>
        {showBadge && badgeCount && badgeCount > 0 ? (
          <View style={[styles.badge, { backgroundColor: theme.primary }]}>
            <ThemedText type="small" style={styles.badgeText}>
              {badgeCount}
            </ThemedText>
          </View>
        ) : null}
        <Feather name="chevron-right" size={20} color={theme.textMuted} />
      </View>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { user, orders, wishlist, setUser } = useAppStore();

  const handleLogout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setUser(null);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl,
          paddingHorizontal: Spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="h1" style={styles.title}>
          Profile
        </ThemedText>

        <View style={[styles.profileCard, { backgroundColor: theme.backgroundDefault }]}>
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <Feather name="user" size={32} color="#FFFFFF" />
          </View>
          {user ? (
            <View style={styles.profileInfo}>
              <ThemedText type="h3">{user.name}</ThemedText>
              <ThemedText type="caption" style={{ color: theme.textMuted }}>
                {user.email}
              </ThemedText>
            </View>
          ) : (
            <View style={styles.profileInfo}>
              <ThemedText type="h3">Guest User</ThemedText>
              <Pressable onPress={() => navigation.navigate("Login")}>
                <ThemedText type="link">Sign in to your account</ThemedText>
              </Pressable>
            </View>
          )}
        </View>

        <View style={styles.menuSection}>
          <ThemedText type="caption" style={[styles.sectionTitle, { color: theme.textMuted }]}>
            Orders
          </ThemedText>
          <View style={[styles.menuGroup, { backgroundColor: theme.backgroundDefault }]}>
            <MenuItem
              icon="package"
              label="My Orders"
              onPress={() => navigation.navigate("Orders")}
              showBadge
              badgeCount={orders.length}
            />
          </View>
        </View>

        <View style={styles.menuSection}>
          <ThemedText type="caption" style={[styles.sectionTitle, { color: theme.textMuted }]}>
            Account
          </ThemedText>
          <View style={[styles.menuGroup, { backgroundColor: theme.backgroundDefault }]}>
            <MenuItem
              icon="heart"
              label="Wishlist"
              onPress={() => navigation.navigate("Main", { screen: "WishlistTab" } as any)}
              showBadge
              badgeCount={wishlist.length}
            />
            <View style={[styles.separator, { backgroundColor: theme.border }]} />
            <MenuItem
              icon="map-pin"
              label="Saved Addresses"
              onPress={() => navigation.navigate("Address", { mode: "add" })}
            />
            <View style={[styles.separator, { backgroundColor: theme.border }]} />
            <MenuItem
              icon="shopping-cart"
              label="Cart"
              onPress={() => navigation.navigate("Cart")}
            />
          </View>
        </View>

        <View style={styles.menuSection}>
          <ThemedText type="caption" style={[styles.sectionTitle, { color: theme.textMuted }]}>
            Settings
          </ThemedText>
          <View style={[styles.menuGroup, { backgroundColor: theme.backgroundDefault }]}>
            <MenuItem
              icon="globe"
              label="Language"
              onPress={() => {}}
            />
            <View style={[styles.separator, { backgroundColor: theme.border }]} />
            <MenuItem
              icon="help-circle"
              label="Help & Support"
              onPress={() => {}}
            />
          </View>
        </View>

        {user ? (
          <Button
            onPress={handleLogout}
            style={[styles.logoutButton, { backgroundColor: theme.error }]}
          >
            Logout
          </Button>
        ) : (
          <Button
            onPress={() => navigation.navigate("Login")}
            style={styles.loginButton}
          >
            Sign In
          </Button>
        )}
      </ScrollView>
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
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    marginLeft: Spacing.lg,
    flex: 1,
  },
  menuSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  menuGroup: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  separator: {
    height: 1,
    marginLeft: 68,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    minWidth: 20,
    alignItems: "center",
  },
  badgeText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  logoutButton: {
    marginTop: Spacing.lg,
  },
  loginButton: {
    marginTop: Spacing.lg,
  },
});
