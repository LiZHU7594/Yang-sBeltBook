import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {Button, Checkbox, Dimmer, Form, Header, Icon, Loader, Modal, TextArea} from "semantic-ui-react";
import {Link} from "react-router-dom";

export const Actions = {edit: 'Edit', create: 'Create'}

export const EditBookModal = (props) => {
    const {action, trigger, songSlug} = props;
    const apiUrl = '/api/books/';
    const [name, setName] = useState(props.name ? props.name : '');
    const [info, setInfo] = useState(props.info ? props.info : '');
    const [isPublic, setIsPublic] = useState(false);
    const [slug, setSlug] = useState(props.slug ? props.slug : '');
    const [owner, setOwner] = useState(props.owner ? props.owner : '');
    const [prompt, setPrompt] = useState({});
    const [songAdded, setSongAdded] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleNameChange = (e, {name, value}) => setName(value);
    const handleInfoChange = (e, {name, value}) => setInfo(value);
    const handlePublicChange = (e, {name, checked}) => setIsPublic(checked);

    useEffect(() => {
        if (action === Actions.edit) {
            setName(props.book.name);
            setInfo(props.book.info);
            setIsPublic(props.book.public);
            setSlug(props.book.slug);
        }
    }, []);

    const handleClick = (e, data) => {
        setLoading(true);
        switch (action) {
            case Actions.create:
                axios.post(apiUrl, {name: name, info: info, public: isPublic}).then(response => {
                    const {status, data} = response;
                    if (status === 201) {
                        if (songSlug) {
                            axios.patch(`${apiUrl}${data.id}/`, {
                                'song': [{slug: songSlug}]
                            }).then(response => {
                                const {status, data} = response;
                                if (status === 200) {
                                    setSongAdded(true);
                                }
                            })
                        }
                        setSlug(data.slug);
                        setOwner(data.owner);
                        setPrompt({success: 'success'});
                    }
                }).catch(error => {
                    setPrompt(error.response.data);
                }).finally(() => {
                    setLoading(false);
                });
                break;
            case Actions.edit:
                axios.patch(`${apiUrl}${props.book.id}/`, {name: name, info: info, public: isPublic})
                    .then(response => {
                        const {status, data} = response;
                        if (status === 200) {
                            if (data.slug !== slug) {
                                props.history.push(`/u/${data.owner}/book/${data.slug}`);
                            } else {
                                window.location.reload();
                            }
                        }
                    }).catch(error => {
                    setPrompt(error.response.data);
                }).finally(() => {
                    setLoading(false);
                });
                break;
            default:
                return;
        }
    }

    return (
        <Modal closeIcon size='tiny'
               trigger={trigger}
               onKeyDown={e => e.stopPropagation()}
               onKeyUp={e => e.stopPropagation()}
               onClick={e => e.stopPropagation()}
               onFocus={e => e.stopPropagation()}
               onMouseOver={e => e.stopPropagation()}>

            <Modal.Header>{`${action} Book${action === Actions.edit ? ' Details' : ''}`}</Modal.Header>
            <Modal.Content image>
                <Modal.Description>
                    <Form>
                        <Form.Field>
                            <label>Name</label>
                            <Form.Input placeholder='Book name' value={name} onChange={handleNameChange}
                                        error={prompt.name && {
                                            content: prompt.name,
                                            pointing: 'above'
                                        }}/>
                        </Form.Field>
                        <Form.Field>
                            <label>Description</label>
                            <TextArea placeholder='Some catchy description about your book.'
                                      value={info} onChange={handleInfoChange}/>
                        </Form.Field>
                        <Form.Field>
                            <Checkbox label='Make Public' checked={isPublic} onChange={handlePublicChange}/>
                        </Form.Field>
                    </Form>
                </Modal.Description>
            </Modal.Content>
            <Modal.Actions>
                <Button positive onClick={handleClick}><Icon name='checkmark'/> Save</Button>
            </Modal.Actions>
            <Dimmer active={!!prompt['success']} inverted>
                <Header as='h2' icon style={{color: '#666666'}}>
                    <Icon name='book' style={{color: '#2bbcff'}}/>
                    Book created!
                    {songAdded ? <Header.Subheader>Added song to your book.</Header.Subheader> : null}
                </Header>
                <div>
                    <Button as={Link} to={`/u/${owner}/book/${slug}`}
                            circular size='big' icon='right arrow'/>
                </div>
            </Dimmer>
            <Dimmer active={loading} inverted>
                <Loader inverted/>
            </Dimmer>
        </Modal>
    )
}