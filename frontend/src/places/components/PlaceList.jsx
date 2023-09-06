import React from 'react'
import './PlaceList.css'
import Card from '../../shared/components/UIElements/Card'
import PlaceItem from './PlaceItem'
import Button from '../../shared/components/FormElements/Button'

const PlaceList = (props) => {
    if (props.items.length === 0) {
        return (
            <div className='center'>
                <Card>
                    <h3>No places found. Maybe create one?</h3>
                    <Button to={'/places/new'}>Share Place</Button>
                </Card>
            </div>)
    }

    return (
        <ul className='place-list'>
            { props.items.map(item =>
                <PlaceItem key={item.id}
                    id={item.id}
                    image={item.imageUrl}
                    title={item.title}
                    description={item.description}
                    address={item.address}
                    creatorId={item.creator}
                    coordinates={item.location}
                    onDeletePlace={props.onDeletePlace}
                />
            )}
        </ul>
    )
}
export default PlaceList
