import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  password: text("password").notNull(),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  icon: text("icon").notNull(),
  image: text("image"),
  productCount: integer("product_count").default(0),
});

export const products = pgTable("products", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  description: text("description").notNull(),
  descriptionAr: text("description_ar").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  images: jsonb("images").$type<string[]>().default([]),
  categoryId: varchar("category_id").references(() => categories.id),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0"),
  reviewCount: integer("review_count").default(0),
  variants: jsonb("variants").$type<{
    sizes?: string[];
    colors?: { name: string; value: string }[];
  }>(),
  inStock: boolean("in_stock").default(true),
  sellerId: varchar("seller_id"),
  sellerName: text("seller_name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const addresses = pgTable("addresses", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  label: text("label").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  area: text("area").notNull(),
  block: text("block").notNull(),
  street: text("street").notNull(),
  building: text("building").notNull(),
  floor: text("floor"),
  apartment: text("apartment"),
  notes: text("notes"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  items: jsonb("items").$type<{
    productId: string;
    productName: string;
    productNameAr: string;
    price: number;
    quantity: number;
    selectedSize?: string;
    selectedColor?: string;
    image?: string;
  }[]>().notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  deliveryFee: decimal("delivery_fee", { precision: 10, scale: 2 }).default("2"),
  status: text("status").$type<"pending" | "confirmed" | "out_for_delivery" | "delivered">().default("pending"),
  addressId: varchar("address_id").references(() => addresses.id),
  addressSnapshot: jsonb("address_snapshot").$type<{
    label: string;
    fullName: string;
    phone: string;
    area: string;
    block: string;
    street: string;
    building: string;
  }>(),
  estimatedDelivery: timestamp("estimated_delivery"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const wishlist = pgTable("wishlist", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  productId: varchar("product_id").references(() => products.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cartItems = pgTable("cart_items", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  productId: varchar("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").default(1),
  selectedSize: text("selected_size"),
  selectedColor: text("selected_color"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  addresses: many(addresses),
  orders: many(orders),
  wishlist: many(wishlist),
  cartItems: many(cartItems),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  name: true,
  email: true,
  phone: true,
  password: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertAddressSchema = createInsertSchema(addresses).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Address = typeof addresses.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type WishlistItem = typeof wishlist.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;
