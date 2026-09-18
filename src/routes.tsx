import * as React from 'react'
import Home from './pages/Home'
import Book from './pages/Book'
import Reader from './pages/Reader'
import PostEditor from './pages/PostEditor'
import Login from './pages/Login'
import Signup from './pages/Signup'
import NotFound from './pages/NotFound'
import { ProtectedRoute } from './components/ProtectedRoute'

export interface RouteConfig {
  path: string
  label: string
  element: React.ReactNode
  showInNav: boolean
  layout: 'default' | 'bare'
}

export const routes: RouteConfig[] = [
  {
    path: '/',
    label: 'Каталог',
    element: <Home />,
    showInNav: true,
    layout: 'default'
  },
  {
    path: '/book/:id',
    label: 'Книга',
    element: <Book />,
    showInNav: false,
    layout: 'default'
  },
  {
    path: '/read/:id',
    label: 'Чтение',
    element: <Reader />,
    showInNav: false,
    layout: 'bare'
  },
  {
    path: '/editor',
    label: 'Добавить книгу',
    element: <ProtectedRoute><PostEditor /></ProtectedRoute>,
    showInNav: false,
    layout: 'default'
  },
  {
    path: '/editor/:id',
    label: 'Редактирование книги',
    element: <ProtectedRoute><PostEditor /></ProtectedRoute>,
    showInNav: false,
    layout: 'default'
  },
  {
    path: '/login',
    label: 'Вход',
    element: <Login />,
    showInNav: false,
    layout: 'bare'
  },
  {
    path: '/signup',
    label: 'Регистрация',
    element: <Signup />,
    showInNav: false,
    layout: 'bare'
  },
  {
    path: '*',
    label: '404',
    element: <NotFound />,
    showInNav: false,
    layout: 'default'
  }
]