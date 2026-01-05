import { useState, useMemo } from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import TableSortLabel from '@mui/material/TableSortLabel'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import InputAdornment from '@mui/material/InputAdornment'
import SearchIcon from '@mui/icons-material/Search'

type Order = 'asc' | 'desc'

export interface Column<T> {
  id: keyof T | string
  label: string
  minWidth?: number
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  searchable?: boolean
  format?: (value: unknown, row: T) => React.ReactNode
  getValue?: (row: T) => unknown
}

export interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  title?: string
  defaultRowsPerPage?: number
  rowsPerPageOptions?: number[]
  searchable?: boolean
  searchPlaceholder?: string
  stickyHeader?: boolean
  maxHeight?: number | string
  onRowClick?: (row: T, index: number) => void
  getRowId?: (row: T) => string | number
  emptyMessage?: string
  dense?: boolean
}

function getNestedValue<T>(obj: T, path: string): unknown {
  return path.split('.').reduce((acc: unknown, part: string) => {
    if (acc && typeof acc === 'object' && part in acc) {
      return (acc as Record<string, unknown>)[part]
    }
    return undefined
  }, obj)
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T | string, getValue?: (row: T) => unknown): number {
  const aValue = getValue ? getValue(a) : getNestedValue(a, orderBy as string)
  const bValue = getValue ? getValue(b) : getNestedValue(b, orderBy as string)

  if (bValue == null && aValue == null) return 0
  if (bValue == null) return -1
  if (aValue == null) return 1

  if (bValue < aValue) return -1
  if (bValue > aValue) return 1
  return 0
}

function getComparator<T>(
  order: Order,
  orderBy: keyof T | string,
  getValue?: (row: T) => unknown
): (a: T, b: T) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy, getValue)
    : (a, b) => -descendingComparator(a, b, orderBy, getValue)
}

export default function DataTable<T>({
  columns,
  data,
  title,
  defaultRowsPerPage = 10,
  rowsPerPageOptions = [5, 10, 25, 50],
  searchable = true,
  searchPlaceholder = 'Search...',
  stickyHeader = true,
  maxHeight,
  onRowClick,
  getRowId,
  emptyMessage = 'No data available',
  dense = false,
}: DataTableProps<T>) {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage)
  const [order, setOrder] = useState<Order>('asc')
  const [orderBy, setOrderBy] = useState<keyof T | string>('')
  const [searchQuery, setSearchQuery] = useState('')

  const handleRequestSort = (property: keyof T | string, getValue?: (row: T) => unknown) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
    setSortGetValue(() => getValue)
  }

  const [sortGetValue, setSortGetValue] = useState<((row: T) => unknown) | undefined>(undefined)

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const searchableColumns = useMemo(
    () => columns.filter((col) => col.searchable !== false),
    [columns]
  )

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data

    const query = searchQuery.toLowerCase()
    return data.filter((row) =>
      searchableColumns.some((col) => {
        const value = col.getValue ? col.getValue(row) : getNestedValue(row, col.id as string)
        if (value == null) return false
        return String(value).toLowerCase().includes(query)
      })
    )
  }, [data, searchQuery, searchableColumns])

  const sortedData = useMemo(() => {
    if (!orderBy) return filteredData
    return [...filteredData].sort(getComparator(order, orderBy, sortGetValue))
  }, [filteredData, order, orderBy, sortGetValue])

  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage
    return sortedData.slice(start, start + rowsPerPage)
  }, [sortedData, page, rowsPerPage])

  // Reset page when data changes
  useMemo(() => {
    if (page > 0 && paginatedData.length === 0) {
      setPage(0)
    }
  }, [page, paginatedData.length])

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      {(title || searchable) && (
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          {title && (
            <Typography variant="h6" component="div">
              {title}
            </Typography>
          )}
          {searchable && (
            <TextField
              size="small"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPage(0)
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ minWidth: 250 }}
            />
          )}
        </Box>
      )}

      <TableContainer sx={{ maxHeight: maxHeight }}>
        <Table stickyHeader={stickyHeader} size={dense ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={String(column.id)}
                  align={column.align || 'left'}
                  style={{ minWidth: column.minWidth }}
                  sortDirection={orderBy === column.id ? order : false}
                >
                  {column.sortable !== false ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleRequestSort(column.id, column.getValue)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">{emptyMessage}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => {
                const rowKey = getRowId ? getRowId(row) : index
                return (
                  <TableRow
                    hover
                    key={rowKey}
                    onClick={onRowClick ? () => onRowClick(row, index) : undefined}
                    sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                  >
                    {columns.map((column) => {
                      const value = column.getValue
                        ? column.getValue(row)
                        : getNestedValue(row, column.id as string)
                      return (
                        <TableCell key={String(column.id)} align={column.align || 'left'}>
                          {column.format ? column.format(value, row) : (value as React.ReactNode)}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={rowsPerPageOptions}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  )
}
