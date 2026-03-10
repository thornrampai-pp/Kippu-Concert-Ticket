import { DecodedIdToken } from "firebase-admin/auth";

export interface LoginGoogleBody {
  idToken: string;
}


export interface UpdateProfileBody {
  user_name?: string;
  phoneNumber?: string;
  image_url?: string;
}