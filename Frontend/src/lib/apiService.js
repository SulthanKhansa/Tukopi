// API Service untuk frontend Astro
const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const API_BASE_URL = isProduction ? "https://your-backend-url.com/api" : "http://127.0.0.1:5000/api";
const NETLIFY_FUNCTIONS_URL = "/.netlify/functions";

export const apiService = {
  // Auth API
  async login(id, password) {
    try {
      const url = isProduction ? `${NETLIFY_FUNCTIONS_URL}/auth/login` : `${API_BASE_URL}/auth/login`;
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
      const url = isProduction ? `${NETLIFY_FUNCTIONS_URL}/auth/register` : `${API_BASE_URL}/auth/register`;
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
    return await this.fetchAdmin("/orders/dashboard/stats");
  },

  async getAdminOrders() {
    return (await this.fetchAdmin("/orders")) || [];
  },

  async getAdminCashiers() {
    return (await this.fetchAdmin("/cashiers")) || [];
  },

  async getAdminCustomers() {
    return (await this.fetchAdmin("/customers")) || [];
  },

  async getAdminProducts() {
    return (await this.fetchAdmin("/products")) || [];
  },

  async getProducts() {
    try {
      // Jika di produksi (Netlify), gunakan Netlify Function yang baru dibuat untuk Neon
      const url = isProduction ? `${NETLIFY_FUNCTIONS_URL}/products` : `${API_BASE_URL}/products`;
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error("Error fetching products:", error);
      return { success: false, data: [] };
    }
  },

  async getCategories() {
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
    return await this.fetchAdmin(`/products/${id}`);
  },

  async getCustomerOrders(id) {
    if (isProduction) {
      const resp = await fetch(`${NETLIFY_FUNCTIONS_URL}/customers/${id}/orders`);
      const json = await resp.json();
      return json.data || json;
    }
    return await this.fetchAdmin(`/customers/${id}/orders`);
  },

  // Actions
  async createCategory(id, name) {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
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
      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
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
      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: "DELETE",
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  async createOrder(orderData) {
    try {
      const url = isProduction ? `${NETLIFY_FUNCTIONS_URL}/orders` : `${API_BASE_URL}/orders`;
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

  async updateCustomer(id, data) {
    try {
      const url = isProduction ? `${NETLIFY_FUNCTIONS_URL}/customers/${id}` : `${API_BASE_URL}/customers/${id}`;
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
