"use client";

import { Badge } from "@/components/ui/badge";
import { useVerifyProductQuery } from "@/redux/apis/productsApi";
import { Loader2, ShieldAlert, ShieldCheck } from "lucide-react";

interface VerificationBadgeProps {
  productId: string;
}

export default function VerificationBadge({
  productId,
}: VerificationBadgeProps) {
  const { data, isLoading, error } = useVerifyProductQuery(productId);

  if (isLoading) {
    return (
      <Badge variant="outline" className="gap-1">
        <Loader2 className="h-3 w-3 animate-spin" /> Verifying...
      </Badge>
    );
  }

  if (error || !data) {
    return (
      <Badge variant="destructive" className="gap-1">
        <ShieldAlert className="h-3 w-3" /> Verification failed
      </Badge>
    );
  }

  if (data.valid) {
    return (
      <Badge className="gap-1 bg-emerald-600 hover:bg-emerald-700">
        <ShieldCheck className="h-3 w-3" /> Chain verified ({data.totalEvents}{" "}
        events)
      </Badge>
    );
  }

  return (
    <Badge variant="destructive" className="gap-1">
      <ShieldAlert className="h-3 w-3" /> Chain broken at event #
      {data.brokenAt?.sequenceNumber}
    </Badge>
  );
}
