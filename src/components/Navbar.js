import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-card-bg border-b border-border sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / App Name */}
          <Link
            href="/"
            className="text-xl font-bold text-primary hover:text-primary-hover"
          >
            📋 Task Manager
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-secondary hover:text-foreground font-medium text-sm"
            >
              Dashboard
            </Link>
            <Link
              href="/tasks/new"
              className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              + Add Task
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
