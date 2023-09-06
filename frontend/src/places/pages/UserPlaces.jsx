import React, { useEffect, useState } from 'react'
import PlaceList from '../components/PlaceList'
import { useParams } from 'react-router-dom'
import { useHttpClient } from '../../shared/hooks/http-hook'
import ErrorModal from '../../shared/components/UIElements/ErrorModal'
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner'

const UserPlaces = () => {
    const [loadedPlaces, setLoadedPlaces] = useState()
    const { isLoading, error, sendRequest, clearError } = useHttpClient()

    const userId = useParams().userId

    useEffect(() => {
        const getPlacesByUserId = async () => {
            try {
                const responseData =
                    await sendRequest(`${process.env.REACT_APP_SERVER_URL}/places/user/${userId}`, 'GET')
                setLoadedPlaces(responseData.places)
            } catch (e) {}
        }
        getPlacesByUserId()
    }, [sendRequest])

    const deleteHandler = (deletedPlaceId) => {
        setLoadedPlaces(prevState =>
            prevState.filter(place => place.id !== deletedPlaceId))
    }

    return (
        <>
            <ErrorModal error={error} onClear={clearError} />
            {isLoading && (
                <div className="center">
                    <LoadingSpinner />
                </div>
            )}
            {!isLoading && loadedPlaces && <PlaceList items={loadedPlaces} onDeletePlace={deleteHandler} />}
        </>
    )
}
export default UserPlaces
