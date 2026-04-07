import DashboardHeader from "@/components/DashboardHeader";
import Navigation from "@/components/Navigation";
import { ToastProvider } from "@/components/Toast";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-100">
        <DashboardHeader />
        <div className="mx-auto max-w-7xl px-6 py-8">
          <Navigation />
          {children}
        </div>
      </div>
    </ToastProvider>
  );
}
