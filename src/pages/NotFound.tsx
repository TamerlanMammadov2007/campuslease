import { Link } from "react-router-dom"
import { Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center space-y-6">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-200/90">404</p>
      <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">Page Not Found</h1>
      <p className="max-w-md text-slate-300/90">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Button asChild>
        <Link to="/" className="flex items-center gap-2">
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
      </Button>
    </div>
  )
}
