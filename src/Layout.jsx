import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { LayoutDashboard, Target } from "lucide-react";

export default function Layout({ children, currentPageName }) {
  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
    { name: "Goals", icon: Target, page: "Goals" },
  ];

  return (
    <div className="min-h-screen bg-[#F7F6F3] font-sans pb-20 sm:pb-0">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; }
        * { -webkit-font-smoothing: antialiased; }
      `}</style>

      {/* Desktop sidebar */}
      <div className="hidden sm:flex fixed left-0 top-0 h-full w-56 bg-white border-r border-[#EFEFED] flex-col px-4 py-8 z-40">
        <div className="mb-10 px-2">
          <p className="text-lg font-bold text-[#1A1A1A] tracking-tight">SaveWise</p>
          <p className="text-xs text-[#9B9B9B] mt-0.5">Your savings companion</p>
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = currentPageName === item.page || (currentPageName === "Goals" && item.page === "Goals");
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? "bg-[#1A1A1A] text-white"
                    : "text-[#9B9B9B] hover:text-[#1A1A1A] hover:bg-[#F7F6F3]"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="sm:ml-56">
        {children}
      </div>

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 sm:hidden bg-white border-t border-[#EFEFED] flex z-40">
        {navItems.map((item) => {
          const active = currentPageName === item.page;
          return (
            <Link
              key={item.page}
              to={createPageUrl(item.page)}
              className={`flex-1 flex flex-col items-center py-3 gap-1 text-xs font-medium transition-colors ${
                active ? "text-[#1A1A1A]" : "text-[#9B9B9B]"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}