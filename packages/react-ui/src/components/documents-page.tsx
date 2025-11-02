import { useState } from 'react'
import { trpc } from '../lib/trpc'
import {
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { Document } from '@krag/zod-schema'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { Badge } from './ui/badge'
import { DocumentForm } from './document-form'
import { IconChevronLeft, IconChevronRight, IconPlus, IconEdit, IconTrash } from '@tabler/icons-react'

export function DocumentsPage() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingDocument, setEditingDocument] = useState<Document | null>(null)

  // Get filter values
  const statusFilter = columnFilters.find(f => f.id === 'status')?.value as string | undefined
  const typeFilter = columnFilters.find(f => f.id === 'type')?.value as string | undefined

  // Fetch documents with server-side pagination
  const { data, isLoading, refetch } = trpc.documents.list.useQuery({
    page,
    pageSize,
    sortBy: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
    search: globalFilter || undefined,
    status: statusFilter,
    type: typeFilter,
  })

  // Fetch filter options
  const { data: statuses } = trpc.documents.getStatuses.useQuery()
  const { data: types } = trpc.documents.getTypes.useQuery()

  // Delete mutation
  const deleteMutation = trpc.documents.delete.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const columns: ColumnDef<Document>[] = [
    {
      accessorKey: 'header',
      header: 'Header',
      cell: ({ row }) => (
        <div className="font-medium max-w-md">{row.original.header}</div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.type}</Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status
        const variant = status === 'Done' ? 'default' : 'secondary'
        return <Badge variant={variant}>{status}</Badge>
      },
    },
    {
      accessorKey: 'target',
      header: 'Target',
      cell: ({ row }) => row.original.target,
    },
    {
      accessorKey: 'limit',
      header: 'Limit',
      cell: ({ row }) => row.original.limit,
    },
    {
      accessorKey: 'reviewer',
      header: 'Reviewer',
      cell: ({ row }) => row.original.reviewer,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setEditingDocument(row.original)
              setShowForm(true)
            }}
          >
            <IconEdit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (confirm('Are you sure you want to delete this document?')) {
                deleteMutation.mutate({ id: row.original.id })
              }
            }}
          >
            <IconTrash className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    pageCount: data?.pagination.totalPages ?? 0,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  })

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Documents</CardTitle>
          <Button onClick={() => {
            setEditingDocument(null)
            setShowForm(true)
          }}>
            <IconPlus className="h-4 w-4 mr-2" />
            Add Document
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4 flex-wrap">
            <Input
              placeholder="Search documents..."
              value={globalFilter}
              onChange={(e) => {
                setGlobalFilter(e.target.value)
                setPage(1) // Reset to first page on search
              }}
              className="max-w-sm"
            />
            <Select
              value={statusFilter || 'all'}
              onValueChange={(value) => {
                setColumnFilters((prev) => {
                  const filtered = prev.filter(f => f.id !== 'status')
                  if (value !== 'all') {
                    return [...filtered, { id: 'status', value }]
                  }
                  return filtered
                })
                setPage(1)
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses?.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={typeFilter || 'all'}
              onValueChange={(value) => {
                setColumnFilters((prev) => {
                  const filtered = prev.filter(f => f.id !== 'type')
                  if (value !== 'all') {
                    return [...filtered, { id: 'type', value }]
                  }
                  return filtered
                })
                setPage(1)
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {types?.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No documents found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Page {data?.pagination.page || 1} of {data?.pagination.totalPages || 1}
                {' '}({data?.pagination.total || 0} total documents)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(Number(value))
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 / page</SelectItem>
                  <SelectItem value="20">20 / page</SelectItem>
                  <SelectItem value="50">50 / page</SelectItem>
                  <SelectItem value="100">100 / page</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <IconChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.min(data?.pagination.totalPages || 1, p + 1))}
                disabled={page >= (data?.pagination.totalPages || 1)}
              >
                <IconChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Dialog */}
      {showForm && (
        <DocumentForm
          document={editingDocument}
          onClose={() => {
            setShowForm(false)
            setEditingDocument(null)
          }}
          onSuccess={() => {
            refetch()
            setShowForm(false)
            setEditingDocument(null)
          }}
        />
      )}
    </div>
  )
}
