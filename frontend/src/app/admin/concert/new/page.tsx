"use client";

import Header from "@/src/components/Header";
import { useAdminGuard } from "@/src/hooks/useAuth";
import { CreateConcertInput } from "@/src/types";
import ConcertEditorContent from "@/src/components/admin/ConcertEditorContent";

export default function Page() {
  const { isLoading: authLoading, isAdmin } = useAdminGuard();

  const defaultData: CreateConcertInput = {
    concert_name: "",
    image_url: [],
    concert_detail: "",
    location: "",
    is_visible: false,
    sale_start_time: "",
    max_tickets_per_user: 1,
    show_times: [],
    zones: [],
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <p className="text-white">Checking Access...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-zinc-900">
      <Header />

      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-white py-8 text-4xl font-bold">Create Concert</h1>
      </div>

    
      <ConcertEditorContent
        key="new" 
        isEdit={false}
        
        initialData={defaultData}
      />
    </div>
  );
}
