"use client";

import { Badge } from "@/components/ui/badge";
import { EVENT_TYPE_LABELS, ProductEvent } from "@/types/types";
import {
  AlertTriangle,
  CheckCircle,
  Package,
  RotateCcw,
  Search,
  ShoppingCart,
  Trash2,
  Truck,
  Warehouse,
} from "lucide-react";

const EVENT_ICONS: Record<string, React.ReactNode> = {
  manufactured: <Package className="h-4 w-4" />,
  in_transit: <Truck className="h-4 w-4" />,
  shipped: <Truck className="h-4 w-4" />,
  received: <CheckCircle className="h-4 w-4" />,
  inspected: <Search className="h-4 w-4" />,
  stored: <Warehouse className="h-4 w-4" />,
  sold: <ShoppingCart className="h-4 w-4" />,
  returned: <RotateCcw className="h-4 w-4" />,
  recycled: <RotateCcw className="h-4 w-4" />,
  recalled: <AlertTriangle className="h-4 w-4" />,
  disposed: <Trash2 className="h-4 w-4" />,
};

const EVENT_COLORS: Record<string, string> = {
  manufactured: "bg-blue-500",
  in_transit: "bg-amber-500",
  shipped: "bg-purple-500",
  received: "bg-green-500",
  inspected: "bg-cyan-500",
  stored: "bg-slate-500",
  sold: "bg-emerald-600",
  returned: "bg-orange-500",
  recycled: "bg-teal-500",
  recalled: "bg-red-500",
  disposed: "bg-gray-600",
};

interface EventTimelineProps {
  events: ProductEvent[];
}

export default function EventTimeline({ events }: EventTimelineProps) {
  if (!events.length) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No events recorded yet.
      </p>
    );
  }

  return (
    <div className="space-y-0">
      {events.map((event, index) => (
        <div key={event._id} className="relative">
          {/* Connector line */}
          {index < events.length - 1 && (
            <div className="absolute left-4.75 top-10 bottom-0 w-px bg-border" />
          )}

          <div className="flex gap-4 pb-8">
            {/* Icon dot */}
            <div
              className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white ${
                EVENT_COLORS[event.type] || "bg-gray-500"
              }`}
            >
              {EVENT_ICONS[event.type] || <Package className="h-4 w-4" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm">
                  {EVENT_TYPE_LABELS[event.type] || event.type}
                </span>
                <Badge variant="outline" className="text-xs font-mono">
                  #{event.sequenceNumber}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground mt-0.5">
                {event.location}
              </p>

              <p className="text-xs text-muted-foreground mt-1">
                {new Date(event.timestamp).toLocaleString()}
              </p>

              {/* Metadata */}
              {event.metadata && Object.keys(event.metadata).length > 0 && (
                <div className="mt-2 rounded-md bg-muted/50 p-2 text-xs">
                  {Object.entries(event.metadata).map(([key, value]) => (
                    <div key={key} className="flex gap-2">
                      <span className="text-muted-foreground">{key}:</span>
                      <span className="font-mono">{String(value)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Hash chain info */}
              <div className="mt-2 space-y-0.5">
                {event.previousHash && (
                  <p className="text-[10px] font-mono text-muted-foreground truncate">
                    <span className="text-muted-foreground/60">prev: </span>
                    {event.previousHash}
                  </p>
                )}
                <p className="text-[10px] font-mono text-muted-foreground truncate">
                  <span className="text-muted-foreground/60">hash: </span>
                  {event.hash}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
