import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'

/* ВОССТАНОВЛЕНО: файл не дошёл в дампе. Классовый предохранитель —
   React требует class component для componentDidCatch. */

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Ошибка на странице:', error, info.componentStack)
  }

  private reset = () => {
    this.setState({ error: null })
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children
    if (this.props.fallback) return this.props.fallback

    return (
      <div className="mx-auto my-16 max-w-xl rounded-2xl border bg-card p-8 text-center shadow-sm">
        <h2 className="text-xl font-semibold text-foreground">Что-то пошло не так</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Страница не смогла загрузиться. Попробуйте обновить её — если ошибка повторяется,
          сообщите владельцу сайта.
        </p>
        <p className="mt-4 rounded-md bg-muted px-3 py-2 text-left text-xs text-muted-foreground">
          {error.message}
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button variant="outline" onClick={this.reset}>
            Попробовать снова
          </Button>
          <Button onClick={() => window.location.reload()}>Обновить страницу</Button>
        </div>
      </div>
    )
  }
}

export default ErrorBoundary