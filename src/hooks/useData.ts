import { useSupabaseTable, type UseSupabaseTableOptions } from './useSupabaseTable'

/* ВОССТАНОВЛЕНО по контракту из hooks/index.ts:

     export { useData, WRITE_ONLY_OK } from './useData';

   Единая точка доступа к данным проекта: сейчас это таблица базы данных,
   при необходимости сюда же добавляется локальное состояние. */

/**
 * Флаг «база проекта работает только на запись» — тогда интерфейс не должен
 * обещать чтение чужих записей и опирается на то, что вернул insert.
 */
export const WRITE_ONLY_OK = true

export interface UseDataOptions extends UseSupabaseTableOptions {
  /** Имя таблицы в базе проекта. */
  table: string
}

export function useData<T = Record<string, unknown>>(
  table: string,
  options: UseSupabaseTableOptions = {}
) {
  const result = useSupabaseTable<T>(table, options)

  return {
    data: result.rows,
    loading: result.loading,
    error: result.error,
    refresh: result.refresh,
    insert: result.insert,
    update: result.update,
    remove: result.remove,
    writeOnlyOk: WRITE_ONLY_OK,
  }
}