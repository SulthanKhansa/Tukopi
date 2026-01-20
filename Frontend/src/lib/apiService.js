// API Service untuk frontend Astro
const isProduction = import.meta.env.PROD;

// Helper untuk deteksi base URL di server vs client
const getBaseUrl = () => {
  if (typeof window !== "undefined") return ""; // Di browser bisa pakai relative path
  return process.env.URL || process.env.DEPLOY_PRIME_URL || ""; // Di server Netlify butuh absolute path
};

const API_BASE_URL = isProduction
  ? "https://your-backend-url.com/api"
  : "http://127.0.0.1:5000/api";

const NETLIFY_FUNCTIONS_URL = `${getBaseUrl()}/.netlify/functions`;

export const apiService = {
  // Auth API
  async login(id, password) {
    try {
      const url = isProduction
        ? `${NETLIFY_FUNCTIONS_URL}/auth/login`
        : `${API_BASE_URL}/auth/login`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password }),
      });
      return await response.json();
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: error.message };
    }
  },

  async register(id, name, email, password) {
    try {
      const url = isProduction
        ? `${NETLIFY_FUNCTIONS_URL}/auth/register`
        : `${API_BASE_URL}/auth/register`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name, email, password }),
      });
      return await response.json();
    } catch (error) {
      console.error("Register error:", error);
      return { success: false, error: error.message };
    }
  },

  // Basic Fetcher (Helper)
  async fetchAdmin(endpoint) {
    try {
      const resp = await fetch(`${API_BASE_URL}${endpoint}`);
      if (!resp.ok) throw new Error(`HTTP Error: ${resp.status}`);
      const json = await resp.json();
      return json.data || json; // Return .data if exists, otherwise the whole json
    } catch (err) {
      console.error(`Fetch error at ${endpoint}:`, err);
      return null;
    }
  },

  // Admin Dashboard API
  async getAdminDashboard() {
    if (isProduction) {
      const resp = await fetch(`${NETLIFY_FUNCTIONS_URL}/orders/stats`);
      const json = await resp.json();
      // json.data now contains { stats: {...}, transactions: [...] }
      return (
        json.data || {
          stats: { total_orders: 0, total_revenue: 0 },
          transactions: [],
        }
      );
    }
    return await this.fetchAdmin("/orders/dashboard/stats");
  },

  async getAdminOrders() {
    if (isProduction) {
      const resp = await fetch(`${NETLIFY_FUNCTIONS_URL}/orders`);
      const json = await resp.json();
      return json.data || [];
    }
    return (await this.fetchAdmin("/orders")) || [];
  },

  async getAdminCashiers() {
    if (isProduction) {
      const resp = await fetch(`${NETLIFY_FUNCTIONS_URL}/cashiers`);
      const json = await resp.json();
      return json.data || [];
    }
    return (await this.fetchAdmin("/cashiers")) || [];
  },

  async getAdminCustomers() {
    if (isProduction) {
      const resp = await fetch(`${NETLIFY_FUNCTIONS_URL}/customers`);
      const json = await resp.json();
      return json.data || [];
    }
    return (await this.fetchAdmin("/customers")) || [];
  },

  async getAdminProducts() {
    if (isProduction) {
      const resp = await fetch(`${NETLIFY_FUNCTIONS_URL}/products`);
      const json = await resp.json();
      return json.data || [];
    }
    return (await this.fetchAdmin("/products")) || [];
  },

  async getProducts() {
    try {
      // Jika di produksi (Netlify), gunakan Netlify Function yang baru dibuat untuk Neon
      const url = isProduction
        ? `${NETLIFY_FUNCTIONS_URL}/products`
        : `${API_BASE_URL}/products`;
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error("Error fetching products:", error);
      return { success: false, data: [] };
    }
  },

  async getCategories() {
    if (isProduction) {
      const resp = await fetch(`${NETLIFY_FUNCTIONS_URL}/categories`);
      const json = await resp.json();
      return json.data || [];
    }
    return (await this.fetchAdmin("/categories")) || [];
  },

  // Per-ID Lookups
  async getCustomerById(id) {
    if (isProduction) {
      const resp = await fetch(`${NETLIFY_FUNCTIONS_URL}/customers/${id}`);
      const json = await resp.json();
      return json.data || json;
    }
    return await this.fetchAdmin(`/customers/${id}`);
  },

  async getProductById(id) {
    if (isProduction) {
      // For now we don't have a specific getProductById function,
      // but we can filter from getAdminProducts or just keep it simple
      const products = await this.getAdminProducts();
      return products.find((p) => p.PRODUCT_ID === id) || null;
    }
    return await this.fetchAdmin(`/products/${id}`);
  },

  async getCustomerOrders(id) {
    if (isProduction) {
      const resp = await fetch(
        `${NETLIFY_FUNCTIONS_URL}/customers/${id}/orders`,
      );
      const json = await resp.json();
      return json.data || json;
    }
    return await this.fetchAdmin(`/customers/${id}/orders`);
  },

  // Actions
  async createCategory(id, name) {
    try {
      const url = isProduction
        ? `${NETLIFY_FUNCTIONS_URL}/categories`
        : `${API_BASE_URL}/categories`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  async updateCategory(id, name) {
    try {
      const url = isProduction
        ? `${NETLIFY_FUNCTIONS_URL}/categories/${id}`
        : `${API_BASE_URL}/categories/${id}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  async deleteCategory(id) {
    try {
      const url = isProduction
        ? `${NETLIFY_FUNCTIONS_URL}/categories/${id}`
        : `${API_BASE_URL}/categories/${id}`;
      const response = await fetch(url, {
        method: "DELETE",
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  async createProduct(data) {
    try {
      const url = isProduction
        ? `${NETLIFY_FUNCTIONS_URL}/products`
        : `${API_BASE_URL}/products`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  async updateProduct(id, data) {
    try {
      const url = isProduction
        ? `${NETLIFY_FUNCTIONS_URL}/products/${id}`
        : `${API_BASE_URL}/products/${id}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  async deleteProduct(id) {
    try {
      const url = isProduction
        ? `${NETLIFY_FUNCTIONS_URL}/products/${id}`
        : `${API_BASE_URL}/products/${id}`;
      const response = await fetch(url, {
        method: "DELETE",
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  async createOrder(orderData) {
    try {
      const url = isProduction
        ? `${NETLIFY_FUNCTIONS_URL}/orders`
        : `${API_BASE_URL}/orders`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  async updateOrder(id, data) {
    try {
      const url = isProduction
        ? `${NETLIFY_FUNCTIONS_URL}/orders/${id}`
        : `${API_BASE_URL}/orders/${id}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  async deleteOrder(id) {
    try {
      const url = isProduction
        ? `${NETLIFY_FUNCTIONS_URL}/orders/${id}`
        : `${API_BASE_URL}/orders/${id}`;
      const response = await fetch(url, {
        method: "DELETE",
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  async updateCustomer(id, data) {
    try {
      const url = isProduction
        ? `${NETLIFY_FUNCTIONS_URL}/customers/${id}`
        : `${API_BASE_URL}/customers/${id}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
};
