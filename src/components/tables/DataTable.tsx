import React, { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  PaginationState,
} from '@tanstack/react-table';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  isLoading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  onRowClick?: (row: T) => void;
  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
}

function DataTable<T extends Record<string, any>>({
  data,
  columns,
  isLoading = false,
  searchable = true,
  searchPlaceholder = 'ابحث...',
  onRowClick,
  onView,
  onEdit,
  onDelete,
}: DataTableProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [searchQuery, setSearchQuery] = React.useState('');

  // Add actions column if any action handlers provided
  const columnsWithActions = useMemo(() => {
    const hasActions = onView || onEdit || onDelete;
    if (!hasActions) return columns;

    return [
      ...columns,
      {
        id: 'actions',
        header: 'الإجراءات',
        cell: ({ row }: any) => (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {onView && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onView(row.original);
                }}
                sx={{ color: '#38BDF8' }}
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
            )}
            {onEdit && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(row.original);
                }}
                sx={{ color: '#2563EB' }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            )}
            {onDelete && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(row.original);
                }}
                sx={{ color: '#EF4444' }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        ),
      },
    ] as ColumnDef<T>[];
  }, [columns, onView, onEdit, onDelete]);

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    const query = searchQuery.toLowerCase();
    return data.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(query)
      )
    );
  }, [data, searchQuery]);

  const table = useReactTable({
    data: filteredData,
    columns: columnsWithActions,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
  });

  if (isLoading) {
    return (
      <Paper
        sx={{
          bgcolor: '#111827',
          borderRadius: 2,
          border: '1px solid #1F2937',
          p: 3,
        }}
      >
        <Typography sx={{ color: '#9CA3AF', textAlign: 'center' }}>
          جاري التحميل...
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        bgcolor: '#111827',
        borderRadius: 2,
        border: '1px solid #1F2937',
        overflow: 'hidden',
      }}
    >
      {searchable && (
        <Box sx={{ p: 2, borderBottom: '1px solid #1F2937' }}>
          <TextField
            placeholder={searchPlaceholder}
            size="small"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#6B7280', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              maxWidth: 400,
              '& .MuiOutlinedInput-root': {
                bgcolor: '#020617',
                '& fieldset': { borderColor: '#1F2937' },
                '&:hover fieldset': { borderColor: '#374151' },
              },
              input: { color: '#E5E7EB' },
            }}
          />
        </Box>
      )}

      <TableContainer>
        <Table>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} sx={{ bgcolor: '#020617' }}>
                {headerGroup.headers.map((header) => (
                  <TableCell
                    key={header.id}
                    sx={{
                      color: '#9CA3AF',
                      fontWeight: 600,
                      fontSize: 13,
                      borderBottom: '1px solid #1F2937',
                      cursor: header.column.getCanSort() ? 'pointer' : 'default',
                    }}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() && (
                      <span style={{ marginLeft: 4 }}>
                        {header.column.getIsSorted() === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columnsWithActions.length}
                  sx={{
                    textAlign: 'center',
                    py: 4,
                    color: '#9CA3AF',
                  }}
                >
                  لا توجد بيانات
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => onRowClick?.(row.original)}
                  sx={{
                    cursor: onRowClick ? 'pointer' : 'default',
                    '&:hover': {
                      bgcolor: 'rgba(37,99,235,0.1)',
                    },
                    borderBottom: '1px solid #1F2937',
                    '& td': {
                      color: '#E5E7EB',
                      fontSize: 14,
                      py: 1.75, // 14px - row height 56px
                    },
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 2,
          py: 1.5,
          borderTop: '1px solid #1F2937',
        }}
      >
        <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
          إجمالي النتائج: {filteredData.length}
        </Typography>
        <TablePagination
          component="div"
          count={filteredData.length}
          page={pagination.pageIndex}
          onPageChange={(_, page) => setPagination({ ...pagination, pageIndex: page })}
          rowsPerPage={pagination.pageSize}
          onRowsPerPageChange={(e) =>
            setPagination({
              ...pagination,
              pageSize: parseInt(e.target.value, 10),
              pageIndex: 0,
            })
          }
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="عدد الصفوف:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} من ${count !== -1 ? count : `أكثر من ${to}`}`
          }
          sx={{
            color: '#E5E7EB',
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              color: '#E5E7EB',
            },
            '& .MuiIconButton-root': {
              color: '#9CA3AF',
            },
          }}
        />
      </Box>
    </Paper>
  );
}

export default DataTable;

