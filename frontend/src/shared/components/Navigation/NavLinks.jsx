import React, { useContext } from 'react'
import './NavLinks.css'
import { NavLink } from 'react-router-dom'
import { AuthContext } from '../../context/auth-context'
import Button from '../FormElements/Button'

const NavLinks = () => {
    const { isLoggedIn, logout } = useContext(AuthContext)
    const { userId } = useContext(AuthContext)
    return (
        <ul className='nav-links'>
            <li>
                <NavLink to='/' exact>ALL USERS</NavLink>
            </li>

            { isLoggedIn && (<li>
                <NavLink to={`/${userId}/places`}>MY PLACES</NavLink>
            </li>)
            }

            { isLoggedIn && (<li>
                <NavLink to='/places/new'>ADD PLACE</NavLink>
            </li>)
            }

            { !isLoggedIn && (<li>
                <NavLink to='/auth'>AUTHENTICATE</NavLink>
            </li>)
            }

            { isLoggedIn && (<li>
                <Button onClick={logout}>LOGOUT</Button>
            </li>)
            }
        </ul>
    )
}
export default NavLinks
