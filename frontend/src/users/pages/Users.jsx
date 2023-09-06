import React, { useEffect, useState } from 'react'

import UsersList from '../components/UsersList'
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner'
import ErrorModal from '../../shared/components/UIElements/ErrorModal'
import { useHttpClient } from '../../shared/hooks/http-hook'

const Users = () => {
    const { clearError, isLoading, error, sendRequest } = useHttpClient()
    const [loadedUsers, setLoadedUsers] = useState([])

    useEffect(() => {
        const getUsers = async () => {
            try {
                const responseData = await sendRequest(`${process.env.REACT_APP_SERVER_URL}/users`)
                setLoadedUsers(responseData.users)
            } catch (err) { }
        }
        getUsers()
    }, [sendRequest])

    return (
        <>
            <ErrorModal error={error} onClear={clearError}/>
            {isLoading &&
                <div className='center'>
                    <LoadingSpinner asOverlay/>
                </div>}
            <UsersList items={loadedUsers}/>
        </>
    )
}

export default Users
