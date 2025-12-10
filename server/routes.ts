import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import { db } from "./db";
import { 
  users, categories, products, addresses, orders, wishlist, cartItems, sessions,
  insertUserSchema, loginSchema, insertAddressSchema
} from "@shared/schema";
import { eq, and, like, or, desc } from "drizzle-orm";
import { seedDatabase } from "./seed";
import crypto from "crypto";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

async function authenticateRequest(req: Request): Promise<string | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  
  const token = authHeader.substring(7);
  const session = await db.select().from(sessions).where(eq(sessions.token, token)).limit(1);
  
  if (session.length === 0) return null;
  if (new Date(session[0].expiresAt) < new Date()) {
    await db.delete(sessions).where(eq(sessions.token, token));
    return null;
  }
  
  return session[0].userId;
}

export async function registerRoutes(app: Express): Promise<Server> {
  await seedDatabase();

  app.get("/api/categories", async (_req: Request, res: Response) => {
    try {
      const allCategories = await db.select().from(categories);
      res.json(allCategories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/:id", async (req: Request, res: Response) => {
    try {
      const category = await db.select().from(categories).where(eq(categories.id, req.params.id)).limit(1);
      if (category.length === 0) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch category" });
    }
  });

  app.get("/api/products", async (req: Request, res: Response) => {
    try {
      const { categoryId, search, featured, limit } = req.query;
      
      let query = db.select().from(products);
      
      if (categoryId) {
        query = query.where(eq(products.categoryId, categoryId as string)) as any;
      }
      
      if (search) {
        const searchTerm = `%${search}%`;
        query = query.where(
          or(
            like(products.name, searchTerm),
            like(products.nameAr, searchTerm),
            like(products.description, searchTerm)
          )
        ) as any;
      }
      
      if (limit) {
        query = query.limit(parseInt(limit as string)) as any;
      }
      
      const allProducts = await query;
      res.json(allProducts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req: Request, res: Response) => {
    try {
      const product = await db.select().from(products).where(eq(products.id, req.params.id)).limit(1);
      if (product.length === 0) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const validation = insertUserSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
      }
      
      const { name, email, phone, password } = validation.data;
      
      const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (existingUser.length > 0) {
        return res.status(400).json({ error: "البريد الإلكتروني مستخدم بالفعل" });
      }
      
      const hashedPassword = hashPassword(password);
      const [newUser] = await db.insert(users).values({
        name,
        email,
        phone,
        password: hashedPassword,
      }).returning();
      
      const token = generateToken();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      
      await db.insert(sessions).values({
        userId: newUser.id,
        token,
        expiresAt,
      });
      
      res.json({
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
        },
        token,
      });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ error: "فشل في إنشاء الحساب" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
      }
      
      const { email, password } = validation.data;
      const hashedPassword = hashPassword(password);
      
      const user = await db.select().from(users)
        .where(and(eq(users.email, email), eq(users.password, hashedPassword)))
        .limit(1);
      
      if (user.length === 0) {
        return res.status(401).json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
      }
      
      const token = generateToken();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      
      await db.insert(sessions).values({
        userId: user[0].id,
        token,
        expiresAt,
      });
      
      res.json({
        user: {
          id: user[0].id,
          name: user[0].name,
          email: user[0].email,
          phone: user[0].phone,
        },
        token,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "فشل في تسجيل الدخول" });
    }
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      const userId = await authenticateRequest(req);
      if (!userId) {
        return res.status(401).json({ error: "غير مصرح" });
      }
      
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (user.length === 0) {
        return res.status(404).json({ error: "المستخدم غير موجود" });
      }
      
      res.json({
        id: user[0].id,
        name: user[0].name,
        email: user[0].email,
        phone: user[0].phone,
      });
    } catch (error) {
      res.status(500).json({ error: "فشل في جلب بيانات المستخدم" });
    }
  });

  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        await db.delete(sessions).where(eq(sessions.token, token));
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "فشل في تسجيل الخروج" });
    }
  });

  app.get("/api/addresses", async (req: Request, res: Response) => {
    try {
      const userId = await authenticateRequest(req);
      if (!userId) {
        return res.status(401).json({ error: "غير مصرح" });
      }
      
      const userAddresses = await db.select().from(addresses).where(eq(addresses.userId, userId));
      res.json(userAddresses);
    } catch (error) {
      res.status(500).json({ error: "فشل في جلب العناوين" });
    }
  });

  app.post("/api/addresses", async (req: Request, res: Response) => {
    try {
      const userId = await authenticateRequest(req);
      if (!userId) {
        return res.status(401).json({ error: "غير مصرح" });
      }
      
      const validation = insertAddressSchema.safeParse({ ...req.body, userId });
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
      }
      
      if (req.body.isDefault) {
        await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, userId));
      }
      
      const [newAddress] = await db.insert(addresses).values(validation.data).returning();
      res.json(newAddress);
    } catch (error) {
      res.status(500).json({ error: "فشل في إضافة العنوان" });
    }
  });

  app.delete("/api/addresses/:id", async (req: Request, res: Response) => {
    try {
      const userId = await authenticateRequest(req);
      if (!userId) {
        return res.status(401).json({ error: "غير مصرح" });
      }
      
      await db.delete(addresses).where(and(eq(addresses.id, req.params.id), eq(addresses.userId, userId)));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "فشل في حذف العنوان" });
    }
  });

  app.get("/api/wishlist", async (req: Request, res: Response) => {
    try {
      const userId = await authenticateRequest(req);
      if (!userId) {
        return res.status(401).json({ error: "غير مصرح" });
      }
      
      const userWishlist = await db.select({
        id: wishlist.id,
        productId: wishlist.productId,
        product: products,
      }).from(wishlist)
        .leftJoin(products, eq(wishlist.productId, products.id))
        .where(eq(wishlist.userId, userId));
      
      res.json(userWishlist);
    } catch (error) {
      res.status(500).json({ error: "فشل في جلب المفضلة" });
    }
  });

  app.post("/api/wishlist/:productId", async (req: Request, res: Response) => {
    try {
      const userId = await authenticateRequest(req);
      if (!userId) {
        return res.status(401).json({ error: "غير مصرح" });
      }
      
      const existing = await db.select().from(wishlist)
        .where(and(eq(wishlist.userId, userId), eq(wishlist.productId, req.params.productId)))
        .limit(1);
      
      if (existing.length > 0) {
        await db.delete(wishlist).where(eq(wishlist.id, existing[0].id));
        res.json({ added: false });
      } else {
        await db.insert(wishlist).values({
          userId,
          productId: req.params.productId,
        });
        res.json({ added: true });
      }
    } catch (error) {
      res.status(500).json({ error: "فشل في تحديث المفضلة" });
    }
  });

  app.get("/api/cart", async (req: Request, res: Response) => {
    try {
      const userId = await authenticateRequest(req);
      if (!userId) {
        return res.status(401).json({ error: "غير مصرح" });
      }
      
      const userCart = await db.select({
        id: cartItems.id,
        quantity: cartItems.quantity,
        selectedSize: cartItems.selectedSize,
        selectedColor: cartItems.selectedColor,
        product: products,
      }).from(cartItems)
        .leftJoin(products, eq(cartItems.productId, products.id))
        .where(eq(cartItems.userId, userId));
      
      res.json(userCart);
    } catch (error) {
      res.status(500).json({ error: "فشل في جلب السلة" });
    }
  });

  app.post("/api/cart", async (req: Request, res: Response) => {
    try {
      const userId = await authenticateRequest(req);
      if (!userId) {
        return res.status(401).json({ error: "غير مصرح" });
      }
      
      const { productId, quantity, selectedSize, selectedColor } = req.body;
      
      const existing = await db.select().from(cartItems)
        .where(and(
          eq(cartItems.userId, userId),
          eq(cartItems.productId, productId),
          selectedSize ? eq(cartItems.selectedSize, selectedSize) : undefined,
          selectedColor ? eq(cartItems.selectedColor, selectedColor) : undefined
        ))
        .limit(1);
      
      if (existing.length > 0) {
        await db.update(cartItems)
          .set({ quantity: (existing[0].quantity || 0) + quantity })
          .where(eq(cartItems.id, existing[0].id));
      } else {
        await db.insert(cartItems).values({
          userId,
          productId,
          quantity,
          selectedSize,
          selectedColor,
        });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "فشل في إضافة للسلة" });
    }
  });

  app.put("/api/cart/:id", async (req: Request, res: Response) => {
    try {
      const userId = await authenticateRequest(req);
      if (!userId) {
        return res.status(401).json({ error: "غير مصرح" });
      }
      
      const { quantity } = req.body;
      
      if (quantity <= 0) {
        await db.delete(cartItems).where(and(eq(cartItems.id, req.params.id), eq(cartItems.userId, userId)));
      } else {
        await db.update(cartItems).set({ quantity }).where(and(eq(cartItems.id, req.params.id), eq(cartItems.userId, userId)));
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "فشل في تحديث السلة" });
    }
  });

  app.delete("/api/cart/:id", async (req: Request, res: Response) => {
    try {
      const userId = await authenticateRequest(req);
      if (!userId) {
        return res.status(401).json({ error: "غير مصرح" });
      }
      
      await db.delete(cartItems).where(and(eq(cartItems.id, req.params.id), eq(cartItems.userId, userId)));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "فشل في حذف من السلة" });
    }
  });

  app.delete("/api/cart", async (req: Request, res: Response) => {
    try {
      const userId = await authenticateRequest(req);
      if (!userId) {
        return res.status(401).json({ error: "غير مصرح" });
      }
      
      await db.delete(cartItems).where(eq(cartItems.userId, userId));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "فشل في تفريغ السلة" });
    }
  });

  app.get("/api/orders", async (req: Request, res: Response) => {
    try {
      const userId = await authenticateRequest(req);
      if (!userId) {
        return res.status(401).json({ error: "غير مصرح" });
      }
      
      const userOrders = await db.select().from(orders)
        .where(eq(orders.userId, userId))
        .orderBy(desc(orders.createdAt));
      
      res.json(userOrders);
    } catch (error) {
      res.status(500).json({ error: "فشل في جلب الطلبات" });
    }
  });

  app.get("/api/orders/:id", async (req: Request, res: Response) => {
    try {
      const userId = await authenticateRequest(req);
      if (!userId) {
        return res.status(401).json({ error: "غير مصرح" });
      }
      
      const order = await db.select().from(orders)
        .where(and(eq(orders.id, req.params.id), eq(orders.userId, userId)))
        .limit(1);
      
      if (order.length === 0) {
        return res.status(404).json({ error: "الطلب غير موجود" });
      }
      
      res.json(order[0]);
    } catch (error) {
      res.status(500).json({ error: "فشل في جلب الطلب" });
    }
  });

  app.post("/api/orders", async (req: Request, res: Response) => {
    try {
      const userId = await authenticateRequest(req);
      if (!userId) {
        return res.status(401).json({ error: "غير مصرح" });
      }
      
      const { items, total, deliveryFee, addressId, addressSnapshot } = req.body;
      
      const estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      
      const [newOrder] = await db.insert(orders).values({
        userId,
        items,
        total,
        deliveryFee,
        addressId,
        addressSnapshot,
        status: "pending",
        estimatedDelivery,
      }).returning();
      
      await db.delete(cartItems).where(eq(cartItems.userId, userId));
      
      res.json(newOrder);
    } catch (error) {
      console.error("Order creation error:", error);
      res.status(500).json({ error: "فشل في إنشاء الطلب" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
