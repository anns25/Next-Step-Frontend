import { CompanyListResponse } from "@/types/Company";
import api from "../axios";

export async function getAllCompanies(params?: {
    page?: number;
    limit?: number;
    search?: string;
    industry?: string;
}): Promise<CompanyListResponse | null> {
    try {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.search) queryParams.append('search', params.search);
        if (params?.industry) queryParams.append('industry', params.industry);
        
        const response = await api.get(`/company/all?${queryParams.toString()}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching companies", error)
        return null;
    }

}