import React, { useContext, useState } from 'react'
import { useForm } from '../../shared/hooks/form-hook'
import Input from '../../shared/components/FormElements/Input'
import { VALIDATOR_EMAIL, VALIDATOR_MINLENGTH, VALIDATOR_REQUIRE } from '../../shared/utils/validators'
import Button from '../../shared/components/FormElements/Button'
import './Auth.css'
import Card from '../../shared/components/UIElements/Card'
import { AuthContext } from '../../shared/context/auth-context'
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner'
import ErrorModal from '../../shared/components/UIElements/ErrorModal'
import { useHttpClient } from '../../shared/hooks/http-hook'
import ImageUpload from '../../shared/components/FormElements/ImageUpload'

const Auth = () => {
    const [formState, inputHandler, setFormData] = useForm({
        email: {
            value: '',
            isValid: false
        },
        password: {
            value: '',
            isValid: false
        }
    }, false)

    const { login } = useContext(AuthContext)

    const [isLoginMode, setIsLoginMode] = useState(true)
    const { isLoading, error, clearError, sendRequest } = useHttpClient()
    const authSubmitHandler = async (e) => {
        e.preventDefault()
        if (isLoginMode) {
            try {
                const responseData = await sendRequest(
                    `${process.env.REACT_APP_SERVER_URL}/users/login`,
                    'POST',
                    JSON.stringify({
                        email: formState.inputs.email.value,
                        password: formState.inputs.password.value
                    }),
                    {
                        'Content-Type': 'application/json'
                    }
                )
                // eslint-disable-next-line no-console
                console.log(responseData)
                login(responseData.userId, responseData.token)
            } catch (err) {
                console.error(err)
            }
        } else {
            try {
                const formData = new FormData()
                formData.append('name', formState.inputs.name.value)
                formData.append('email', formState.inputs.email.value)
                formData.append('password', formState.inputs.password.value)
                formData.append('image', formState.inputs.image.value)

                const responseData = await sendRequest(
                    `${process.env.REACT_APP_SERVER_URL}/users/signup`,
                    'POST',
                    formData
                )
                // eslint-disable-next-line no-console
                console.log(responseData)
                login(responseData.userId, responseData.token)
            } catch (err) {
                console.error(err)
            }
        }
    }

    const switchModeHandler = () => {
        if (!isLoginMode) {
            setFormData(
                {
                    ...formState.inputs,
                    name: undefined,
                    image: undefined
                },
                formState.inputs.email.isValid && formState.inputs.password.isValid)
        } else {
            setFormData(
                {
                    ...formState.inputs,
                    name: {
                        value: '',
                        isValid: false
                    },
                    image: {
                        value: null,
                        isValid: false
                    }
                }, false)
        }

        setIsLoginMode(prevMode => !prevMode)
    }

    return (
        <>
            <ErrorModal error={error} onClear={clearError}/>
            <Card className='authentication'>
                { isLoading && <LoadingSpinner asOverlay/>}
                <h2>{isLoginMode ? 'Login Required' : 'Sign-up Required'}</h2>
                <hr />
                <form onSubmit={authSubmitHandler}>
                    {!isLoginMode && <Input element='input'
                        id='name'
                        type='text'
                        label='Username'
                        validators={[VALIDATOR_REQUIRE()]}
                        errorText='Please enter a valid Username.'
                        onInput={inputHandler}
                    />}

                    {!isLoginMode && <ImageUpload
                        id='image' center
                        onInput={inputHandler}
                        errorText='Please upload an image'/>}

                    <Input element='input'
                        id='email'
                        type='email'
                        label='E-Mail'
                        validators={[VALIDATOR_EMAIL()]}
                        errorText='Please enter a valid email address.'
                        onInput={inputHandler}
                    />
                    <Input element='input'
                        id='password'
                        type='password'
                        label='Password'
                        validators={[VALIDATOR_MINLENGTH(6)]}
                        errorText='Please enter a valid password (at least 6 characters).'
                        onInput={inputHandler}
                    />
                    <Button type='submit' disabled={!formState.isValid}>{isLoginMode ? 'LOGIN' : 'SIGN-UP'}</Button>
                </form>
                <Button inverse onClick={ switchModeHandler}> {isLoginMode
                    ? 'Don\'t have an account yet?'
                    : 'Already have an account?' }</Button>
            </Card>
        </>
    )
}
export default Auth
