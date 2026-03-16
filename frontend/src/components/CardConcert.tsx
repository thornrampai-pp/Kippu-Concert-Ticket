"use client";

import Image from "next/image";
import { Concert } from "../types";
import { useRouter } from "next/navigation";
interface Props {
  concert: Concert;
}

function CardConcert({ concert }: Props) {
  const router = useRouter();
  console.log("Concert Object:", concert);
  return (
    <div
      className="bg-gray-200 rounded-xl shadow hover:shadow-lg transition overflow-hidden cursor-pointer"
      onClick={() => router.push(`/admin/detail/${concert.concert_id}`)}
    >
      {/* image */}
      <div className="relative w-full h-48">
        {concert.image_url?.[0] ? (
          <Image
            src={concert.image_url[0]}
            alt={concert.concert_name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-zinc-300 flex items-center justify-center">
            <span className="text-gray-500">No Image</span>
          </div>
        )}
      </div>

      {/* content */}
      <div className="p-4">
        <h3 className="font-bold text-lg">{concert.concert_name}</h3>

        <p className="text-sm text-gray-600 mt-1">{concert.location}</p>

        <p className="text-xs text-gray-500 mt-2">
          {concert.is_visible ? "Visible" : "Hidden"}
        </p>
      </div>
    </div>
  );
}

export default CardConcert;
