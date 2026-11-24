import { useEffect } from 'react';
import type { User } from './types';
import { useFetchUsers } from './useUsers';
import { UserTable } from './userTable';
import { Box, Typography } from '@mui/material';

/* D — Dependency Inversion Principle */
// The UserDirectory component depends on an abstraction (fetchUsers prop) rather than a concrete data source, adhering to the dependency inversion principle.
// UserDirectory depends on the fetchUsers capability, not on HTTP, fetch, or a particular backend.
type UserDirectoryProps = {
  fetchUsers?: Promise<User[]>;
};

/* S — Single Responsibility Principle */
// The UserDirectory component is responsible for fetching and displaying the user directory, adhering to the single responsibility principle by not handling unrelated concerns.
export const UserDirectory = ({ fetchUsers }: UserDirectoryProps) => {
  /* Separation of concerns - means giving each part of your app a clear responsibility */
  // The UserDirectory component focuses on rendering the user directory, while the useFetchUsers hook handles the data fetching logic.
  const { status, data } = useFetchUsers();
  useEffect(() => {
    if (fetchUsers) {
      fetchUsers.then((data) => {
        console.log(data);
      });
    }
  }, [fetchUsers]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }
  if (status === 'error') {
    return <div>Error loading users</div>;
  }

  return (
    <Box sx={{ backgroundColor: '#ffffff', padding: 3 }}>
      {/*  O — Open/Closed Principle */}
      {/* Code should be extendable without repeatedly modifying its core logic. 
      // adding feature to Typography should not require modifying the UserDirectory component itself.
       */}
      <Typography variant="h6" className="text-dashboard-text font-semibold">
        SOLID Principles Demo
      </Typography>
      {/* The UserTable component is responsible for displaying the user data in a tabular format, adhering to the separation of concerns principle. */}
      <UserTable rows={data} />
    </Box>
  );
};
