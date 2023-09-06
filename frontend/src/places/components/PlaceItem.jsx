import React, { useContext, useState } from 'react'
import './PlaceItem.css'
import Card from '../../shared/components/UIElements/Card'
import Button from '../../shared/components/FormElements/Button'
import Modal from '../../shared/components/UIElements/Modal'
import Map from '../../shared/components/UIElements/Map'
import { AuthContext } from '../../shared/context/auth-context'
import { useHttpClient } from '../../shared/hooks/http-hook'
import { useHistory } from 'react-router-dom'
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner'
import ErrorModal from '../../shared/components/UIElements/ErrorModal'

const PlaceItem = (props) => {
    const [showMap, setShowMap] = useState(false)

    const { clearError, isLoading, error, sendRequest } = useHttpClient()
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const { userId, token } = useContext(AuthContext)
    const openMapHandler = () => setShowMap(true)
    const closeMapHandler = () => setShowMap(false)
    const showDeleteWarningHandler = () => {
        setShowConfirmModal(true)
    }
    const cancelDeleteWarningHandler = (e) => {
        e.preventDefault()
        setShowConfirmModal(false)
    }

    // eslint-disable-next-line no-console
    console.log(userId, props.creatorId)

    const confirmDeleteWarningHandler = async (e) => {
        e.preventDefault()
        setShowConfirmModal(false)

        try {
            await sendRequest(`${process.env.REACT_APP_SERVER_URL}/places/${props.id}`, 'DELETE', null,
                { Authorization: `Bearer ${token}` })
            props.onDeletePlace(props.id)
        } catch (e) {}
    }

    return (
        <>
            <ErrorModal error={error} onClear={clearError} />

            <Modal show={showMap}
                onCancel={closeMapHandler}
                header={props.address}
                contentClass='place-item__modal-content'
                footerClass='place-item__modal-actions'
                footer={<Button onClick={closeMapHandler}>CLOSE</Button>}>
                <div className='map-container'>
                    <Map center={props.coordinates} zoom={16}/>
                </div>
            </Modal>

            <Modal show={showConfirmModal}
                onCancel={cancelDeleteWarningHandler}
                header='Are you sure?'
                footerClass='place-item__modal-actions'
                footer={
                    <>
                        <Button inverse onClick={cancelDeleteWarningHandler}>CANCEL</Button>
                        <Button danger onClick={confirmDeleteWarningHandler}>DELETE</Button>
                    </>}
            >
                <p>Do you want to proceed and delete this place? Please note that the delete cannot be undone.</p>
            </Modal>

            <li className='place-item'>
                <Card className='place-item__content'>
                    {isLoading && (
                        <div className="center">
                            <LoadingSpinner asOverlay/>
                        </div>
                    )}
                    <div className='place-item__image'>
                        <img src={`${process.env.REACT_APP_ASSET_URL}/${props.image}`} alt={props.title}/>
                    </div>
                    <div className='place-item__info'>
                        <h2>{props.title}</h2>
                        <h3>{props.address}</h3>
                        <p>{props.description}</p>
                    </div>
                    <div className='place-item__actions'>
                        <Button inverse onClick={openMapHandler}>VIEW ON MAP</Button>
                        { userId === props.creatorId &&
                            <Button to={`/places/${props.id}`}>
                                EDIT
                            </Button> }
                        { userId === props.creatorId &&
                            <Button danger onClick={showDeleteWarningHandler}>
                                DELETE
                            </Button> }
                    </div>
                </Card>
            </li>
        </>

    )
}
export default PlaceItem
