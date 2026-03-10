import { DecodedIdToken } from "firebase-admin/auth";

declare global {
  namespace Express {
    interface Request {
      user?: DecodedIdToken; // กำหนด Type ให้ตรงกับที่ Firebase คืนค่ามา
    }
  }
}