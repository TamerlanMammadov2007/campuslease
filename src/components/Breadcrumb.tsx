import { Home, ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"

type BreadcrumbItem = {
  label: string
  href?: string
}

type BreadcrumbProps = {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-6">
      <Link to="/" className="flex items-center gap-1 hover:text-white transition-colors">
        <Home className="w-4 h-4" />
        <span>Home</span>
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          {item.href ? (
            <Link to={item.href} className="hover:text-white transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-white font-semibold">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
