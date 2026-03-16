"use client";

import Header from "@/src/components/Header";
import { useConcert } from "../../hooks/useConcert";
import { useRouter } from "next/navigation";

export default function Page() {
  const { concerts, isLoading, error } = useConcert();
  const router = useRouter();

  if (isLoading) return <p className="p-6 ">Loading...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-zinc-900">
      <Header />

      <div className="p-6 flex flex-col gap-6 ">
        {/* top bar */}
        <div className="flex justify-between items-center gap-4">
          <h1 className="text-2xl font-bold text-white">Concert Management</h1>

          <button className="cursor-pointer bg-white text-black px-4 py-2 rounded-lg hover:bg-white-500 transition"
            onClick={() => router.push('/admin/create')}
          >
            Create Concert
          </button>
        </div>

        {/* empty state */}
        {concerts.length === 0 ? (
          <p className="flex p-6 text-white justify-center items-center">
            No concerts available
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {concerts.map((concert) => (
              <div
                key={concert.concert_id}
                className="bg-gray-200 p-4 rounded-lg shadow"
              >
                <h3 className="font-bold">{concert.concert_name}</h3>
                <p className="text-sm text-gray-600">{concert.location}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
