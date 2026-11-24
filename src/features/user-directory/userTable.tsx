import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import type { User } from './types';

const columns: GridColDef<User>[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'email', headerName: 'Email', width: 400 },
  { field: 'phone', headerName: 'Phone', type: 'number', width: 400 },
];

type UserTableProps = {
  rows: User[];
};

/* I — Interface Segregation Principle */
// The UserTable component adheres to the Interface Segregation Principle by only requiring the specific props it needs (rows), rather than a large, all-encompassing interface.
// UserTable component displays a paginated table of users using MUI DataGrid.
// here Component receives only the props needed, rather than one oversized “do everything” interface.
export const UserTable = ({ rows }: UserTableProps) => {
  return (
    <DataGrid
      columns={columns}
      rows={rows}
      pageSizeOptions={[25, 50, 100]}
      initialState={{
        pagination: {
          paginationModel: { pageSize: 25, page: 0 },
        },
      }}
    />
  );
};
