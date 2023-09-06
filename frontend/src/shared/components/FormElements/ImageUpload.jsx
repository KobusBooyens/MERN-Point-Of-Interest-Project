import React, { useEffect, useRef, useState } from 'react'
import './ImageUpload.css'
import Button from './Button'
const ImageUpload = (props) => {
    const filePickerRef = useRef()
    const [file, setFile] = useState()
    const [previewUrl, setPreviewUrl] = useState()
    const [isValid, setIsValid] = useState('')

    useEffect(() => {
        if (file) {
            const fileReader = new FileReader()
            fileReader.onload = () => {
                setPreviewUrl(fileReader.result)
            }
            fileReader.readAsDataURL(file)
        }
    }, [file])

    const pickImageHandler = () => {
        filePickerRef.current.click()
    }

    const pickedHandler = (e) => {
        let uploadedFile
        let fileIsValid = isValid
        if (e.target.files && e.target.files.length === 1) {
            uploadedFile = e.target.files[0]
            setFile(uploadedFile)
            setIsValid(true)
            fileIsValid = true
        } else {
            setIsValid(false)
            fileIsValid = false
        }
        props.onInput(props.id, uploadedFile, fileIsValid)
    }

    return (
        <div className='form-control'>
            <input id={props.id}
                ref={filePickerRef}
                style={{ display: 'none' }}
                type='file'
                accept='.jpg,.png,.jpeg'
                onChange={pickedHandler}
            />
            <div className={`image-upload ${props.center && 'center'}`}>
                <div className='image-upload__preview'>
                    {previewUrl && <img src={previewUrl} alt='Preview'/>}
                    {!previewUrl && <p>Please upload an image</p>}
                </div>
                <Button type='button' onClick={pickImageHandler}>PICK IMAGE</Button>
            </div>
            {!isValid && <p>{props.errorText}</p>}
        </div>
    )
}
export default ImageUpload
