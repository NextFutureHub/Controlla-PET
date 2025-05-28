import axios from 'axios';
import { UserRole } from '../types/user';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  companyId?: string;
  contractorId?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    companyId?: string;
    contractorId?: string;
  };
}

class AuthService {
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/auth/login`, loginDto);
    return response.data;
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/auth/register`, registerDto);
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
    return response.data;
  }

  async getProfile(): Promise<any> {
    const response = await axios.get(`${API_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    return response.data;
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  setUser(user: any): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export const authService = new AuthService(); 