import { Route, Routes, useLocation, matchPath } from 'react-router-dom'
import { ThemeProvider } from '@/hooks/useTheme'
import { Toaster } from '@/components/ui/sonner'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import AdamAssistant from './components/AdamAssistant'
import { routes } from './routes'

/* ВОССТАНОВЛЕНО: файл не дошёл в дампе. Роутинг берётся из routes.tsx,
   чтобы App оставался тонким: он только раскладывает маршруты по раскладкам
   default/bare и подключает общие обёртки. */

function AppShell() {
  const location = useLocation()
  const active = routes.find((route) => matchPath(route.path, location.pathname))

  return (
    <div className="preload-guard" key={location.pathname}>
      <Routes>
        {routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <Layout layout={route.layout}>
                <ErrorBoundary>{route.element}</ErrorBoundary>
              </Layout>
            }
          />
        ))}
      </Routes>
      {active?.layout !== 'bare' && <AdamAssistant />}
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppShell />
      <Toaster position="top-right" />
    </ThemeProvider>
  )
}