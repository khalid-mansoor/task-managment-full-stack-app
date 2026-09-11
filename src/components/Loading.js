/**
 * Loading spinner component.
 * Shows a centered spinner with an optional message.
 */
export default function Loading({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-muted text-sm">{message}</p>
    </div>
  );
}
