"use client";

import { ChangeEvent, useCallback, useEffect, useState ,} from "react";
import { ApiError, Concert, CreateConcertInput, ImageFile, UpdateZoneSeatDetail, Zone, ZoneUpdatePayload } from "../types";
import { concertService ,} from "../services/concertService";
import { createClient } from "@supabase/supabase-js";
import { ENV } from "../config/env";
import { useRouter } from "next/navigation";


const supabase = createClient(ENV.SUPABASE.url, ENV.SUPABASE.key);

export const useAdminConcert = () => {
  const [concerts, setConcert] = useState<Concert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminConcerts = async () => {
    try {
      setIsLoading(true);
      const data = await concertService.getAdminAllConcerts();
      setConcert(data)
    } catch (e) {
      console.log(e)
      setError("Failed to fetch concerts");
    } finally {
      setIsLoading(false);

    }
  };
  useEffect(() => {
    fetchAdminConcerts();
  }, []);
  console.log(concerts)

  return {
    concerts,
    isLoading,
    error,
    fetchAdminConcerts
  }



}

export const useConcert = () =>{
  const [concerts, setConcert] = useState<Concert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminConcerts = async () => {
    try {
      setIsLoading(true);
      const data = await concertService.getAllConcerts();
      setConcert(data)
    } catch (e) {
      console.log(e)
      setError("Failed to fetch concerts");
    } finally {
      setIsLoading(false);

    }
  };
  useEffect(() => {
    fetchAdminConcerts();
  }, []);
  console.log(concerts)

  return {
    concerts,
    isLoading,
    error,
    fetchAdminConcerts
  }

}

export const useConcertDates = () => {
  const [dates, setDates] = useState<string[]>([""]);

  const addDate = () => setDates([...dates, ""]);

  const removeDate = (index: number) => {
    setDates(dates.filter((_, i) => i !== index));
  };

  return { dates, addDate, removeDate, setDates };
};




export const useImageUpload = (initialUrls: string[] = []) => {
  const [images, setImages] = useState<ImageFile[]>(() =>
    initialUrls.map((url) => ({
      file: new File([], ""), // สร้างไฟล์ว่างเพื่อบอกว่าเป็นรูปเก่าที่มีอยู่แล้ว
      preview: url,
    }))
  );
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (initialUrls && initialUrls.length > 0) {
      setImages(initialUrls.map(url => ({
        file: new File([], ""),
        preview: url
      })));
    }
  }, [initialUrls.join(",")]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const validImages = Array.from(files).filter(file => file.type.startsWith('image/'));
      const newImageObjects = validImages.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setImages(prev => [...prev, ...newImageObjects]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const target = prev[index];
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  // ✅ ฟังก์ชันอัปโหลดเข้า Supabase Storage
  const uploadAllImages = async (): Promise<string[]> => {
    setIsUploading(true);
    try {
      // 3. แยกรูปเก่าและรูปใหม่
      // รูปเก่า = รูปที่มี preview เป็น URL จริง (ไม่ใช่ blob) หรือไฟล์ขนาด 0
      const existingUrls = images
        .filter(img => !img.preview.startsWith('blob:'))
        .map(img => img.preview);

      // รูปใหม่ = รูปที่มี preview เป็น blob (เพิ่งเลือกมาจากเครื่อง)
      const newFiles = images.filter(img => img.preview.startsWith('blob:'));

      const uploadPromises = newFiles.map(async (img) => {
        const fileExt = img.file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `concert-images/${Date.now()}_${fileName}`;

        const { data, error } = await supabase.storage
          .from('concerts')
          .upload(filePath, img.file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('concerts')
          .getPublicUrl(filePath);

        return publicUrl;
      });

      const newlyUploadedUrls = await Promise.all(uploadPromises);

      // 4. รวม URL เก่าที่ยังเหลืออยู่ กับ URL ใหม่ที่เพิ่งอัปโหลด
      return [...existingUrls, ...newlyUploadedUrls];
    } catch (error) {
      console.error("Supabase Upload Error:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    return () => {
      images.forEach(img => {
        if (img.preview.startsWith('blob:')) URL.revokeObjectURL(img.preview);
      });
    };
  }, [images]);

  return {
    images,
    isUploading,
    handleImageChange,
    removeImage,
    uploadAllImages
  };
};


export const useCreateConcert = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();


  // รับฟังก์ชัน uploadAllImages เข้ามาเป็น parameter หรือจะ import มาใช้ข้างในก็ได้
  const handleCreateConcert = async (
    data: CreateConcertInput,
    uploadFn?: () => Promise<string[]> // ✅ เพิ่ม parameter สำหรับรับฟังก์ชันอัปโหลด
  ) => {
    try {
      setLoading(true);
      setError(null);

      const finalData = { ...data };

      // 1. ถ้ามีฟังก์ชันอัปโหลดส่งมา ให้ทำการอัปโหลดก่อน
      if (uploadFn) {
        console.log("Uploading images via Hook...");
        const uploadedUrls = await uploadFn();
        finalData.image_url = uploadedUrls; // ✅ เปลี่ยนจาก blob เป็น URL จริง
      }

      // 2. ส่งข้อมูลที่อัปเดต URL แล้วไปที่ Backend
      const result = await concertService.createConcert(finalData);
      console.log("Concert created:", result);
      router.push("/admin");
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong";
      setError(errorMessage);
      throw err; // throw ออกไปเพื่อให้ฝั่ง UI รู้ว่าพัง
    } finally {
      setLoading(false);
    }
  };

  return {
    handleCreateConcert,
    loading,
    error,
  };
};

