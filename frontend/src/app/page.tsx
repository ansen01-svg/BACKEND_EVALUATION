"use client";

import { useGetUserQuery } from "@/redux/apis/authApi";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const { data: user, isLoading, isFetching } = useGetUserQuery();

  useEffect(() => {
    if (isLoading || isFetching) return;

    router.replace(user ? "/products" : "/login");
  }, [user, isLoading, isFetching, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}
