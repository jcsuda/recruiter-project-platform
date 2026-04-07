import SearchBuilder from "@/components/SearchBuilder";

export default function SearchPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">HIRELab</h1>
        <p className="text-sm text-gray-500">
          Generate precise search queries for LinkedIn, GitHub, Stack Overflow,
          and other platforms. Build complex Boolean searches to find qualified
          candidates efficiently.
        </p>
      </div>

      <SearchBuilder />
    </>
  );
}
