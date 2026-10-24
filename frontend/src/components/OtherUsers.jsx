import React from 'react';
import OtherUser from './OtherUser';
import useGetOtherUsers from '../hooks/useGetOtherUsers';
import { useSelector } from "react-redux";

// Accepts an optional `users` prop (e.g. a search-filtered list from
// Sidebar). Falls back to the full Redux list when no prop is passed, so
// existing usages without a prop keep working unchanged.
const OtherUsers = ({ users }) => {
    useGetOtherUsers();

    const { otherUsers } = useSelector(store => store.user);
    const displayedUsers = users !== undefined ? users : otherUsers;

    // ✅ proper safety check
    if (!Array.isArray(displayedUsers)) {
        return null; // or loading spinner
    }

    return (
        <div className='overflow-auto flex-1'>
            {displayedUsers.map(user => (
                <OtherUser key={user._id} user={user} />
            ))}
        </div>
    );
};

export default OtherUsers;












// useGetOtherUsers()
// Fetches users from backend and stores them in Redux.

// useSelector()
// Reads otherUsers from Redux.

// Safety check
// Prevents .map() from crashing if otherUsers is null or undefined.

// map()
// Loops through every user and creates one <OtherUser /> component.

// key
// Helps React identify each item uniquely while rendering lists.

// user={user}
// Passes one user's data as props to the OtherUser component.