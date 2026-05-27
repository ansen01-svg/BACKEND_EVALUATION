"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiSlice } from "@/redux/api";
import { useGetUserQuery, useLogoutMutation } from "@/redux/apis/authApi";
import { USER_ROLES } from "@/utils/constants";
import { Loader2, LogOut, Package } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

export default function Navbar() {
  const router = useRouter();
  const { data: user, isLoading: isUserLoading } = useGetUserQuery();
  const [logout, { isLoading }] = useLogoutMutation();

  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await logout({}).unwrap();
    } catch {}

    dispatch(apiSlice.util.resetApiState());
    router.replace("/login");
  };

  if (isUserLoading) {
    return (
      <nav className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link
            href="/products"
            className="flex items-center gap-2 font-semibold"
          >
            <Package className="h-5 w-5" />
            <span>LW3 Supply Chain</span>
          </Link>
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link
          href="/products"
          className="flex items-center gap-2 font-semibold"
        >
          <Package className="h-5 w-5" />
          <span>LW3 Supply Chain</span>
        </Link>

        {user && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user.name}</span>
            <Badge
              variant={
                user.role_id === USER_ROLES.INTERNAL ? "default" : "secondary"
              }
            >
              {user.role_id === USER_ROLES.INTERNAL
                ? "Internal User"
                : user.role_id === USER_ROLES.PARTNER
                  ? "Partner User"
                  : "User"}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
