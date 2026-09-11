/**
 * Reusable Button component.
 *
 * Props:
 *  - children: button label/content
 *  - variant: "primary" | "danger" | "success" | "secondary" (default: "primary")
 *  - size: "sm" | "md" (default: "md")
 *  - disabled: boolean
 *  - type: button type attribute (default: "button")
 *  - onClick: click handler
 *  - className: extra classes
 */
export default function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  type = "button",
  onClick,
  className = "",
}) {
  const base =
    "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-primary hover:bg-primary-hover text-white focus:ring-primary",
    danger:
      "bg-danger hover:bg-danger-hover text-white focus:ring-danger",
    success:
      "bg-success hover:bg-green-600 text-white focus:ring-success",
    secondary:
      "bg-gray-200 hover:bg-gray-300 text-foreground focus:ring-gray-400",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}
