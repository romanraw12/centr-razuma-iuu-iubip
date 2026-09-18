import { Link, NavLink } from 'react-router-dom'
import { Library, LogIn, LogOut, PenLine } from 'lucide-react'
import { routes } from '../routes'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from './ThemeToggle'

/* ВОССТАНОВЛЕНО: файл не дошёл в дампе. Пункты меню берутся из routes.tsx
   по showInNav — так порядок и подписи остаются в одном месте. */

export function Navigation() {
  const { isAuthenticated, signOut } = useAuth()
  const navItems = routes.filter((route) => route.showInNav)

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold text-foreground">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Library className="h-4 w-4" />
          </span>
          <span className="hidden sm:inline">Центр разума ЮУ ИУБиП</span>
        </Link>

        <nav className="ml-2 flex items-center gap-1">
          {navItems.map((route) => (
            <NavLink
              key={route.path}
              to={route.path}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              {route.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link to="/editor">
                  <PenLine className="mr-2 h-4 w-4" />
                  Добавить книгу
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => void signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                Выйти
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link to="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Войти
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navigation