export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-brand-600" />
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  );
}
