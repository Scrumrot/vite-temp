import { useCallback, useMemo } from 'react'
import { useShallow } from 'zustand/shallow'
import type { z } from 'zod'
import type { FormStoreHook, UseFieldArrayReturn } from '../types'
import { getValueAtPath } from '../utils/path'

/**
 * Hook for managing array fields with append, remove, move operations.
 *
 * @example
 * ```tsx
 * function ThingsField() {
 *   const { fields, append, remove } = useFieldArray(useUserForm, 'things')
 *
 *   return (
 *     <div>
 *       {fields.map((thing, index) => (
 *         <div key={index}>
 *           <TextField value={thing.name} />
 *           <Button onClick={() => remove(index)}>Remove</Button>
 *         </div>
 *       ))}
 *       <Button onClick={() => append({ name: '', numberOf: 0 })}>
 *         Add Thing
 *       </Button>
 *     </div>
 *   )
 * }
 * ```
 */
export const useFieldArray = <
  TSchema extends z.ZodObject<z.ZodRawShape>,
  TPath extends string,
  TItem = unknown,
>(
  useFormStore: FormStoreHook<TSchema>,
  path: TPath
): UseFieldArrayReturn<TItem> => {
  // Select the array value with shallow comparison
  const fields = useFormStore(
    useShallow((state) => (getValueAtPath(state.values, path) as TItem[]) ?? [])
  )

  // Get actions
  const setFieldValue = useFormStore((state) => state.setFieldValue)
  const setNestedFieldValue = useFormStore((state) => state.setNestedFieldValue)

  // Helper to update the array immutably
  const updateArray = useCallback(
    (updater: (current: TItem[]) => TItem[]) => {
      const currentArray = fields
      const newArray = updater(currentArray)

      // Determine if this is a root-level or nested path
      const parts = path.split('.')
      if (parts.length === 1) {
        // Root level array
        setFieldValue(path as keyof z.infer<TSchema>, newArray as never)
      } else {
        // Nested array - update via setNestedFieldValue
        setNestedFieldValue(path, newArray)
      }
    },
    [fields, path, setFieldValue, setNestedFieldValue]
  )

  // Array operations - all using functional/immutable patterns
  const append = useCallback(
    (value: TItem) => {
      updateArray((arr) => [...arr, value])
    },
    [updateArray]
  )

  const prepend = useCallback(
    (value: TItem) => {
      updateArray((arr) => [value, ...arr])
    },
    [updateArray]
  )

  const insert = useCallback(
    (index: number, value: TItem) => {
      updateArray((arr) => {
        const newArr = [...arr]
        newArr.splice(index, 0, value)
        return newArr
      })
    },
    [updateArray]
  )

  const remove = useCallback(
    (index: number) => {
      updateArray((arr) => arr.filter((_, i) => i !== index))
    },
    [updateArray]
  )

  const move = useCallback(
    (from: number, to: number) => {
      updateArray((arr) => {
        const newArr = [...arr]
        const [item] = newArr.splice(from, 1)
        newArr.splice(to, 0, item)
        return newArr
      })
    },
    [updateArray]
  )

  const update = useCallback(
    (index: number, value: TItem) => {
      updateArray((arr) => {
        const newArr = [...arr]
        newArr[index] = value
        return newArr
      })
    },
    [updateArray]
  )

  const replace = useCallback(
    (values: TItem[]) => {
      updateArray(() => values)
    },
    [updateArray]
  )

  // Return memoized result
  return useMemo(
    () => ({
      fields,
      append,
      prepend,
      insert,
      remove,
      move,
      update,
      replace,
    }),
    [fields, append, prepend, insert, remove, move, update, replace]
  )
}
