import { Link, NavLink, useNavigate } from "react-router-dom"
import {
  Building2,
  Heart,
  Home,
  LogOut,
  MapPin,
  MessageSquare,
  PlusCircle,
  UserCircle,
  Users,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useApp } from "@/context/AppContext"

const navItems = [
  { to: "/browse", label: "Browse Properties", icon: Home },
  { to: "/map", label: "Map View", icon: MapPin },
  { to: "/roommates", label: "Find Roommates", icon: Users },
  { to: "/inbox", label: "Inbox", icon: MessageSquare },
  { to: "/favorites", label: "My Favorites", icon: Heart },
  { to: "/create", label: "List Your Property", icon: PlusCircle },
  { to: "/listings", label: "My Listings", icon: Building2 },
  { to: "/profile", label: "My Profile", icon: UserCircle },
]

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { currentUserName, currentUserEmail, isAuthenticated, logout } = useApp()
  const navigate = useNavigate()

  return (
    <aside className="flex h-full flex-col border-r border-white/10 bg-white/5 px-4 py-6 backdrop-blur-xl">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-amber-400 text-slate-900 shadow-lg shadow-orange-500/30">
          <Building2 size={26} />
        </div>
        <div>
          <p className="text-lg font-semibold text-white">CampusLease</p>
          <p className="text-xs text-slate-300">Student Housing</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10",
                isActive && "bg-gradient-to-r from-orange-400 to-amber-300 text-slate-900 shadow-lg shadow-orange-500/30",
              )
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/10 p-4 text-sm text-slate-200">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-300" />
          <div className="min-w-0">
            <p className="truncate font-semibold text-white">{currentUserName}</p>
            <p className="truncate text-xs text-slate-300">{currentUserEmail}</p>
          </div>
        </div>
        {isAuthenticated ? (
          <button
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-slate-900/50 py-2 text-xs font-semibold text-white hover:bg-slate-900"
            onClick={() => {
              void logout().then(() => {
                onNavigate?.()
                navigate("/")
              })
            }}
          >
            <LogOut size={14} />
            Logout
          </button>
        ) : (
          <Link
            to="/login"
            onClick={onNavigate}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-slate-900/50 py-2 text-xs font-semibold text-white hover:bg-slate-900"
          >
            Log In
          </Link>
        )}
      </div>
    </aside>
  )
}
