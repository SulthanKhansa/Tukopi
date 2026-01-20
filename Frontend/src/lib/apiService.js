// API Service untuk frontend Astro
const API_BASE_URL = "http://127.0.0.1:5000/api";

export const apiService = {
  // Auth API
  async login(id, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
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
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
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
      const response = await fetch(`${API_BASE_URL}/products`);
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
    return await this.fetchAdmin(`/customers/${id}`);
  },

  async getProductById(id) {
    return await this.fetchAdmin(`/products/${id}`);
  },

  async getCustomerOrders(id) {
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
      const response = await fetch(`${API_BASE_URL}/orders`, {
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
      const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
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
