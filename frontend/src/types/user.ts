export interface User {
  user_id: string; // Firebase UID
  user_name: string;
  phone_number?: string;
  email: string;
  image_url: string;
  status: boolean;
  role_id: number;

  role: Role;
}

export interface Role {
  role_id: number;
  role_name: string;
}

export interface UpdateProfileInput {
  user_name?: string;
  phone_number?: string;
  image_url?: string;
}

export interface ApiResponseUser<T> {
  success: boolean;
  message?: string;
  data: T;
}