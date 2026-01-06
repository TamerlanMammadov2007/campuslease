import { cn } from "@/lib/utils"

type SectionHeaderProps = {
  eyebrow?: string
  title: string
  subtitle?: string
  className?: string
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-300">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-3xl font-semibold text-white md:text-4xl">{title}</h2>
      {subtitle ? (
        <p className="max-w-2xl text-sm text-slate-300 md:text-base">
          {subtitle}
        </p>
      ) : null}
    </div>
  )
}
