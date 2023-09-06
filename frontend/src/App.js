import React, { Suspense } from 'react'
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom'
import MainNavigation from './shared/components/Navigation/MainNavigation'
import { AuthContext } from './shared/context/auth-context'
import { useAuthHook } from './shared/hooks/auth-hook'
import LoadingSpinner from './shared/components/UIElements/LoadingSpinner'

const Users = React.lazy(() => import('./users/pages/Users'))
const NewPlace = React.lazy(() => import('./places/pages/NewPlace'))
const UserPlaces = React.lazy(() => import('./places/pages/UserPlaces'))
const UpdatePlace = React.lazy(() => import('./places/pages/UpdatePlace'))
const Auth = React.lazy(() => import('./users/pages/Auth'))

function App () {
    const { token, logout, login, userId } = useAuthHook()

    let routes
    if (token) {
        routes = (
            <Switch>
                <Route path='/' exact component={Users} />
                <Route path='/:userId/places' component={UserPlaces}/>
                <Route path='/places/new' component={NewPlace} />
                <Route path='/places/:placeId' component={UpdatePlace} />
                <Redirect to='/' />
            </Switch>
        )
    } else {
        routes = (
            <Switch>
                <Route path='/' exact component={Users} />
                <Route path='/:userId/places' component={UserPlaces}/>
                <Route path='/auth' component={Auth} />
                <Redirect to='/auth' />

            </Switch>
        )
    }

    return (
        <AuthContext.Provider value={{ token, isLoggedIn: !!token, login, userId, logout }}>
            <Router>
                <MainNavigation />
                <main>
                    <Suspense fallback={
                        <div className='center'>
                            <LoadingSpinner/>
                        </div>
                    }>
                        {routes}
                    </Suspense>
                </main>
            </Router>
        </AuthContext.Provider>
    )
}

export default App
