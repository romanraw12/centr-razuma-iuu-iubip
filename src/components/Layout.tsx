import type { ReactNode } from 'react'
import Navigation from './Navigation'
import Footer from './Footer'
import { ScrollToTop } from './ScrollToTop'

/* ВОССТАНОВЛЕНО: файл не дошёл в дампе. Раскладка соответствует полю
   `layout: 'default' | 'bare'` из RouteConfig в routes.tsx:
   default — с шапкой и подвалом, bare — только контент (чтение, вход). */

export function Layout({
  children,
  layout = 'default',
}: {
  children: ReactNode
  layout?: 'default' | 'bare'
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <ScrollToTop />

      {layout === 'default' && <Navigation />}

      <main className={layout === 'default' ? 'flex-1' : 'flex-1 bg-background'}>
        {children}
      </main>

      {layout === 'default' && <Footer />}
    </div>
  )
}

export default Layout