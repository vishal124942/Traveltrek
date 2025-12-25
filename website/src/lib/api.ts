const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

class ApiClient {
    private token: string | null = null;

    setToken(token: string | null) {
        this.token = token;
        if (typeof window !== 'undefined') {
            if (token) {
                localStorage.setItem('auth_token', token);
            } else {
                localStorage.removeItem('auth_token');
            }
        }
    }

    getToken(): string | null {
        if (this.token) return this.token;
        if (typeof window !== 'undefined') {
            return localStorage.getItem('auth_token');
        }
        return null;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...((options.headers as Record<string, string>) || {}),
        };

        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers,
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: data.error || 'Request failed' };
            }

            return { success: true, data };
        } catch (error) {
            return { success: false, error: 'Network error' };
        }
    }

    // Auth
    async register(name: string, email: string, phone: string, password: string) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, phone, password }),
        });
    }

    async login(email: string, password: string) {
        const response = await this.request<{ token: string; user: unknown }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        if (response.success && response.data?.token) {
            this.setToken(response.data.token);
        }

        return response;
    }

    logout() {
        this.setToken(null);
    }

    // User
    async getProfile() {
        return this.request('/user/profile');
    }

    // Destinations
    async getDestinations() {
        return this.request<{ destinations: unknown[] }>('/destinations');
    }

    // Membership
    async getMembership() {
        return this.request('/membership');
    }

    // Chat
    async sendMessage(message: string) {
        return this.request('/chat', {
            method: 'POST',
            body: JSON.stringify({ message }),
        });
    }

    async getChatHistory() {
        return this.request<{ messages: unknown[] }>('/chat/history');
    }
}

export const api = new ApiClient();
export type { ApiResponse };
