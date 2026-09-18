export function LoadingState({ label = 'Загружаем…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
      <span
        aria-hidden="true"
        className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary"
      />
      <p className="text-sm">{label}</p>
    </div>
  )
}

export default LoadingState