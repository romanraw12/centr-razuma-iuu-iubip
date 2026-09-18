import { useCallback, useEffect, useState } from 'react'
import { getSupabase } from '../lib/supabase'

/* ВОССТАНОВЛЕНО по контракту из hooks/index.ts:

     export { useSupabaseTable } from './useSupabaseTable';
     export type { UseSupabaseTableOptions } from './useSupabaseTable';

   Тонкая обёртка над таблицей базы данных проекта. */

export interface UseSupabaseTableOptions {
  /** Фильтр равенства: { category: 'tourism' }. */
  match?: Record<string, unknown>
  /** Колонка сортировки. */
  orderBy?: string
  /** Сортировать по убыванию. */
  ascending?: boolean
  /** Выполнять запрос сразу при монтировании. */
  enabled?: boolean
}

export function useSupabaseTable<T = Record<string, unknown>>(
  table: string,
  options: UseSupabaseTableOptions = {}
) {
  const { match, orderBy, ascending = true, enabled = true } = options

  const [rows, setRows] = useState<T[]>([])
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState<string | null>(null)

  const matchKey = JSON.stringify(match ?? null)

  const refresh = useCallback(async () => {
    const supabase = getSupabase()
    if (!supabase) {
      setLoading(false)
      setRows([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      let query = supabase.from(table).select('*')
      if (match) {
        for (const [column, value] of Object.entries(match)) {
          query = query.eq(column, value as never)
        }
      }
      if (orderBy) {
        query = query.order(orderBy, { ascending })
      }

      const { data, error: queryError } = await query
      if (queryError) {
        setError(queryError.message)
        setRows([])
        return
      }
      setRows((data as T[]) ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить данные')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [table, matchKey, orderBy, ascending, match])

  useEffect(() => {
    if (!enabled) return
    void refresh()
  }, [enabled, refresh])

  const insert = useCallback(
    async (values: Partial<T> | Partial<T>[]): Promise<T | null> => {
      const supabase = getSupabase()
      if (!supabase) {
        setError('База данных не подключена')
        return null
      }

      const payload = Array.isArray(values) ? values : [values]
      const { data, error: insertError } = await supabase
        .from(table)
        .insert(payload as never)
        .select()

      if (insertError) {
        setError(insertError.message)
        return null
      }

      await refresh()
      const inserted = (data as T[]) ?? []
      return inserted[0] ?? null
    },
    [table, refresh]
  )

  const update = useCallback(
    async (id: string | number, values: Partial<T>): Promise<boolean> => {
      const supabase = getSupabase()
      if (!supabase) {
        setError('База данных не подключена')
        return false
      }

      const { error: updateError } = await supabase
        .from(table)
        .update(values as never)
        .eq('id', id as never)

      if (updateError) {
        setError(updateError.message)
        return false
      }

      await refresh()
      return true
    },
    [table, refresh]
  )

  const remove = useCallback(
    async (id: string | number): Promise<boolean> => {
      const supabase = getSupabase()
      if (!supabase) {
        setError('База данных не подключена')
        return false
      }

      const { error: deleteError } = await supabase
        .from(table)
        .delete()
        .eq('id', id as never)

      if (deleteError) {
        setError(deleteError.message)
        return false
      }

      await refresh()
      return true
    },
    [table, refresh]
  )

  return { rows, loading, error, refresh, insert, update, remove }
}