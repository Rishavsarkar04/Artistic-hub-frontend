import { formatPrice, calcTax, FREE_SHIPPING_MIN } from '@/lib/money';
import { useCartStore, useCartTotal } from '@/stores/cartStore';
import { deliveryMethods } from '@/data/shipping';

export function OrderSummary({ compact = false }: { compact?: boolean }) {
  const cart = useCartStore((s) => s.items);
  const cartTotal = useCartTotal();
  const shipping = cartTotal >= FREE_SHIPPING_MIN ? 0 : deliveryMethods[0].price;
  const tax = calcTax(cartTotal);
  const total = cartTotal + shipping + tax;

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="font-medium mb-4">Order Summary</h3>
      {!compact && (
        <div className="space-y-3 mb-4">
          {cart.map((item) => (
            <div key={`${item.productId}-${item.size.label}`} className="flex items-center gap-3">
              <div className="relative">
                <img src={item.product.image} alt={item.product.name} className="w-12 h-12 rounded-md object-cover bg-muted" />
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-muted-foreground text-card text-[10px] font-bold rounded-full flex items-center justify-center">
                  {item.quantity}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.product.name}</p>
                <p className="text-xs text-muted-foreground">{item.size.label} · {item.size.weight}</p>
              </div>
              <p className="text-sm font-medium">{formatPrice(item.size.price * item.quantity)}</p>
            </div>
          ))}
        </div>
      )}
      <div className="space-y-2 text-sm border-t border-border pt-4">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatPrice(cartTotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span>{shipping === 0 ? <span className="text-emerald-600 font-medium">Free</span> : formatPrice(shipping)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tax</span>
          <span>{formatPrice(tax)}</span>
        </div>
        <div className="border-t border-border pt-2 flex justify-between font-semibold text-base">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
}
