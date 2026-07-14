"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { addToRecentlyViewed } from "@/hooks/useRecentlyViewed";

export default function TrackView() {
  const params = useParams();
  const id = params?.id as string | undefined;

  useEffect(() => {
    if (id) {
      addToRecentlyViewed(id);
    }
  }, [id]);

  return null;
}
