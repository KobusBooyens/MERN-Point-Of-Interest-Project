import React, { useCallback, useEffect, useState } from 'react'

let logoutTimer

export const useAuthHook = () => {
    const [token, setToken] = useState(false)
    const [tokenExpirationDate, setTokenExpirationDate] = useState()
    const [userId, setUserId] = useState(null)

    const login = useCallback((uid, token, expirationDate) => {
        setToken(token)
        setUserId(uid)
        const tokenExpirationDate =
            expirationDate || new Date(new Date().getTime() + 1000 * 60 * 60)
        setTokenExpirationDate(tokenExpirationDate)
        // eslint-disable-next-line no-undef
        localStorage.setItem(
            'userData',
            JSON.stringify({
                userId: uid,
                token,
                expiration: tokenExpirationDate.toISOString()
            })
        )
    }, [])

    const logout = useCallback(() => {
        setToken(null)
        setTokenExpirationDate(null)
        setUserId(null)
        // eslint-disable-next-line no-undef
        localStorage.removeItem('userData')
    }, [])

    useEffect(() => {
        if (token && tokenExpirationDate) {
            const remainingTime = tokenExpirationDate.getTime() - new Date().getTime()
            logoutTimer = setTimeout(logout, remainingTime)
        } else {
            clearTimeout(logoutTimer)
        }
    }, [token, logout, tokenExpirationDate])

    useEffect(() => {
        // eslint-disable-next-line no-undef
        const storedData = JSON.parse(localStorage.getItem('userData'))
        if (
            storedData &&
            storedData.token &&
            new Date(storedData.expiration) > new Date()
        ) {
            login(storedData.userId, storedData.token, new Date(storedData.expiration))
        }
    }, [login])

    return { token, logout, login, userId }
}
