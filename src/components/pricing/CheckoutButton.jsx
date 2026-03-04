import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Xendit configuration
const XENDIT_PAYMENT_LINK = process.env.REACT_APP_XENDIT_PAYMENT_LINK || "";
const SUBSCRIPTION_PRICE = 39000; // IDR 39,000

export default function CheckoutButton({ user }) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    if (!user) {
      await base44.auth.redirectToLogin();
      return;
    }

    if (!XENDIT_PAYMENT_LINK) {
      alert("Payment configuration belum diatur. Hubungi admin.");
      return;
    }

    setLoading(true);
    try {
      // Build Xendit payment link with user data
      const paymentUrl = new URL(XENDIT_PAYMENT_LINK);
      paymentUrl.searchParams.append("customer_email", user.email);
      paymentUrl.searchParams.append("customer_name", user.full_name);
      paymentUrl.searchParams.append("user_id", user.id);
      paymentUrl.searchParams.append("amount", SUBSCRIPTION_PRICE.toString());

      // Redirect to Xendit payment
      window.location.href = paymentUrl.toString();
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Gagal memproses checkout. Silakan coba lagi.");
      setLoading(false);
    }
  }

  const isPremium = user?.subscription_status === "premium";
  const isExpired =
    user?.subscription_end_date &&
    new Date(user.subscription_end_date) < new Date();

  if (isPremium && !isExpired) {
    return (
      <Button disabled className="w-full bg-[#10B981] hover:bg-[#0a9967] text-white">
        ✓ Premium Active
      </Button>
    );
  }

  return (
    <Button
      onClick={handleCheckout}
      disabled={loading}
      className="w-full bg-[#FF6A00] hover:bg-[#e05e00] text-white"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Processing...
        </>
      ) : isExpired ? (
        "Renew Premium"
      ) : (
        "Upgrade to Premium"
      )}
    </Button>
  );
}