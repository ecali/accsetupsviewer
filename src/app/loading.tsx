export default function Loading() {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/20">
      <div className="h-14 w-14 animate-spin rounded-full border-4 border-[#23a936]/25 border-t-[#23a936]" />
    </div>
  );
}
