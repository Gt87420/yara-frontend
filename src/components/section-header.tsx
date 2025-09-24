interface SectionHeaderProps {
  title: string
  count: number
  icon: string
}

export function SectionHeader({ title, count, icon }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6 px-2">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <h2 className="text-2xl font-bold text-[#1E5631]">{title}</h2>
      </div>
      <div className="bg-[#4BAE4F] text-white px-3 py-1 rounded-full text-sm font-bold min-w-[32px] text-center">
        {count}
      </div>
    </div>
  )
}
