# Design Guidelines - Sudanese Bazaar Marketplace

## Authentication Architecture
**Auth Required**: Multi-role authentication system
- **Customer Login/Registration**: Email or phone number with OTP verification
- **Seller Login**: Separate seller accounts with approval workflow
- **Admin Login**: Admin dashboard access with elevated permissions
- Include Apple Sign-In for iOS and Google Sign-In for cross-platform
- Account screen must include:
  - Profile avatar (user-customizable)
  - Display name and contact information
  - Saved addresses management
  - Order history
  - Wishlist access
  - Language preference toggle (Arabic/English)
  - Theme preference (Dark/Light mode)
  - Logout with confirmation
  - Delete account (Settings > Account > Delete with double confirmation)

## Navigation Architecture
**Tab Navigation** (5 tabs with center action):
1. **Home** (الرئيسية) - Featured products, banners, categories
2. **Categories** (الأقسام) - Browse by product categories
3. **Search** (بحث) - Center tab with floating action button
4. **Wishlist** (المفضلة) - Saved products
5. **Profile** (حسابي) - User account and settings

**Additional Stack Navigation**:
- Product Detail screens
- Cart & Checkout flow
- Order Tracking screens
- Address Management
- Settings screens

## Screen Specifications

### 1. Home Screen (الرئيسية)
- **Layout**: Scrollable feed with top safe area inset = insets.top + Spacing.xl
- **Header**: Transparent with app logo (left for LTR, right for RTL) and notification bell icon
- **Components**:
  - Search bar (tappable, navigates to Search screen)
  - Horizontal scrolling banners/promotions (auto-play carousel)
  - Category grid (2 columns) with icon + label
  - "Featured Products" section with horizontal scroll
  - "Popular Items" grid (2 columns)
  - "New Arrivals" horizontal scroll
- **Bottom Inset**: tabBarHeight + Spacing.xl
- **Pull-to-refresh**: Enable with Sudanese green accent color

### 2. Categories Screen (الأقسام)
- **Layout**: Scrollable list
- **Header**: Default navigation header with title "Categories"
- **Components**:
  - Main categories list with custom cards
  - Each card shows category image, name (Arabic + English), item count
  - Tappable cards navigate to filtered product list
- **Safe Area**: Top = headerHeight + Spacing.xl, Bottom = tabBarHeight + Spacing.xl

### 3. Product List/Search Screen
- **Layout**: Scrollable list with floating filter button
- **Header**: Custom with search bar and filter icon (right/left based on direction)
- **Components**:
  - Active filters chips (dismissible)
  - Product grid (2 columns)
  - Each product card: image, name, price (KWD), rating stars, wishlist heart icon
  - Floating "Filter & Sort" button (bottom right for LTR, bottom left for RTL)
- **Filter Sheet**: Native modal with categories, price range slider, rating filter, sort options
- **Safe Area**: Floating button has bottom inset = tabBarHeight + Spacing.xl

### 4. Product Detail Screen
- **Layout**: Scrollable with transparent header
- **Header**: Transparent with back button and share icon, wishlist heart icon
- **Components**:
  - Image gallery (horizontal scroll with pagination dots)
  - Product title (Arabic primary, English secondary)
  - Price in KWD (large, bold with Sudanese gold accent)
  - Rating and review count
  - Size/Color variant selector (horizontal pills)
  - Quantity stepper
  - Description section (expandable)
  - Reviews section (shows 2, "View All" link)
  - Related products horizontal scroll
- **Bottom**: Sticky "Add to Cart" button with subtle shadow
- **Safe Area**: Top = insets.top + Spacing.xl, Bottom for button = insets.bottom + Spacing.xl

### 5. Shopping Cart Screen
- **Layout**: Scrollable form
- **Header**: Default with title "Shopping Cart"
- **Components**:
  - Cart items list (swipe-to-delete)
  - Each item: thumbnail, name, variant, quantity stepper, price, remove icon
  - Price summary card: Subtotal, Delivery fee, Total
  - "Proceed to Checkout" button below summary
- **Safe Area**: Standard with tab bar inset

### 6. Checkout Screen
- **Layout**: Scrollable form in stack navigation (no tabs)
- **Header**: Default with "Checkout" title and close button
- **Components**:
  - Delivery address selector (tappable to add/edit)
  - Payment method selector (Cash on Delivery selected by default)
  - Order summary (collapsible)
  - "Place Order" button at bottom
- **Submit Button**: Below form content
- **Safe Area**: Top = headerHeight + Spacing.xl, Bottom = insets.bottom + Spacing.xl

### 7. Order Tracking Screen
- **Layout**: Scrollable
- **Header**: Default with "Order #XXX" title
- **Components**:
  - Order status stepper (Pending → Confirmed → Out for Delivery → Delivered)
  - Estimated delivery date card
  - Delivery address display
  - Order items list (non-editable)
  - Total amount paid
  - Contact support button
- **Safe Area**: Standard with bottom inset

### 8. Profile Screen
- **Layout**: Scrollable list
- **Header**: Custom with user avatar and name
- **Components**:
  - Profile header card (avatar, name, email/phone)
  - Menu items list:
    - My Orders
    - Saved Addresses
    - Wishlist
    - Language (Arabic/English toggle)
    - Dark/Light Mode
    - Settings
    - Help & Support
    - Logout
