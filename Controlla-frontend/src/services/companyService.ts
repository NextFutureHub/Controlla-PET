import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export interface CompanyData {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
}

class CompanyService {
  async createCompany(data: CompanyData): Promise<any> {
    const response = await axios.post(`${API_URL}/companies`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    return response.data;
  }

  async getCompany(): Promise<any> {
    const response = await axios.get(`${API_URL}/companies/me`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    return response.data;
  }

  async updateCompany(data: Partial<CompanyData>): Promise<any> {
    const response = await axios.patch(`${API_URL}/companies/me`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    return response.data;
  }

  async getCompanyById(id: string): Promise<any> {
    const response = await axios.get(`${API_URL}/companies/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    return response.data;
  }
}

export const companyService = new CompanyService(); 