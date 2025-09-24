"use client"

interface ModernCardProps {
  title: string
  detail: string
  type: "cultivo" | "insumo" | "parcela"
  onPress: () => void
}

export function ModernCard({ title, detail, type, onPress }: ModernCardProps) {
  const getIcon = () => {
    switch (type) {
      case "cultivo":
        return "🌱"
      case "insumo":
        return "📦"
      case "parcela":
        return "🏞️"
      default:
        return "📋"
    }
  }

  const getStatusColor = () => {
    if (type === "cultivo") {
      const etapa = detail?.toLowerCase()
      if (etapa?.includes("germinación")) return "#A7C97B"
      if (etapa?.includes("crecimiento")) return "#4BAE4F"
      if (etapa?.includes("floración")) return "#1E5631"
      return "#A7C97B"
    }
    if (type === "insumo") {
      const cantidad = Number.parseInt(detail)
      if (cantidad > 50) return "#4BAE4F"
      if (cantidad > 20) return "#A7C97B"
      return "#FF6B6B"
    }
    return "#4BAE4F"
  }

  return (
    <div
      className="bg-white rounded-2xl p-5 shadow-lg border-l-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 transform-gpu cursor-pointer min-w-[280px] relative"
      style={{ borderLeftColor: getStatusColor() }}
      onClick={onPress}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-[#F1FDFD] rounded-xl flex items-center justify-center">
          <span className="text-xl">{getIcon()}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-[#1E5631] truncate mb-1">{title}</h3>
          <p className="text-[#2C3E50] font-medium">{detail}</p>
        </div>
      </div>
      <div className="absolute top-3 right-3 w-2 h-2 rounded-full" style={{ backgroundColor: getStatusColor() }} />
    </div>
  )
}
