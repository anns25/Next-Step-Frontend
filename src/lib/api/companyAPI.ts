import { CompanyAuthResponse, CompanyLoginCredentials, CompanyRegisterCredentials } from "@/types/Company";
import api from "../axios";

// Company Authentication API functions
export async function loginCompany(credentials: CompanyLoginCredentials): Promise<CompanyAuthResponse | null> {
    try {
        console.log(`******api is ${process.env.NEXT_PUBLIC_API_URL}/company/login`)
        const response = await api.post(`${process.env.NEXT_PUBLIC_API_URL}/company/login`, credentials);
        if (response.status === 200) {
            console.log("Company Login Response", response);
            return response.data;
        }
        return null;
    } catch (err: unknown) {
        console.error("Company login error", err);
        return null;
    }
}

export async function registerCompany(credentials: CompanyRegisterCredentials): Promise<CompanyAuthResponse | null> {
    try {
        const formData = new FormData();
        formData.append("name", credentials.name);
        formData.append("description", credentials.description || "");
        formData.append("contact[email]", credentials.contact.email);
        formData.append("contact[phone]", credentials.contact.phone || "");
        formData.append("website", credentials.website || "");
        formData.append("password", credentials.password);
        formData.append("industry", credentials.industry || "");
        formData.append("location[city]", credentials.location?.city || "");
        formData.append("location[country]", credentials.location?.country || "");

        if (credentials.logo) {
            formData.append("logo", credentials.logo);
        }

        formData.forEach((value, key) => {
            console.log(key, typeof(value), value);
        });


        const response = await api.post(`${process.env.NEXT_PUBLIC_API_URL}/company/register`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        console.log("******", response);

        if (response.status === 201) {
            console.log("Company Register Response", response);
            return response.data;
        }
        return null;
    } catch (err) {
        console.error("Company register error", err);
        return null;
    }
}
