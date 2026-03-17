import axiosInstance from "../lib/axios";
import { Concert, CreateConcertInput, ApiResponse, ZoneInput } from "../types";
export const concertService = {
  getAllConcerts: async (): Promise<Concert[]> => {
    const response = await axiosInstance.get<ApiResponse<Concert[]>>("/concert/all");
    return response.data.data;
  },
  getAdminAllConcerts: async(): Promise<Concert[]> =>{
    const response = await axiosInstance.get<ApiResponse<Concert[]>>("/concert/admin/all");
    return response.data.data;
  },

  getConcertById: async (id: string): Promise<Concert> => {
    const response = await axiosInstance.get<ApiResponse<Concert>>(`/concert/${id}`);
    return response.data.data;
  },

  createConcert: async (data: CreateConcertInput): Promise<Concert> => {
    const response = await axiosInstance.post<ApiResponse<Concert>>("/concert/create", data);
    return response.data.data;
  },

  
  updateConcertInfo: async (id: string, data: Partial<CreateConcertInput>): Promise<Concert> => {
    const payload = {
      concert_name: data.concert_name,
      concert_detail: data.concert_detail,
      location: data.location,
      is_visible: data.is_visible,
      sale_start_time: data.sale_start_time,
      max_tickets_per_user: data.max_tickets_per_user,
      image_url: data.image_url // อย่าลืมส่ง image_url ที่อัปเดตแล้วไปด้วย
    };

    const response = await axiosInstance.put<ApiResponse<Concert>>(
      `/concert/update/${id}`,
      payload
    );
    return response.data.data;
  },

  
  updateZone: async (zoneId: number, zoneData: Partial<ZoneInput>) => {
    const payload = {
      zoneName: zoneData.zone_name,
      price: zoneData.price,
      rowCount: zoneData.row_count,
      seatPerRow: zoneData.seat_per_row,
      posX: zoneData.pos_x,
      posY: zoneData.pos_y,
      width: zoneData.width,
      height: zoneData.height,
      color: zoneData.color
    };

   
    return await axiosInstance.patch(`/zone/updateseat/${zoneId}`, payload);
  },

  
  addZone: async (concertId: string, zoneData: Partial<ZoneInput>) => {
    
    return await axiosInstance.post(`/zone/addzone/${concertId}`, zoneData);
  }
};