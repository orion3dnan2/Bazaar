# Sudanese Bazaar - Mobile Marketplace App

## Overview
A complete Sudanese Marketplace mobile application (Amazon-style) targeting the Sudanese community in the Gulf region. Built with React Native/Expo for cross-platform mobile development.

## Project Goals
- Connect Sudanese sellers in the Gulf with customers seeking authentic Sudanese products
- Support bilingual content (Arabic RTL and English)
- Provide a beautiful, native mobile experience with iOS 26 liquid glass design

## Current State
**Phase: Customer Mobile App - Frontend Complete**

The customer mobile app frontend is fully implemented with:
- 5-tab navigation (Home, Categories, Search, Wishlist, Profile)
- Complete shopping flow (Product Detail → Cart → Checkout → Order Confirmation)
- Order tracking and management
- User authentication (Login/Register)
- Address management for delivery

## Tech Stack
- **Frontend**: React Native with Expo SDK 54
- **State Management**: Zustand
- **Navigation**: React Navigation 7+
- **Server**: Express.js with TypeScript
- **Database**: PostgreSQL (ready for backend integration)
- **ORM**: Drizzle (configured)

## Project Structure
```
client/
├── components/          # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── CategoryCard.tsx
│   ├── CategoryListItem.tsx
│   ├── HeaderTitle.tsx
│   ├── ProductCard.tsx
│   ├── ThemedText.tsx
│   └── ThemedView.tsx
├── constants/
│   └── theme.ts         # Sudanese color palette & design tokens
├── data/
│   └── mockData.ts      # Sample Sudanese products & categories
├── hooks/
│   └── useTheme.ts
├── navigation/
│   ├── MainTabNavigator.tsx
│   └── RootStackNavigator.tsx
├── screens/
│   ├── HomeScreen.tsx
│   ├── CategoriesScreen.tsx
│   ├── SearchScreen.tsx
│   ├── WishlistScreen.tsx
│   ├── ProfileScreen.tsx
│   ├── ProductDetailScreen.tsx
│   ├── ProductListScreen.tsx
│   ├── CartScreen.tsx
│   ├── CheckoutScreen.tsx
│   ├── OrderConfirmationScreen.tsx
│   ├── OrderTrackingScreen.tsx
│   ├── OrdersScreen.tsx
│   ├── AddressScreen.tsx
│   ├── LoginScreen.tsx
│   └── RegisterScreen.tsx
└── store/
    └── index.ts         # Zustand store with cart, wishlist, orders
```

## Design System
- **Primary Color**: Gold (#D4AF37) - Sudanese gold theme
- **Secondary Color**: Green (#007A3D) - Sudanese flag green
- **Accent**: Deep Red (#8B0000)
- **Typography**: System fonts with Arabic support
- **Design Style**: iOS 26 liquid glass interface

## Key Features
1. **Home Screen**: Banner carousel, categories, featured/popular products
2. **Categories**: Grid view with Arabic names for Sudanese products
3. **Search**: Full-text search with category filters
4. **Product Detail**: Images, variants (size/color), quantity, add to cart
5. **Cart**: Item management, quantity controls, total calculation
6. **Checkout**: Address selection, payment (Cash on Delivery), order summary
7. **Order Tracking**: Visual step-by-step status tracking
8. **Profile**: User info, orders, wishlist, saved addresses

## Recent Changes
- December 2024: Complete frontend implementation with all screens
- Zustand store for cart, wishlist, orders, and user state
- Mock data with authentic Sudanese products and Kuwait delivery areas

## Next Steps (Backend Development)
1. Set up Drizzle schema for products, categories, users, orders
2. Implement API endpoints for product catalog
3. Add user authentication with sessions
4. Integrate cart and order management
5. Connect frontend to real API

## User Preferences
- Sudanese-themed design with gold/green colors
- Arabic as primary language with English support
- Kuwait as primary delivery region
- Cash on Delivery as initial payment method
