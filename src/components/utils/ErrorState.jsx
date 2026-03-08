import { AlertCircle, RefreshCw } from "lucide-react";
import { useAppSettings } from "@/components/utils/useAppSettings";

export default function ErrorState({ onRetry, message }) {
  const { t } = useAppSettings();
  return (
    <div
      role="alert"
      className="bg-white rounded-2xl p-8 text-center shadow-sm"
    >
      <AlertCircle className="w-10 h-10 text-[#FF6B6B] mx-auto mb-3" aria-hidden="true" />
      <p className="text-[#4A5568] font-semibold">{message || t("error_title")}</p>
      <p className="text-[#8FA4C8] text-sm mt-1">{t("error_desc")}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#FF6A00] text-white rounded-xl text-sm font-semibold hover:bg-[#e05e00] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A00] focus-visible:ring-offset-2"
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          {t("error_retry")}
        </button>
      )}
    </div>
  );
}