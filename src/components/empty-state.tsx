interface EmptyStateProps {
  message: string
  icon: string
}

export function EmptyState({ message, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-8 min-w-[320px]">
      <div className="text-5xl mb-4 opacity-50">{icon}</div>
      <h3 className="text-lg font-semibold text-[#2C3E50] text-center mb-2">{message}</h3>
      <p className="text-[#2C3E50]/70 text-center">Comienza agregando tu primer elemento</p>
    </div>
  )
}
