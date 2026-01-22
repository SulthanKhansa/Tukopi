// API Service untuk frontend Astro
const isProduction = import.meta.env.PROD;

// Helper untuk deteksi base URL di server vs client
const API_BASE_URL = isProduction
  ? "https://your-backend-url.com/api"
  : "http://127.0.0.1:5000/api";

const getFunctionsUrl = () => {
  if (isProduction) return "/.netlify/functions";
  return "http://localhost:5000/api"; // or whatever your local dev is
};

export const apiService = {
  // Common Fetcher with better error handling
  async safeFetch(url, options = {}) {
    try {
      console.log(`[apiService] Fetching: ${url}`);
      const resp = await fetch(url, options);
      if (!resp.ok) {
        console.error(`[apiService] HTTP Error ${resp.status} for ${url}`);
        return null;
      }
      return await resp.json();
    } catch (err) {
      console.error(`[apiService] Fetch failed for ${url}:`, err.message);
      return null;
    }
  },

  // Auth API
  async login(id, password) {
    const url = isProduction
      ? `${getFunctionsUrl()}/auth/login`
      : `${API_BASE_URL}/auth/login`;
    const res = await this.safeFetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, password }),
    });
    return res || { success: false, error: "Network error" };
  },

  async register(id, name, email, password) {
    const url = isProduction
      ? `${getFunctionsUrl()}/auth/register`
      : `${API_BASE_URL}/auth/register`;
    const res = await this.safeFetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name, email, password }),
    });
    return res || { success: false, error: "Network error" };
  },

  // Basic Fetcher (Helper for local backend)
  async fetchAdmin(endpoint) {
    return await this.safeFetch(`${API_BASE_URL}${endpoint}`);
  },

  // Admin Dashboard API
  async getAdminDashboard() {
    if (isProduction) {
      const json = await this.safeFetch(`${getFunctionsUrl()}/orders/stats`);
      return (
        json?.data || {
          stats: { total_orders: 0, total_revenue: 0 },
          transactions: [],
        }
      );
    }
    return await this.fetchAdmin("/orders/dashboard/stats");
  },

  async getDashboardReports() {
    if (isProduction) {
      const json = await this.safeFetch(`${getFunctionsUrl()}/orders?type=reports`);
      return json?.data || [];
    }
    const res = await this.fetchAdmin("/orders/dashboard/reports");
    return res?.data || [];
  },

  async getAdminOrders() {
    if (isProduction) {
      const json = await this.safeFetch(`${getFunctionsUrl()}/orders`);
      return json?.data || [];
    }
    const res = await this.fetchAdmin("/orders");
    return res?.data || [];
  },

  async getAdminCashiers() {
    if (isProduction) {
      const json = await this.safeFetch(`${getFunctionsUrl()}/cashiers`);
      return json?.data || [];
    }
    const res = await this.fetchAdmin("/cashiers");
    return res?.data || [];
  },

  async getAdminCustomers() {
    if (isProduction) {
      const json = await this.safeFetch(`${getFunctionsUrl()}/customers`);
      return json?.data || [];
    }
    const res = await this.fetchAdmin("/customers");
    return res?.data || [];
  },

  async getAdminProducts() {
    if (isProduction) {
      const json = await this.safeFetch(`${getFunctionsUrl()}/products`);
      return json?.data || [];
    }
    const res = await this.fetchAdmin("/products");
    return res?.data || [];
  },

  async getProducts() {
    try {
      // Jika di produksi (Netlify), gunakan Netlify Function yang baru dibuat untuk Neon
      const url = isProduction
        ? `${getFunctionsUrl()}/products`
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
      const json = await this.safeFetch(`${getFunctionsUrl()}/categories`);
      return json?.data || [];
    }
    return (await this.fetchAdmin("/categories")) || [];
  },

  // Per-ID Lookups
  async getCustomerById(id) {
    if (isProduction) {
      const json = await this.safeFetch(`${getFunctionsUrl()}/customers/${id}`);
      return json?.data || json;
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
      const resp = await fetch(`${getFunctionsUrl()}/customers/${id}/orders`);
      const json = await resp.json();
      return json.data || json;
    }
    return await this.fetchAdmin(`/customers/${id}/orders`);
  },

  // Actions
  async createCategory(id, name) {
    try {
      const url = isProduction
        ? `${getFunctionsUrl()}/categories`
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
        ? `${getFunctionsUrl()}/categories/${id}`
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
        ? `${getFunctionsUrl()}/categories/${id}`
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
        ? `${getFunctionsUrl()}/products`
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
        ? `${getFunctionsUrl()}/products/${id}`
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
        ? `${getFunctionsUrl()}/products/${id}`
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
        ? `${getFunctionsUrl()}/orders`
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
        ? `${getFunctionsUrl()}/orders/${id}`
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
        ? `${getFunctionsUrl()}/orders/${id}`
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
        ? `${getFunctionsUrl()}/customers/${id}`
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

  async createCustomer(data) {
    try {
      const url = isProduction
        ? `${getFunctionsUrl()}/customers`
        : `${API_BASE_URL}/customers`;
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

  async deleteCustomer(id) {
    try {
      const url = isProduction
        ? `${getFunctionsUrl()}/customers/${id}`
        : `${API_BASE_URL}/customers/${id}`;
      const response = await fetch(url, {
        method: "DELETE",
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Cashier crud
  async createCashier(data) {
    try {
      const url = isProduction
        ? `${getFunctionsUrl()}/cashiers`
        : `${API_BASE_URL}/cashiers`;
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

  async updateCashier(id, data) {
    try {
      const url = isProduction
        ? `${getFunctionsUrl()}/cashiers/${id}`
        : `${API_BASE_URL}/cashiers/${id}`;
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

  async deleteCashier(id) {
    try {
      const url = isProduction
        ? `${getFunctionsUrl()}/cashiers/${id}`
        : `${API_BASE_URL}/cashiers/${id}`;
      const response = await fetch(url, {
        method: "DELETE",
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
};
