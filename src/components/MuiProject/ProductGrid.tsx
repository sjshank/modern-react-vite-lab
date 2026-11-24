import type { GridCallbackDetails } from '@mui/x-data-grid';
import type { GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import { DataGrid, getGridStringOperators } from '@mui/x-data-grid';
import Stack from '@mui/material/Stack';
import { Typography } from '@mui/material';

type Product = {
  id: number;
  name: string;
  stock: number;
};

// Column definitions for the product data grid.
const columns: GridColDef<Product>[] = [
  {
    field: 'id',
    headerName: 'ID',
    flex: 1,
    minWidth: 100,
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
  },
  {
    field: 'name',
    headerName: 'Name',
    width: 400,
    minWidth: 100,
    sortable: true,
    sortingOrder: ['asc', 'desc'],
    filterable: true,
    filterOperators: getGridStringOperators().filter(
      (operator) =>
        operator.value === 'contains' ||
        operator.value === 'equals' ||
        operator.value === 'startsWith',
    ),
  },
  {
    field: 'stock',
    headerName: 'Stock',
    editable: true,
    width: 400,
    minWidth: 300,
    sortable: true,
    sortingOrder: ['asc', 'desc'],
    filterOperators: getGridStringOperators().filter(
      (operator) =>
        operator.value === 'contains' ||
        operator.value === 'equals' ||
        operator.value === 'startsWith',
    ),
  },
];

const generateProducts = (count: number): Product[] =>
  Array.from({ length: count }, (_, index) => {
    const id = index + 1;

    return {
      id,
      name: `Product ${id}`,
      stock: ((id * 17) % 100) + 1,
    };
  });

const rows = generateProducts(500);

// ProductGrid component displaying a data grid with products and row selection handling.
export const ProductGrid = () => {
  const handleRowSelection = (
    rowSelectionModel: GridRowSelectionModel,
    details: GridCallbackDetails,
  ) => {
    console.log('Row selection changed:', rowSelectionModel, details);
  };

  const handleProcessRowUpdate = (newRow: Product, oldRow: Product) => {
    console.log('Row updated:', newRow, oldRow);
    return newRow;
  };

  return (
    <Stack
      style={{ height: 400 }}
      sx={{ padding: 2, backgroundColor: 'background.paper' }}
    >
      <Typography
        variant="h6"
        className="mb-2 text-dashboard-text font-semibold p-2"
      >
        MUI Grid
      </Typography>
      {/* // DataGrid component from MUI displaying the product rows and columns with pagination and row selection handling. */}
      <DataGrid
        rows={rows}
        columns={columns}
        pageSizeOptions={[25, 50, 100]}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 25, page: 0 },
          },
        }}
        // Enable row selection
        checkboxSelection
        // Handle row selection changes
        onRowSelectionModelChange={handleRowSelection}
        // Handle row updates
        processRowUpdate={handleProcessRowUpdate}
        // Disable virtualization for the data grid
        disableVirtualization={false}
        virtualizeColumnsWithAutoRowHeight
        // rowBufferPx={20}
      />
    </Stack>
  );
};
