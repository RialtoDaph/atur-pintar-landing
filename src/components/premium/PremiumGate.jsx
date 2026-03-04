import { Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";

export default function PremiumGate({ user, children, feature = "This feature" }) {
  const isPremium = user?.subscription_status === "premium";
  const isExpired =
    user?.subscription_end_date &&
    new Date(user.subscription_end_date) < new Date();

  if (isPremium && !isExpired) {
    return children;
  }

  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] rounded-2xl p-8 text-center max-w-md border border-[#FF6A00]/30">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-[#FF6A00]/20 flex items-center justify-center">
            <Lock className="w-6 h-6 text-[#FF6A00]" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Premium Feature</h3>
        <p className="text-[#8FA4C8] text-sm mb-6">
          {feature} is only available for Premium members. Upgrade now to unlock AI-powered insights and advanced features.
        </p>
        <Button
          onClick={() => {
            if (!user) {
              window.location.href = createPageUrl("Pricing");
            } else {
              window.location.href = createPageUrl("Pricing");
            }
          }}
          className="w-full bg-[#FF6A00] hover:bg-[#e05e00] text-white mb-3"
        >
          <span>Upgrade to Premium</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        <p className="text-xs text-[#8FA4C8]">
          Hanya Rp 39.000/bulan • Cancel anytime
        </p>
      </div>
    </div>
  );
}