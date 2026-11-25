import type { SyntheticEvent } from 'react';

// Individual event handlers for the UsersTable component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const UsersTable = ({ users }: any) => {
  const handleClick = (userId: string) => {
    console.log('User clicked:', userId);
  };

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
        </tr>
      </thead>
      <tbody>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {users.map((user: any) => (
          <tr key={user.id} onClick={() => handleClick(user.id)}>
            <td>{user.name}</td>
            <td>{user.email}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// Event delegation handler for the ProfileTable component
// It does not guarantee that performance will be always better
export const ProfileTable = () => {
  const handleClick = (event: SyntheticEvent) => {
    const target = event.target as HTMLElement;
    const action = target.closest('td[data-action]'); // Find the closest td element with a data-action attribute
    if (action) {
      const actionType = action.getAttribute('data-action'); // Get the action type from the data-action attribute
      const profileId = action
        .closest('td[data-user-id]')
        ?.getAttribute('data-user-id'); // Find the closest td element with a data-user-id attribute
      console.log('Action:', actionType, 'Profile ID:', profileId);
    }
  };

  // Table body ->Single click handler->Random table row clicked->event delegated/bubbles up to ancestor where handler is attached

  // Event delegation is a DOM design pattern where a parent handles events originating from its descendants using event bubbling.

  return (
    <table>
      <thead>
        <tr>
          <th>Profile Name</th>
          <th>Profile Email</th>
        </tr>
      </thead>
      <tbody onClick={handleClick}>
        {[
          { id: '1John', name: 'John Doe', email: 'john@example.com' },
          {
            id: '2Jane',
            name: 'Jane Smith',
            email: 'jane@example.com',
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ].map((profile: any) => (
          <tr key={profile.id}>
            <td data-action="view" data-user-id={profile.id}>
              {profile.name}
            </td>
            <td data-action="view" data-user-id={profile.id}>
              {profile.email}
            </td>
            <td data-action="edit" data-user-id={profile.id}>
              Edit
            </td>
            <td data-action="delete" data-user-id={profile.id}>
              Delete
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
