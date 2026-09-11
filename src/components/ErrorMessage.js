/**
 * ErrorMessage component.
 * Displays an error message in a styled alert box.
 */
export default function ErrorMessage({ message = "Something went wrong." }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
      <span className="font-medium">Error: </span>
      {message}
    </div>
  );
}
