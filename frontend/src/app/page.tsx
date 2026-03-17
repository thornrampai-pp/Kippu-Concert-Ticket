"use client";
import CardConcert from "../components/CardConcert";
import Header from "../components/Header";
import { useConcert } from "../hooks/useConcert";

export default function Home() {
const { concerts, isLoading, error } = useConcert();
  // const router = useRouter();

  // ปล่อยให้ Guard จัดการเรื่อง Redirect แต่เราจะ Render โครงสร้างหลักรอไว้
  return (
    <div className="min-h-screen bg-zinc-900">
      <Header />

      <div className="p-6 flex flex-col gap-6 ">
        {isLoading ? (
       
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white"></div>
      </div>
    
        ) : error ? (
          <p className="p-6 text-red-500">{error}</p>
        ) : concerts.length === 0 ? (
          <p className="text-white text-center">No concerts</p>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {concerts.map((concert) => (
              <CardConcert key={concert.concert_id} concert={concert} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}