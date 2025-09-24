interface StatsCardProps {
  title: string
  value: number
  icon: string
}

export function StatsCard({ title, value, icon }: StatsCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#E8EAE6] hover:shadow-xl transition-all duration-300 hover:-translate-y-1 transform-gpu">
      <div className="text-center">
        <div className="text-3xl mb-3">{icon}</div>
        <div className="text-3xl font-bold text-[#1E5631] mb-2">{value}</div>
        <div className="text-sm text-[#2C3E50] font-medium">{title}</div>
      </div>
    </div>
  )
}
