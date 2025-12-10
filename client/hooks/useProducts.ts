import { useState, useEffect, useCallback } from "react";
import { api, Product as ApiProduct, Category as ApiCategory } from "@/api";
import { Product, Category } from "@/store";

function apiProductToProduct(p: ApiProduct): Product {
  return {
    id: p.id,
    name: p.name,
    nameAr: p.nameAr,
    description: p.description,
    descriptionAr: p.descriptionAr,
    price: parseFloat(p.price),
    originalPrice: p.originalPrice ? parseFloat(p.originalPrice) : undefined,
    images: p.images || [],
    categoryId: p.categoryId || "",
    rating: p.rating ? parseFloat(p.rating) : 0,
    reviewCount: p.reviewCount || 0,
    variants: p.variants || undefined,
    inStock: p.inStock ?? true,
    sellerId: p.sellerId || "",
    sellerName: p.sellerName || "",
  };
}

function apiCategoryToCategory(c: ApiCategory): Category {
  return {
    id: c.id,
    name: c.name,
    nameAr: c.nameAr,
    icon: c.icon,
    image: c.image || "",
    productCount: c.productCount || 0,
  };
}

export function useProducts(params?: { categoryId?: string; search?: string; limit?: number }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getProducts(params);
      setProducts(data.map(apiProductToProduct));
    } catch (err: any) {
      setError(err.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, [params?.categoryId, params?.search, params?.limit]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
}

export function useProduct(id: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getProduct(id);
        setProduct(apiProductToProduct(data));
      } catch (err: any) {
        setError(err.message || "Failed to fetch product");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  return { product, loading, error };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getCategories();
      setCategories(data.map(apiCategoryToCategory));
    } catch (err: any) {
      setError(err.message || "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, refetch: fetchCategories };
}
