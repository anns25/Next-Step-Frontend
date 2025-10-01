import { AuthResponse, LoginCredentials, RegisterCredentials, User } from "../../types/User";
import api from "../axios";
import axios, { AxiosError } from "axios";

//Authentication API functions
export async function loginUser(credentials: LoginCredentials): Promise<AuthResponse | null> {
  try {
    console.log(`******api is ${process.env.NEXT_PUBLIC_API_URL}/user/login`)
    const response = await api.post(`${process.env.NEXT_PUBLIC_API_URL}/user/login`, credentials);
    if (response.status === 200) {
      console.log("Response", response);
      return response.data;
    }

    return null;
  } catch (err: unknown) {
    if (err instanceof AxiosError && err.response?.status != 401) {
      console.error("Login error", err);
    }
    throw err;
  }
}

export async function registerUser(credentials: RegisterCredentials): Promise<AuthResponse | null> {
  try {
    const formData = new FormData();
    formData.append('firstName', credentials.firstName);
    formData.append('lastName', credentials.lastName);
    formData.append('email', credentials.email);
    formData.append('password', credentials.password);
    if (credentials.profilePicture) {
      formData.append("profilePicture", credentials.profilePicture);
    }

    const response = await api.post(`${process.env.NEXT_PUBLIC_API_URL}/user/register`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
    });

    if (response.status === 201) {
      return response.data;
    }
    return null;
  } catch (err) {
    console.error('Register error');
    return null;
  }
}


export async function getMyProfile(): Promise<User | null> {
  try {
    const response = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/user/profile`, {
      withCredentials: true, // if cookies are used
    });

    if (response.status === 200) {
      return response.data;
    }

    return null;
  } catch (err) {
    console.error("Get profile error", err);
    return null;
  }
}

function appendFormData(formData: FormData, key: string, value: any) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      if (typeof item === "object" && item !== null) {
        Object.entries(item).forEach(([subKey, subVal]) => {
          formData.append(`${key}[${index}][${subKey}]`, String(subVal));
        });
      } else {
        formData.append(`${key}[${index}]`, String(item));
      }
    });
  } else if (typeof value === "object" && value !== null) {
    Object.entries(value).forEach(([subKey, subVal]) => {
      appendFormData(formData, `${key}[${subKey}]`, subVal);
    });
  } else {
    formData.append(key, String(value));
  }
}


export async function updateMyProfile(values: Partial<User>, file?: File): Promise<User | null> {
  try {
    const formData = new FormData();

    if (file) formData.append("profilePicture", file);

    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        appendFormData(formData, key, value);
      }
    });

    const response = await api.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/user/profile`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    return response.data ?? null;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      console.error("Update profile error:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      throw err.response?.data || err;
    } else {
      console.error("Update profile error (non-Axios):", err);
      throw err;
    }
  }
}

// Add this function to your existing userAPI.ts file

export const deleteUserAccount = async (): Promise<void> => {
  try {
    const response = await api.delete('/user/profile');
    if (response.status != 200) {
      throw new Error('Failed to delete account');
    }
  }
  catch (err: any) {
    console.error("Delete account error : ", {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message,
    });
    throw err.response?.data || err;
  }
};


