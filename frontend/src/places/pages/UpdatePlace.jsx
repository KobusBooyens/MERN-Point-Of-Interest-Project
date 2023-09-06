import React, { useContext, useEffect, useState } from 'react'
import './PlaceForm.css'
import { useHistory, useParams } from 'react-router-dom'
import Input from '../../shared/components/FormElements/Input'
import { VALIDATOR_MINLENGTH, VALIDATOR_REQUIRE } from '../../shared/utils/validators'
import Button from '../../shared/components/FormElements/Button'
import { useForm } from '../../shared/hooks/form-hook'
import Card from '../../shared/components/UIElements/Card'
import { useHttpClient } from '../../shared/hooks/http-hook'
import ErrorModal from '../../shared/components/UIElements/ErrorModal'
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner'
import { AuthContext } from '../../shared/context/auth-context'

const UpdatePlace = () => {
    const params = useParams()
    const { error, isLoading, clearError, sendRequest } = useHttpClient()
    const [loadedPlace, setLoadedPlace] = useState()
    const history = useHistory()
    const { userId, token } = useContext(AuthContext)
    const [formState, inputHandler, setFormData] = useForm({
        title: {
            value: '',
            isValid: false
        },
        description: {
            value: '',
            isValid: false
        }
    }, false)

    useEffect(() => {
        const getPlace = async () => {
            try {
                const responseData = await sendRequest(`${process.env.REACT_APP_SERVER_URL}/places/${params.placeId}`)
                setLoadedPlace(responseData.place)
                setFormData({
                    title: {
                        value: loadedPlace.title,
                        isValid: true
                    },
                    description: {
                        value: loadedPlace.description,
                        isValid: true
                    }
                }, true)
            } catch (e) {}
        }
        getPlace()
    }, [sendRequest, params.placeId])

    const placeUpdateSubmitHandler = async (e) => {
        e.preventDefault()

        try {
            await sendRequest(`${process.env.REACT_APP_SERVER_URL}/places/${params.placeId}`,
                'PATCH',
                JSON.stringify({
                    title: formState.inputs.title.value,
                    description: formState.inputs.description.value
                }),
                {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                })
            history.push(`/${userId}/places`)
        } catch (e) {}
    }

    if (isLoading) {
        return (
            <div className='center'>
                <LoadingSpinner asOverlay/>
            </div>
        )
    }

    if (!loadedPlace && !error) {
        return (
            <>
                <div className='center'>
                    <Card>
                        <h2>Could not find place!</h2>
                    </Card>
                </div>
            </>
        )
    }

    return (
        <>
            <ErrorModal error={error} onClear={clearError}/>

            {!isLoading && loadedPlace &&
            <form className='place-form' onSubmit={placeUpdateSubmitHandler}>
                <Input id='title'
                    element='input'
                    type='text'
                    label='Title'
                    validators={[VALIDATOR_REQUIRE()]}
                    errorText='Please enter a valid title'
                    onInput={inputHandler}
                    initialValue={loadedPlace.title}
                    initialIsValid={true}
                />
                <Input id='description'
                    element='textarea'
                    rows={3}
                    label='Description'
                    validators={[VALIDATOR_MINLENGTH(5)]}
                    errorText='Please enter a valid address (min of 5 characters)'
                    onInput={inputHandler}
                    initialValue={loadedPlace.description}
                    initialIsValid={true}
                />
                <Button type='submit' disabled={!formState.isValid}>UPDATE PLACE</Button>
            </form>}
        </>
    )
}

export default UpdatePlace
