const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

class AdminApiClient {
    private token: string | null = null;

    setToken(token: string | null) {
        this.token = token;
        if (typeof window !== 'undefined') {
            if (token) {
                localStorage.setItem('admin_token', token);
            } else {
                localStorage.removeItem('admin_token');
            }
        }
    }

    getToken(): string | null {
        if (this.token) return this.token;
        if (typeof window !== 'undefined') {
            return localStorage.getItem('admin_token');
        }
        return null;
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
        try {
            const token = this.getToken();
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            };

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers: { ...headers, ...options.headers },
            });

            const data = await response.json();

            if (response.ok) {
                return { success: true, data };
            }
            return { success: false, error: data.error || 'Request failed' };
        } catch {
            return { success: false, error: 'Network error' };
        }
    }

    // Auth
    async login(email: string, password: string) {
        const response = await this.request<{ token: string; user: { role: string } }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        if (response.success && response.data?.token) {
            // Check if user is admin
            const adminRoles = ['ADMIN', 'OPS', 'SUPPORT'];
            if (!adminRoles.includes(response.data.user?.role || '')) {
                return { success: false, error: 'Access denied. Admin privileges required.' };
            }
            this.setToken(response.data.token);
        }

        return response;
    }

    logout() {
        this.setToken(null);
    }

    // Admin endpoints
    async getStats() {
        return this.request('/admin/stats');
    }

    async getUsers() {
        return this.request('/admin/users');
    }

    async getMemberships(status?: string) {
        const query = status ? `?status=${status}` : '';
        return this.request(`/admin/memberships${query}`);
    }

    async activateMembership(id: string) {
        return this.request(`/admin/memberships/${id}/activate`, { method: 'POST' });
    }

    async rejectMembership(id: string, reason?: string) {
        return this.request(`/admin/memberships/${id}/reject`, {
            method: 'POST',
            body: JSON.stringify({ reason }),
        });
    }

    async extendMembership(id: string, additionalDays: number) {
        return this.request(`/admin/memberships/${id}/extend`, {
            method: 'POST',
            body: JSON.stringify({ additionalDays }),
        });
    }

    async updateMembership(id: string, data: { customDaysAdded?: number; customDestinationIds?: string[] }) {
        return this.request(`/admin/users/${id}/membership`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async getPlans() {
        return this.request('/admin/plans');
    }

    async updatePlan(id: string, data: { name?: string; days?: number; price?: number; isActive?: boolean }) {
        return this.request(`/admin/plans/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async getDestinations() {
        return this.request('/admin/destinations');
    }

    async createDestination(data: Record<string, unknown>) {
        return this.request('/admin/destinations', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateDestination(id: string, data: Record<string, unknown>) {
        return this.request(`/admin/destinations/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteDestination(id: string) {
        return this.request(`/admin/destinations/${id}`, { method: 'DELETE' });
    }

    // Upload
    async uploadFile(file: File) {
        const formData = new FormData();
        formData.append('file', file);

        const token = this.getToken();
        const headers: Record<string, string> = {};
        if (token) headers.Authorization = `Bearer ${token}`;

        try {
            const response = await fetch(`${API_BASE_URL}/upload`, {
                method: 'POST',
                headers,
                body: formData,
            });
            const data = await response.json();
            if (response.ok) return { success: true, data };
            return { success: false, error: data.error || 'Upload failed' };
        } catch {
            return { success: false, error: 'Network error' };
        }
    }

    // Brochures
    async getBrochures() {
        return this.request('/brochures');
    }

    async createBrochure(title: string, url: string) {
        return this.request('/brochures', {
            method: 'POST',
            body: JSON.stringify({ title, url }),
        });
    }

    async deleteBrochure(id: string) {
        return this.request(`/brochures/${id}`, { method: 'DELETE' });
    }
}

export const adminApi = new AdminApiClient();
