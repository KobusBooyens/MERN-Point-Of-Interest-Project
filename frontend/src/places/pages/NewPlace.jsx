import React, { useContext } from 'react'
import './PlaceForm.css'
import Input from '../../shared/components/FormElements/Input'
import { VALIDATOR_MINLENGTH, VALIDATOR_REQUIRE } from '../../shared/utils/validators'
import Button from '../../shared/components/FormElements/Button'
import { useForm } from '../../shared/hooks/form-hook'
import { useHttpClient } from '../../shared/hooks/http-hook'
import { AuthContext } from '../../shared/context/auth-context'
import ErrorModal from '../../shared/components/UIElements/ErrorModal'
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner'
import { useHistory } from 'react-router-dom'
import ImageUpload from '../../shared/components/FormElements/ImageUpload'

const NewPlace = () => {
    const { userId, token } = useContext(AuthContext)

    const { isLoading, error, clearError, sendRequest } = useHttpClient()
    const [formState, inputHandler] = useForm({
        title: {
            value: '',
            isValid: false
        },
        description: {
            value: '',
            isValid: false
        },
        address: {
            value: '',
            isValid: false
        },
        image: {
            value: null,
            isValid: false
        }
    }, false)

    const history = useHistory()
    const placeSubmitHandler = async (e) => {
        e.preventDefault()
        try {
            const formData = new FormData()
            formData.append('title', formState.inputs.title.value)
            formData.append('description', formState.inputs.description.value)
            formData.append('address', formState.inputs.address.value)
            formData.append('image', formState.inputs.image.value)

            await sendRequest(`${process.env.REACT_APP_SERVER_URL}/places`,
                'POST',
                formData,
                {
                    Authorization: `Bearer ${token}`
                })

            history.push('/')
        } catch (err) { }
    }

    return (
        <>
            <ErrorModal error={error} onClear={clearError}/>

            { isLoading &&
                <div className='center'>
                    <LoadingSpinner asOverlay/>
                </div>
            }

            <form className='place-form' onSubmit={placeSubmitHandler}>
                <Input element='input'
                    id='title'
                    type='text'
                    label='Title'
                    validators={[VALIDATOR_REQUIRE()]}
                    errorText='Please enter a valid title.'
                    onInput={inputHandler}
                />

                <Input element='textarea'
                    id='description'
                    label='Description'
                    validators={[VALIDATOR_MINLENGTH(5)]}
                    errorText='Please enter a valid description (at least 5 characters).'
                    onInput={inputHandler}
                />

                <ImageUpload
                    id='image' center
                    onInput={inputHandler}
                    errorText='Please upload an image'/>

                <Input element='input'
                    id='address'
                    label='Address'
                    validators={[VALIDATOR_REQUIRE()]}
                    errorText='Please enter a valid address.'
                    onInput={inputHandler}
                />

                <Button type='submit' disabled={!formState.isValid}>ADD PLACE</Button>
            </form>
        </>
    )
}

export default NewPlace
