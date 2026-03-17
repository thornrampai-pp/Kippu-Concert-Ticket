"use client"; 
import ConcertEditorContent from "@/src/components/admin/ConcertEditorContent";
import Header from "@/src/components/Header";
import { useAdminGuard } from "@/src/hooks/useAuth";
import { useConcertById } from "@/src/hooks/useConcert";
import { CreateConcertInput } from "@/src/types";
import { useParams } from "next/navigation";

export default function EditConcertPage() {
  const params = useParams();
  const id = params.id as string;

  const { concert, isLoading: dataLoading } = useConcertById(id);
  const { isLoading: authLoading, isAdmin } = useAdminGuard();

  if (authLoading || dataLoading) return <div>Loading...</div>;
  if (!isAdmin || !concert) return null;

  const sanitizedData: CreateConcertInput = {
    concert_name: concert.concert_name ?? "",
    image_url: concert.image_url ?? [],
    concert_detail: concert.concert_detail ?? "",
    location: concert.location ?? "",
    is_visible: concert.is_visible ?? false,
    sale_start_time: concert.sale_start_time
      ? new Date(concert.sale_start_time).toISOString().slice(0, 16) // แปลงให้เข้ากับ input type="datetime-local"
      : "",
    max_tickets_per_user: concert.max_tickets_per_user ?? 1,
    show_times:
      concert.show_times?.map((st) =>
        new Date(st.show_date).toISOString().slice(0, 16),
      ) ?? [],

    zones:
      concert.zones?.map((z) => ({
        zone_id: z.zone_id,
        zone_name: z.zone_name,
        price: Number(z.price),
        row_count: z.row_count,
        seat_per_row: z.seat_per_row,
        total_seats: z.total_seats,
        color: z.color,
        pos_x: z.pos_x,
        pos_y: z.pos_y,
        width: z.width,
        height: z.height,
      })) ?? [],
  };

  return (
    <div className="min-h-screen bg-zinc-900">
      <Header />
      <h1 className="text-white py-8 text-4xl font-bold max-w-5xl mx-auto px-4">
        Edit Concert
      </h1>

      <ConcertEditorContent
        key={id}
        isEdit={true}
        id={id}
        initialData={sanitizedData} 
      />
    </div>
  );
}
