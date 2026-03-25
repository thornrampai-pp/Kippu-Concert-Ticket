import Image from "next/image";
import { useRef, useState } from "react";
import { FaCircleUser } from "react-icons/fa6";
import { ApiError, UpdateProfileInput, User } from "../types";
import { supabase } from "@/src/lib/supabase";

interface ProfileFormProps {
  user: User | null; // ใช้ Interface User ที่คุณมีอยู่ในโปรเจกต์
  updateProfile: (
    data: UpdateProfileInput,
  ) => Promise<{ success: boolean; message?: string }>;
  isUpdating: boolean;
}

export const ProfileForm = ({ user, updateProfile, isUpdating }: ProfileFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // กำหนดค่าเริ่มต้นจาก Props ตรงๆ ครั้งเดียวตอน Mount
  const [form, setForm] = useState({
    user_name: user?.user_name || "",
    phone_number: user?.phone_number || "",
    image_url: user?.image_url || "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (previewImage) URL.revokeObjectURL(previewImage);
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

 const handleSubmit = async () => {
   try {
     let finalImageUrl = form.image_url;

     // 🚩 หาก User เลือกรูปใหม่ (selectedFile มีค่า)
     if (selectedFile && user?.user_id) {
       const file = selectedFile;
       const fileExt = file.name.split(".").pop();
       const fileName = `${user.user_id}-${Date.now()}.${fileExt}`;
       const filePath = `avatars/${fileName}`;

       // 1. อัปโหลดไฟล์ไปที่ Supabase Storage (Bucket ชื่อ 'profiles')
       const { data, error: uploadError } = await supabase.storage
         .from("profiles")
         .upload(filePath, file, {
           upsert: true,
           contentType: file.type, // ระบุประเภทไฟล์ให้ถูกต้อง
         });

       if (uploadError) throw uploadError;

       // 2. ดึง Public URL ของรูปที่อัปโหลดสำเร็จ
       const {
         data: { publicUrl },
       } = supabase.storage.from("profiles").getPublicUrl(filePath);

       finalImageUrl = publicUrl; // เปลี่ยนจาก URL Google เป็น URL Supabase
     }

     // 3. ส่งข้อมูลทั้งหมดไปที่ Backend
     const payload = {
       user_name: form.user_name,
       phone_number: form.phone_number,
       image_url: finalImageUrl, // ส่ง URL ใหม่นี้ไปบันทึกใน DB
     };

     const result = await updateProfile(payload);

     if (result.success) {
       alert("บันทึกข้อมูลสำเร็จ!");
       setSelectedFile(null); // ล้างคิวไฟล์ที่เลือก
       setPreviewImage(null); // ล้างรูป Preview
     }
   } catch (err: unknown) {
    const error = err as ApiError;
     console.error("Upload/Update Error:", error);
     alert("เกิดข้อผิดพลาด: " + (error.message || "ไม่สามารถอัปเดตรูปภาพได้"));
   }
 };
  return (
    <div className="bg-white rounded-3xl p-8 text-black shadow-xl">
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-zinc-200">
          {previewImage || form.image_url ? (
            <Image
              src={previewImage || form.image_url}
              alt="profile"
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-100">
              <FaCircleUser size={64} className="text-zinc-300" />
            </div>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileChange}
          className="hidden"
          accept="image/*"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="bg-black text-white font-bold py-2 px-6 rounded-xl hover:bg-zinc-800 transition"
        >
          Change Image
        </button>

        <div className="w-full space-y-4 mt-4">
          <input
            value={form.user_name}
            onChange={(e) => handleChange("user_name", e.target.value)}
            placeholder="Enter your name"
            className="w-full p-4 bg-zinc-100 rounded-2xl outline-none"
          />
          <input
            value={form.phone_number}
            onChange={(e) => handleChange("phone_number", e.target.value)}
            placeholder="Phone number"
            className="w-full p-4 bg-zinc-100 rounded-2xl outline-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={isUpdating}
          className="w-full bg-emerald-500 text-white font-black py-4 rounded-2xl hover:bg-emerald-600 disabled:bg-zinc-300 transition-all mt-4"
        >
          {isUpdating ? "SAVING..." : "SAVE PROFILE"}
        </button>
      </div>
    </div>
  );
};
