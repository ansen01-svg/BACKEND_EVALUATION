"use client";

import CreateProductDialog from "@/components/AppComponents/CreateProductDialog";
import Navbar from "@/components/AppComponents/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetUserQuery } from "@/redux/apis/authApi";
import { useGetProductsQuery } from "@/redux/apis/productsApi";
import { EVENT_TYPE_LABELS, EventType } from "@/types/types";
import { USER_ROLES } from "@/utils/constants";
import { ChevronRight, Filter, Loader2, Package, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const STATUS_COLORS: Record<string, string> = {
  manufactured: "bg-blue-100 text-blue-800",
  in_transit: "bg-amber-100 text-amber-800",
  shipped: "bg-purple-100 text-purple-800",
  received: "bg-green-100 text-green-800",
  inspected: "bg-cyan-100 text-cyan-800",
  stored: "bg-slate-100 text-slate-800",
  sold: "bg-emerald-100 text-emerald-800",
  returned: "bg-orange-100 text-orange-800",
  recycled: "bg-teal-100 text-teal-800",
  recalled: "bg-red-100 text-red-800",
  disposed: "bg-gray-100 text-gray-800",
};

export default function ProductsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [cursors, setCursors] = useState<string[]>([]);
  const currentCursor = cursors[cursors.length - 1];

  const { data: user } = useGetUserQuery();
  const { data, isLoading, isFetching } = useGetProductsQuery({
    cursor: currentCursor,
    limit: 20,
    ...(statusFilter && { status: statusFilter }),
  });

  const handleNextPage = () => {
    if (data?.pagination.nextCursor) {
      setCursors((prev) => [...prev, data.pagination.nextCursor!]);
    }
  };

  const handlePrevPage = () => {
    setCursors((prev) => prev.slice(0, -1));
  };

  const clearFilters = () => {
    setStatusFilter("");
    setCursors([]);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Products</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {user.role_id === USER_ROLES.PARTNER
                ? `Showing products for ${user.partnerId}`
                : "All products across partners"}
            </p>
          </div>
          {user.role_id === USER_ROLES.INTERNAL && <CreateProductDialog />}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v);
              setCursors([]);
            }}
          >
            <SelectTrigger className="w-45">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(EventType).map((et) => (
                <SelectItem key={et} value={et}>
                  {EVENT_TYPE_LABELS[et]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {statusFilter && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-3 w-3 mr-1" /> Clear
            </Button>
          )}
        </div>

        {/* Product list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !data?.data.length ? (
          <div className="text-center py-20 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No products found.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-3">
              {data.data.map(
                (product: {
                  _id: string;
                  name: string;
                  currentStatus: EventType | string;
                  sku: string;
                  partnerId: string;
                  createdAt: string | number | Date;
                }) => (
                  <Link key={product._id} href={`/products/${product._id}`}>
                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                      <CardContent className="flex items-center justify-between py-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base">
                              {product.name}
                            </CardTitle>
                            <Badge
                              variant="outline"
                              className={`text-xs ${STATUS_COLORS[product.currentStatus] || ""}`}
                            >
                              {EVENT_TYPE_LABELS[
                                product.currentStatus as EventType
                              ] || product.currentStatus}
                            </Badge>
                          </div>
                          <CardDescription className="mt-1">
                            SKU: {product.sku} · Partner: {product.partnerId} ·{" "}
                            {new Date(product.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                      </CardContent>
                    </Card>
                  </Link>
                ),
              )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={cursors.length === 0 || isFetching}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {cursors.length + 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={!data?.pagination.hasMore || isFetching}
              >
                {isFetching ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  "Next"
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
