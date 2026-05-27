"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAddProductEventMutation } from "@/redux/apis/productsApi";
import { EVENT_TYPE_LABELS, EventType } from "@/types/types";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";

interface AddEventFormProps {
  productId: string;
  onSuccess?: () => void;
}

export default function AddEventForm({
  productId,
  onSuccess,
}: AddEventFormProps) {
  const [type, setType] = useState<string>("");
  const [location, setLocation] = useState("");
  const [metadataStr, setMetadataStr] = useState("");
  const [error, setError] = useState("");

  const [addEvent, { isLoading }] = useAddProductEventMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!type || !location) {
      setError("Event type and location are required.");
      return;
    }

    let metadata: Record<string, unknown> = {};
    if (metadataStr.trim()) {
      try {
        metadata = JSON.parse(metadataStr);
      } catch {
        setError("Metadata must be valid JSON.");
        return;
      }
    }

    try {
      await addEvent({
        id: productId,
        payload: {
          type,
          location,
          metadata,
        },
      }).unwrap();
      setType("");
      setLocation("");
      setMetadataStr("");
      onSuccess?.();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to add event.";
      setError(errorMessage as string);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="event-type">Event Type</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger id="event-type">
            <SelectValue placeholder="Select event type" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(EventType).map((et) => (
              <SelectItem key={et} value={et}>
                {EVENT_TYPE_LABELS[et]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Mumbai Warehouse"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="metadata">Metadata (optional JSON)</Label>
        <Textarea
          id="metadata"
          value={metadataStr}
          onChange={(e) => setMetadataStr(e.target.value)}
          placeholder='{"carrier": "BlueDart", "trackingId": "BD-12345"}'
          rows={3}
          className="font-mono text-sm"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Plus className="h-4 w-4 mr-2" />
        )}
        Append Event to Chain
      </Button>
    </form>
  );
}