export const useUpdateConcert = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdateConcert = async (
    id: string,
    data: CreateConcertInput,
    uploadFn?: () => Promise<string[]>
  ) => {
    try {
      setLoading(true);

      let finalImageUrl = data.image_url;
      if (uploadFn) {
        finalImageUrl = await uploadFn();
      }

      // 🔥 1. ดึง zone เดิมจาก DB
      const existingZones = await concertService.getZonesByConcert(id);

      // 🔥 2. หา zone ที่ถูกลบ
      const incomingZoneIds = data.zones
        .filter(z => z.zone_id)
        .map(z => z.zone_id);

      const zonesToDelete = existingZones.filter(
        (z: Zone) => !incomingZoneIds.includes(z.zone_id)
      );

      // 🔥 3. อัปเดต concert
      await concertService.updateConcertInfo(id, {
        ...data,
        image_url: finalImageUrl
      });

      // 🔥 4. update + add
      const zoneActions = data.zones.map((zone: ZoneUpdatePayload) => {
        if (zone.zone_id) {
          return concertService.updateZone(zone.zone_id, zone);
        } else {
          return concertService.addZone(id, zone);
        }
      });

      // 🔥 5. delete
      const deleteActions = zonesToDelete.map((zone: Zone) =>
        concertService.deleteZone(zone.zone_id)
      );

      await Promise.all([
        ...zoneActions,
        ...deleteActions
      ]);

      router.push("/admin");
      router.refresh();

    } catch (err) {
      console.error("Update Error:", err);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาตรวจสอบ Console");
    } finally {
      setLoading(false);
    }
  };

  return { handleUpdateConcert, loading };
};

export const useConcertById = (id: string | undefined) => {
  const [concert, setConcert] = useState<Concert | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // แยก Logic ออกมาเป็นฟังก์ชันปกติ
  const fetchConcert = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await concertService.getConcertById(id);
      setConcert(data);
    } catch (err) {
      setError("Cant get concert");
    } finally {
      setIsLoading(false);
    }
  };

  // รันแค่ตอน id เปลี่ยนเท่านั้น (ไม่ต้องใส่ fetchConcert ใน dependency)
  useEffect(() => {
    fetchConcert();
  }, [id]);

  return {
    concert,
    isLoading,
    error,
    refresh: fetchConcert // ส่งออกไปให้ UI เรียกใช้ตามใจชอบ
  };
};

export const useZone = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ แก้จาก Seat เป็น Zone เพราะ API คืนข้อมูลโซนที่มีอาเรย์ที่นั่ง
  const [zoneLayout, setZoneLayout] = useState<Zone | null>(null);

  const fetchZoneLayout = useCallback(async (zoneId: number, showtimeId: number) => {
    try {
      setIsLoading(true);
      setError(null);

      // concertService.getZoneLayout ควรจะ return ข้อมูลประเภท Zone
      const data = await concertService.getZoneLayout(zoneId, showtimeId);
      setZoneLayout(data);
    } catch (err: unknown) {
      const error = err as ApiError;
      setError(error.response?.data?.message || "Failed to fetch zone layout");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ฟังก์ชันสำหรับ Admin (แก้ Parameter ให้ตรงกับที่จะส่งไป)
  const updateZoneSeat = async (zoneId: number, data: Partial<UpdateZoneSeatDetail>) => {
    try {
      setIsLoading(true);
      const result = await concertService.updateZoneSeat(zoneId, data);
      return result;
    } catch (err: unknown) {
      const error = err as ApiError;
      const msg = error.response?.data?.message || "Update failed";
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    zoneLayout,
    isLoading,
    error,
    fetchZoneLayout,
    updateZoneSeat,
    setZoneLayout
  };
};

