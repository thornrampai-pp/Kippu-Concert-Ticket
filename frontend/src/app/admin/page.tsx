"use client";

import Header from "@/src/components/Header";
import { useAdminConcert } from "../../hooks/useConcert";
import { useRouter } from "next/navigation";
import CardConcert from "@/src/components/CardConcert";
import { useAdminGuard } from "@/src/hooks/useAuth";

export default function Page() {
  const { isLoading: authLoading, isAdmin } = useAdminGuard();
  const { concerts, isLoading, error } = useAdminConcert();
  const router = useRouter();

  // ปล่อยให้ Guard จัดการเรื่อง Redirect แต่เราจะ Render โครงสร้างหลักรอไว้
  return (
    <div className="min-h-screen bg-zinc-900">
      <Header />

      <div className="p-6 flex flex-col gap-6 ">
        {authLoading ? (
          <p className="text-white text-center mt-10 animate-pulse">
            Checking Permission...
          </p>
        ) : isAdmin ? (
          <>
            <div className="flex justify-between items-center gap-4">
              <h1 className="text-2xl font-bold text-white">
                Concert Management
              </h1>
              <button
                className="cursor-pointer bg-white text-black px-4 py-2 rounded-lg"
                onClick={() => router.push("/admin/concert/new")}
              >
                Create Concert
              </button>
            </div>

            {isLoading ? (
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white"></div>
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
          </>
        ) : null}
      </div>
    </div>
  );
}