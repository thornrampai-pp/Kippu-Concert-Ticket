import axiosInstance from "../lib/axios";
import { Concert, CreateConcertInput, ApiResponse } from "../types";

export const concertService = {
  getAllConcerts: async (): Promise<Concert[]> => {
    const response = await axiosInstance.get<ApiResponse<Concert[]>>("/concert/all");
    return response.data.data;
  },

  getConcertById: async (id: string): Promise<Concert> => {
    const response = await axiosInstance.get<ApiResponse<Concert>>(`/concert/${id}`);
    return response.data.data;
  },

  createConcert: async (data: CreateConcertInput): Promise<Concert> => {
    // ยิง POST ไปที่เส้น /concert พร้อมส่ง JSON body
    const response = await axiosInstance.post<ApiResponse<Concert>>("/concert/create", data);
    return response.data.data;
  },

  updateConcert: async (id: string, data: Partial<CreateConcertInput>): Promise<Concert> => {
    const response = await axiosInstance.put<ApiResponse<Concert>>(
      `/concert/update/${id}`,
      data
    );

    return response.data.data;
  },

}