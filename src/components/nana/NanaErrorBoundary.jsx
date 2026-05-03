import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default class NanaErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("Nana chat error:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white dark:bg-[#1A1E25] rounded-2xl border border-[#E2E8F0] dark:border-[#2D2D2D] p-5 text-center shadow-sm">
          <AlertCircle className="w-8 h-8 text-[#FF6A00] mx-auto mb-2" />
          <p className="text-sm font-semibold text-[#1A1A1A] dark:text-white mb-1">Nana lagi error sebentar</p>
          <p className="text-xs text-[#8FA4C8] mb-3">Coba muat ulang chat-nya ya.</p>
          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6A00] text-white rounded-xl text-xs font-semibold hover:bg-[#e05e00] transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Muat ulang
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}