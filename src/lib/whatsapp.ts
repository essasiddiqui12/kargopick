import { CartItem, AppliedCoupon, Product, Order, OrderStatus } from "@/types";
import { formatPrice } from "@/data/products";

export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919876543210";

export function formatWhatsAppDisplay(phone = WHATSAPP_NUMBER): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    const local = digits.slice(2);
    return `+91 ${local.slice(0, 5)} ${local.slice(5)}`;
  }
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return `+${digits}`;
}

export function formatPhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

export function getWhatsAppUrl(message: string): string {
  const phone = WHATSAPP_NUMBER.replace(/\D/g, "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function getWhatsAppUrlForPhone(phone: string, message: string): string {
  return `https://wa.me/${formatPhoneForWhatsApp(phone)}?text=${encodeURIComponent(message)}`;
}

export function buildNewOrderAlertMessage(data: {
  orderId: string;
  items: { name: string; price: number; quantity: number }[];
  subtotal: number;
  discount?: number;
  couponCode?: string;
  total: number;
  customer: { name: string; phone: string; address: string };
  notes?: string;
}): string {
  const lines = [
    "🛒 *NEW ORDER — Kartix*",
    "",
    `*Order ID:* ${data.orderId}`,
    "",
    "*Customer Details*",
    `Name: ${data.customer.name}`,
    `Phone: ${data.customer.phone}`,
    `Address: ${data.customer.address}`,
    "",
    "*Order Items*",
    ...data.items.map(
      (item, i) =>
        `${i + 1}. *${item.name}*\n   Qty: ${item.quantity} × ${formatPrice(item.price)} = ${formatPrice(item.price * item.quantity)}`
    ),
    "",
    `Subtotal: ${formatPrice(data.subtotal)}`,
  ];

  if (data.discount && data.discount > 0) {
    lines.push(
      `Coupon${data.couponCode ? ` *${data.couponCode}*` : ""}: -${formatPrice(data.discount)}`
    );
  }

  lines.push(`*Total: ${formatPrice(data.total)}*`);

  if (data.notes) {
    lines.push("", `*Notes:* ${data.notes}`);
  }

  lines.push("", "_Please confirm this order. Thank you!_");
  return lines.join("\n");
}

export function buildOrderMessage(
  items: CartItem[],
  subtotal: number,
  orderId?: string,
  customer?: { name: string; phone: string; address: string },
  coupon?: AppliedCoupon,
  total?: number,
  notes?: string
): string {
  const finalTotal = total ?? subtotal - (coupon?.discount ?? 0);

  if (orderId && customer) {
    return buildNewOrderAlertMessage({
      orderId,
      items: items.map((item) => ({
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      })),
      subtotal,
      discount: coupon?.discount,
      couponCode: coupon?.code,
      total: finalTotal,
      customer,
      notes,
    });
  }

  const lines = [
    "Hi! I'd like to place an order from *Kartix*:",
    "",
    ...items.map(
      (item, i) =>
        `${i + 1}. *${item.product.name}*\n   Qty: ${item.quantity} × ${formatPrice(item.product.price)} = ${formatPrice(item.product.price * item.quantity)}`
    ),
    "",
    `*Total: ${formatPrice(finalTotal)}*`,
    "",
    "Please confirm my order. Thank you!",
  ];

  return lines.join("\n");
}

export function buildOrderAlertFromOrder(order: Order): string {
  return buildNewOrderAlertMessage({
    orderId: order.id,
    items: order.items,
    subtotal: order.subtotal ?? order.total,
    discount: order.discount,
    couponCode: order.couponCode,
    total: order.total,
    customer: {
      name: order.customerName,
      phone: order.phone,
      address: order.address,
    },
    notes: order.notes,
  });
}

export function buildCustomerReplyMessage(order: Order): string {
  return buildOrderStatusUpdateMessage(order, order.status);
}

export function buildOrderStatusUpdateMessage(
  order: Order,
  status: OrderStatus,
  siteUrl?: string
): string {
  const trackUrl = siteUrl
    ? `${siteUrl}/track-order?orderId=${encodeURIComponent(order.id)}&phone=${encodeURIComponent(order.phone)}`
    : undefined;

  const statusCopy: Record<
    OrderStatus,
    { emoji: string; headline: string; body: string } | null
  > = {
    pending: null,
    confirmed: {
      emoji: "✅",
      headline: "Order Confirmed",
      body: "Great news! Your order has been confirmed and we're preparing it for dispatch.",
    },
    shipped: {
      emoji: "🚚",
      headline: "Order Shipped",
      body: "Your order is on the way! It should arrive at your address soon.",
    },
    delivered: {
      emoji: "🎉",
      headline: "Order Delivered",
      body: "Your order has been delivered. Thank you for shopping with Kartix!",
    },
    cancelled: {
      emoji: "❌",
      headline: "Order Cancelled",
      body: "Your order has been cancelled. Reply to this message if you have any questions.",
    },
  };

  const copy = statusCopy[status];
  if (!copy) {
    return [
      `Hi ${order.customerName}!`,
      "",
      `Update on your Kartix order *${order.id}*:`,
      "",
      `*Status:* ${status}`,
      `*Total:* ${formatPrice(order.total)}`,
      "",
      trackUrl ? `Track your order: ${trackUrl}` : "",
      "",
      "Thank you for shopping with Kartix!",
    ]
      .filter(Boolean)
      .join("\n");
  }

  const lines = [
    `${copy.emoji} *${copy.headline} — Kartix*`,
    "",
    `Hi ${order.customerName}!`,
    "",
    copy.body,
    "",
    `*Order ID:* ${order.id}`,
    `*Total:* ${formatPrice(order.total)}`,
    `*Status:* ${status.charAt(0).toUpperCase() + status.slice(1)}`,
  ];

  if (trackUrl) {
    lines.push("", `Track your order anytime:`, trackUrl);
  }

  lines.push("", "— Team Kartix");
  return lines.join("\n");
}

export function shouldNotifyCustomerOnStatus(status: OrderStatus): boolean {
  return status !== "pending";
}

export function buildEnquiryMessage(): string {
  return "Hi! I'm interested in gym supplements and imported products from Kartix. Can you help me?";
}

export function getWhatsAppShareUrl(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

export function buildProductShareMessage(product: Product, url: string): string {
  const lines = [
    `Check out *${product.name}* on Kartix!`,
    "",
    `Price: ${formatPrice(product.price)}`,
  ];

  if (product.originalPrice && product.originalPrice > product.price) {
    const discount = Math.round(
      ((product.originalPrice - product.price) / product.originalPrice) * 100
    );
    lines.push(
      `Was: ${formatPrice(product.originalPrice)} (${discount}% off)`
    );
  }

  lines.push(
    `Rating: ${product.rating}/5 (${product.reviews} reviews)`,
    "",
    url,
    "",
    "Shop gym supplements & imported products at Kartix!"
  );

  return lines.join("\n");
}
