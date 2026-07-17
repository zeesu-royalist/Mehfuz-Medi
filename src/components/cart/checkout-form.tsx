"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { createAddress, placeOrder, type AddressInput } from "@/app/(store)/checkout/actions";
import { formatPrice } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Plus, RefreshCw, ShoppingCart, Truck } from "lucide-react";

interface Address {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

interface CartItem {
  productId: string;
  quantity: number;
  name: string;
  price: number;
  imageUrl: string;
  size: string | null;
}

interface CheckoutFormProps {
  initialAddresses: Address[];
  cartItems: CartItem[];
}

export function CheckoutForm({ initialAddresses, cartItems }: CheckoutFormProps) {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    initialAddresses.find((a) => a.isDefault)?.id || initialAddresses[0]?.id || null
  );
  const [showAddForm, setShowAddForm] = useState(initialAddresses.length === 0);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressInput>();

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.18;
  const shipping = subtotal >= 999 ? 0 : 99;
  const grandTotal = subtotal + tax + shipping;

  const handleAddAddress = async (data: AddressInput) => {
    startTransition(async () => {
      const res = await createAddress(data);
      if (!res.success) {
        toast.error(res.error || "Failed to add address.");
      } else if (res.data) {
        toast.success("Address added successfully.");
        const newAddress = res.data;
        setAddresses((prev) => [newAddress, ...prev]);
        setSelectedAddressId(newAddress.id);
        setShowAddForm(false);
        reset();
      }
    });
  };

  const handlePlaceOrder = () => {
    if (!selectedAddressId) {
      toast.error("Please select a shipping address first.");
      return;
    }

    startTransition(async () => {
      const res = await placeOrder(selectedAddressId);
      if (!res.success) {
        toast.error(res.error || "Failed to place order.");
      } else {
        toast.success("Order placed successfully! Thank you.");
        router.push("/account/orders");
      }
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-3 items-start">
      {/* ── Left side: Delivery Info (2 cols) ── */}
      <div className="lg:col-span-2 space-y-6">
        {/* Address selection grid */}
        {addresses.length > 0 && (
          <div className="rounded-md border border-border bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-md font-bold text-brand-ink">Select Shipping Address</h2>
              {!showAddForm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="text-xs font-semibold text-brand-red flex items-center gap-1 hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" /> Add New Address
                </button>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {addresses.map((addr) => {
                const isSelected = selectedAddressId === addr.id;
                return (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`relative rounded-sm border p-4 cursor-pointer transition-all ${
                      isSelected
                        ? "border-brand-ink ring-1 ring-brand-ink bg-slate-50/30"
                        : "border-border hover:border-brand-ink bg-white"
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute right-3 top-3 h-5 w-5 bg-brand-ink text-white rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                    <p className="font-bold text-sm text-brand-ink">{addr.fullName}</p>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      {addr.line1}
                      {addr.line2 && `, ${addr.line2}`}
                      <br />
                      {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    <p className="text-[10px] text-brand-ink/80 font-bold mt-2">
                      Tel: {addr.phone}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Add Address Form */}
        {showAddForm && (
          <div className="rounded-md border border-border bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-md font-bold text-brand-ink">
                {addresses.length === 0 ? "Delivery Address" : "New Address Details"}
              </h2>
              {addresses.length > 0 && (
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-muted-foreground hover:underline"
                >
                  Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit(handleAddAddress)} className="space-y-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="e.g. Jordan Lee"
                    {...register("fullName", { required: "Name is required." })}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-destructive">{errors.fullName.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="e.g. 9876543210"
                    {...register("phone", {
                      required: "Phone is required.",
                      pattern: {
                        value: /^\d{10}$/,
                        message: "Enter a valid 10-digit number.",
                      },
                    })}
                  />
                  {errors.phone && (
                    <p className="text-xs text-destructive">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="line1">Address line 1</Label>
                <Input
                  id="line1"
                  placeholder="e.g. Apartment, Suite, Street Address"
                  {...register("line1", { required: "Address line 1 is required." })}
                />
                {errors.line1 && (
                  <p className="text-xs text-destructive">{errors.line1.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="line2">Address line 2 (Optional)</Label>
                <Input id="line2" placeholder="e.g. Landmark, locality" {...register("line2")} />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="Mumbai"
                    {...register("city", { required: "City is required." })}
                  />
                  {errors.city && (
                    <p className="text-xs text-destructive">{errors.city.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    placeholder="Maharashtra"
                    {...register("state", { required: "State is required." })}
                  />
                  {errors.state && (
                    <p className="text-xs text-destructive">{errors.state.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    placeholder="400001"
                    {...register("pincode", {
                      required: "Pincode is required.",
                      pattern: { value: /^\d{6}$/, message: "Valid 6-digit pin code." },
                    })}
                  />
                  {errors.pincode && (
                    <p className="text-xs text-destructive">{errors.pincode.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  {...register("isDefault")}
                  className="h-4 w-4 rounded border-gray-300 text-brand-red focus:ring-brand-red"
                />
                <Label htmlFor="isDefault" className="cursor-pointer text-xs">
                  Set as Default Address
                </Label>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Saving Address..." : "Save Delivery Address"}
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* ── Right side: Order Summary & Place Order ── */}
      <div className="space-y-5">
        {/* Order review list */}
        <div className="rounded-md border border-border bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-md font-bold text-brand-ink border-b pb-2 uppercase tracking-wider flex items-center gap-1.5">
            <ShoppingCart className="h-4.5 w-4.5" /> Review Items
          </h3>
          <div className="divide-y max-h-60 overflow-y-auto pr-1">
            {cartItems.map((item) => (
              <div key={item.productId} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                <div className="h-14 w-10 overflow-hidden bg-muted rounded-sm border shrink-0">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-brand-ink truncate">{item.name}</p>
                  <p className="text-[10px] text-muted-foreground font-bold mt-0.5 uppercase tracking-wider">
                    Qty: {item.quantity} {item.size && `| Size: ${item.size}`}
                  </p>
                  <p className="text-xs font-bold text-brand-ink mt-1">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Checkout Cost Breakdown */}
        <div className="rounded-md border border-border bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-md font-bold text-brand-ink border-b pb-2 uppercase tracking-wider">
            Bill Details
          </h3>

          <div className="space-y-3 text-xs font-semibold text-brand-ink">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Items Total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax (GST 18%)</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping Fee</span>
              <span>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
            </div>
            <div className="border-t pt-3 flex justify-between text-sm font-bold border-dashed border-border">
              <span>Payable Amount</span>
              <span className="text-brand-red">{formatPrice(grandTotal)}</span>
            </div>
          </div>

          <Button
            onClick={handlePlaceOrder}
            disabled={isPending || showAddForm || !selectedAddressId}
            className="w-full h-11 font-bold text-xs uppercase tracking-wider mt-2 flex items-center justify-center gap-1.5"
          >
            {isPending ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" /> Placing Order...
              </>
            ) : (
              <>
                <Truck className="h-4.5 w-4.5" /> Place Order (COD)
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
