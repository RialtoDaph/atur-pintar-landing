import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[9999] bg-[#0A0A0A] flex items-center justify-center p-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center">
            <div className="text-4xl mb-3">😕</div>
            <h2 className="text-base font-bold text-white mb-2">Terjadi kesalahan, coba lagi</h2>
            <p className="text-xs text-white/50 mb-5">
              Ada yang tidak beres saat memuat halaman. Coba muat ulang aplikasi.
            </p>
            <button
              onClick={this.handleReload}
              className="w-full py-3 bg-[#F97316] text-white rounded-xl font-bold text-sm active:scale-95 transition-transform mb-2"
            >
              Muat Ulang
            </button>
            <button
              onClick={this.handleRetry}
              className="w-full py-2 text-xs text-white/50 font-medium"
            >
              Coba tanpa muat ulang
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}