- **Safe Area**: Top = insets.top + Spacing.xl, Bottom = tabBarHeight + Spacing.xl

## Visual Design System

### Color Palette (Sudanese-Inspired)
**Primary Colors**:
- Sudanese Gold: `#D4AF37` (primary actions, accents)
- Sudanese Green: `#007A3D` (success states, secondary actions)
- Pure White: `#FFFFFF` (backgrounds, cards)
- Deep Black: `#1A1A1A` (primary text)

**Semantic Colors**:
- Success: Sudanese Green `#007A3D`
- Error: `#DC2626`
- Warning: `#F59E0B`
- Info: `#3B82F6`

**Neutral Palette**:
- Gray 50: `#F9FAFB` (backgrounds)
- Gray 100: `#F3F4F6` (disabled states)
- Gray 400: `#9CA3AF` (secondary text)
- Gray 700: `#374151` (body text)
- Gray 900: `#111827` (headings)

**Dark Mode**:
- Background: `#121212`
- Surface: `#1E1E1E`
- Gold accent adjusted to `#FFD700` for better contrast

### Typography (RTL-Aware)
**Arabic Font**: Tajawal or Cairo (system default: SF Arabic)
**English Font**: System default (SF Pro for iOS, Roboto for Android)

**Scale**:
- Hero: 32px, Bold (Product titles, headings)
- H1: 24px, Bold (Screen titles)
- H2: 20px, SemiBold (Section headers)
- H3: 18px, SemiBold (Card titles)
- Body: 16px, Regular (Main content)
- Caption: 14px, Regular (Metadata, labels)
- Small: 12px, Regular (Helper text)

**Price Typography**: Use Bold weight with Gold color for emphasis

### Component Design

**Product Cards**:
- Rounded corners: 12px
- Border: 1px solid Gray 100
- Padding: Spacing.md
- Aspect ratio 1:1 for product image
- Price in Gold color, 18px Bold
- Wishlist heart: Top right corner (LTR) or top left (RTL)
- Pressed state: Scale 0.98, subtle border color change

**Buttons**:
- Primary (Gold): Background `#D4AF37`, White text, Bold, rounded 8px
- Secondary (Green): Background `#007A3D`, White text, rounded 8px
- Outline: Border Gold, Gold text, transparent background
- Text: Gold text only, no background
- Height: 48px minimum for touch targets
- Pressed state: Opacity 0.8

**Input Fields**:
- Border: 1px solid Gray 300, rounded 8px
- Focus: Border Gold with 2px width
- Error: Border Red with error message below
- Height: 48px
- Padding: Spacing.md
- RTL-aware text alignment

**Cards**:
- Background: White (Light mode), Surface (Dark mode)
- Border radius: 12px
- Shadow: None for most cards (clean, flat design)
- Padding: Spacing.lg
- Separator lines: Gray 100, 1px

**Floating Action Button (Search)**:
- Circle button with Gold background
- White search icon (Feather: search)
- Size: 56px diameter
- Shadow specifications:
  - shadowOffset: {width: 0, height: 2}
  - shadowOpacity: 0.10
  - shadowRadius: 2
- Positioned center of tab bar

### Required Assets

**Category Icons** (8 preset categories):
1. Spices & Herbs icon
2. Traditional Clothing icon
3. Food & Groceries icon
4. Home Decor icon
5. Beauty & Personal Care icon
6. Electronics icon
7. Handicrafts icon
8. Kids & Toys icon

**Profile Avatars** (5 preset options):
- Culturally appropriate abstract patterns
- Gold and Green color combinations
- Geometric Islamic art-inspired designs
- Gender-neutral options

**App Logo**: Sudanese Bazaar logo with traditional market motif

**Placeholder Images**: For products without images (use Gold/Green pattern)

### Interaction Design

**Touch Feedback**:
- All buttons: Opacity change to 0.8 when pressed
- Product cards: Scale to 0.98 with spring animation
- List items: Subtle gray background flash
- Swipe gestures: Visual drag indicator for cart item removal

**Loading States**:
- Skeleton loaders for product grids (Gray 100 animated shimmer)
- Spinner for full-screen loads (Gold color)
- Pull-to-refresh: Gold activity indicator

**Animations**:
- Screen transitions: Smooth slide (300ms)
- Tab changes: Fade (200ms)
- Modal presentation: Slide up with backdrop fade
- Product image gallery: Horizontal swipe with momentum
- Add to cart: Brief scale pulse on cart icon

**Empty States**:
- Friendly Arabic/English messages
- Relevant Feather icon (shopping-bag, heart, search)
- Call-to-action button where appropriate

### Accessibility Requirements

**RTL Support**:
- Full interface mirroring for Arabic
- Text alignment: Right for Arabic, Left for English
- Navigation flows: Right-to-left for Arabic
- Icons that imply direction must flip

**Touch Targets**: Minimum 44x44px (iOS HIG compliance)

**Color Contrast**: WCAG AA compliant (4.5:1 for text)

**Screen Reader**: Meaningful labels for all interactive elements in both languages

**Dynamic Type**: Support iOS text size adjustments

**Haptic Feedback**: Light impact for button taps, medium for important actions