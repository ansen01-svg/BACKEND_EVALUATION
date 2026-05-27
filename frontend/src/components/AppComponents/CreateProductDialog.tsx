"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { useGetPartnersQuery } from "@/redux/apis/partnersApi";
import { useCreateProductMutation } from "@/redux/apis/productsApi";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";

export default function CreateProductDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [partnerId, setPartnerId] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");

  const [createProduct, { isLoading }] = useCreateProductMutation();
  const { data: partnerIds, isLoading: isLoadingPartners } =
    useGetPartnersQuery();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !sku || !partnerId) {
      setError("Name, SKU, and Partner ID are required.");
      return;
    }

    try {
      await createProduct({
        name,
        sku,
        partnerId,
        ...(description && { description }),
        ...(location && { location }),
      }).unwrap();

      // Reset form and close dialog
      setName("");
      setSku("");
      setPartnerId("");
      setDescription("");
      setLocation("");
      setOpen(false);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create product.";
      setError(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Product
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Register New Product</DialogTitle>
          <DialogDescription>
            This creates a product with a genesis &quot;manufactured&quot; event
            as the first block in the chain.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="prod-name">Product Name *</Label>
            <Input
              id="prod-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Lakadong Turmeric Batch #2024-B"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="prod-sku">SKU *</Label>
              <Input
                id="prod-sku"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. LT-2024-002"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prod-partner">Partner ID *</Label>

              <Select
                value={partnerId}
                onValueChange={setPartnerId}
                disabled={isLoadingPartners}
              >
                <SelectTrigger id="prod-partner">
                  <SelectValue
                    placeholder={
                      isLoadingPartners
                        ? "Loading partners..."
                        : "Select partner"
                    }
                  />
                </SelectTrigger>

                <SelectContent>
                  {partnerIds?.map((id) => (
                    <SelectItem key={id} value={id}>
                      {id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prod-desc">Description</Label>
            <Textarea
              id="prod-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional product description"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prod-location">Manufacturing Location</Label>
            <Input
              id="prod-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Jowai, Meghalaya"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Register Product
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
