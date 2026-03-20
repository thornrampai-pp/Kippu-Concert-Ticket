import { PendingBooking } from "../types";

export const useBooking = () => {
  const saveBooking = (data: PendingBooking) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("current_booking", JSON.stringify(data));
    }
  };

  const getBooking = (): PendingBooking | null => {
    if (typeof window !== "undefined") {
      const data = sessionStorage.getItem("current_booking");
      return data ? JSON.parse(data) : null;
    }
    return null;
  };

  const clearBooking = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("current_booking");
    }
  };

  return { saveBooking, getBooking, clearBooking };
};