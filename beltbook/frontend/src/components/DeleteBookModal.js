import React, {useLayoutEffect, useState} from 'react';
import axios from 'axios';
import {Button, Dimmer, Dropdown, Header, Loader, Modal} from "semantic-ui-react";
import {usernameSubject} from "./Auth";

export const DeleteBookModal = (props) => {
    const {book} = props;
    const [username, setUsername] = useState(localStorage.getItem('username'));
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useLayoutEffect(() => {
        const sub = usernameSubject.subscribe(setUsername);
        return () => {
            sub.unsubscribe();
        }
    }, []);

    const handleDelete = (event, d) => {
        setLoading(true);
        axios.delete(`/api/books/${book.id}/`).then(response => {
            const {status, data} = response;
            if (status === 204) {
                setLoading(false);
                props.history.push(`/u/${username}/book`);
            }
        });
    }

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <Modal closeIcon trigger={<Dropdown.Item text='Delete' onClick={handleOpen}/>} basic size='tiny'
               open={open} onClose={handleClose}>
            <Header icon='trash alternate' content={`Delete Book: ${book.name}`}/>
            <Modal.Content>
                <p>
                    Do you really want to delete this book?
                </p>
            </Modal.Content>
            <Modal.Actions>
                <Button basic inverted onClick={handleClose}>Cancel</Button>
                <Button color='red' inverted onClick={handleDelete}>Delete</Button>
            </Modal.Actions>
            <Dimmer active={loading}>
                <Loader/>
            </Dimmer>
        </Modal>
    )
}