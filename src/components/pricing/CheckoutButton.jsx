import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";

const STRIPE_KEY = "pk_live_YOUR_STRIPE_PUBLIC_KEY"; // Replace with your public key
const STRIPE_PRICE_ID = "price_1P8z8eL3VzLEzNQwHn8vQkOx";

export default function CheckoutButton({ user }) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    if (!user) {
      await base44.auth.redirectToLogin();
      return;
    }

    setLoading(true);
    try {
      const stripe = await loadStripe(STRIPE_KEY);

      const { error } = await stripe.redirectToCheckout({
        lineItems: [
          {
            price: STRIPE_PRICE_ID,
            quantity: 1,
          },
        ],
        mode: "subscription",
        successUrl: `${window.location.origin}/dashboard?payment=success`,
        cancelUrl: `${window.location.origin}/pricing?payment=cancelled`,
        customerEmail: user.email,
        locale: "id",
      });

      if (error) {
        console.error("Stripe error:", error);
        alert("Gagal membuka Stripe checkout. Silakan coba lagi.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
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