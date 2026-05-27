"use client";

import AddEventForm from "@/components/AppComponents/AddEventForm";
import EventTimeline from "@/components/AppComponents/EventTimeline";
import Navbar from "@/components/AppComponents/Navbar";
import VerificationBadge from "@/components/AppComponents/VerificationBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGetUserQuery } from "@/redux/apis/authApi";
import { useGetProductQuery } from "@/redux/apis/productsApi";
import { EVENT_TYPE_LABELS } from "@/types/types";
import { USER_ROLES } from "@/utils/constants";
import { ArrowLeft, Loader2, Package } from "lucide-react";
import Link from "next/link";
import { use } from "react";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: user } = useGetUserQuery();
  const { data: product, isLoading, refetch } = useGetProductQuery(id);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Link href="/products">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Products
          </Button>
        </Link>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !product ? (
          <div className="text-center py-20 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Product not found.</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* Main content */}
            <div className="space-y-6">
              {/* Product header */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{product.name}</CardTitle>
                      <CardDescription className="mt-1">
                        SKU: {product.sku} · Partner: {product.partnerId}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-sm">
                      {EVENT_TYPE_LABELS[
                        product.currentStatus as keyof typeof EVENT_TYPE_LABELS
                      ] || product.currentStatus}
                    </Badge>
                  </div>
                  {product.description && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {product.description}
                    </p>
                  )}
                  <div className="mt-3">
                    <VerificationBadge productId={id} />
                  </div>
                </CardHeader>
              </Card>

              {/* Event timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Event Chain</CardTitle>
                  <CardDescription>
                    Hash-linked event history · {product.events?.length || 0}{" "}
                    blocks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EventTimeline events={product.events || []} />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar — Add event form (internal only) */}
            {user.role_id === USER_ROLES.INTERNAL && (
              <div>
                <Card className="sticky top-6">
                  <CardHeader>
                    <CardTitle className="text-base">Append Event</CardTitle>
                    <CardDescription>
                      Add a new block to the chain
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AddEventForm productId={id} onSuccess={() => refetch()} />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
