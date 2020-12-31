import React, {useEffect, useLayoutEffect, useState} from 'react';
import {Link, NavLink, useParams} from 'react-router-dom';
import axios from 'axios';
import {Button, Container, Divider, Dropdown, Grid, Header, Icon, Label, Popup} from "semantic-ui-react";
import {Helmet} from "react-helmet";
import {PlaceHolderBlock, SiteName} from "./Utils";
import {SongList} from "./SongList";
import {usernameSubject} from "./Auth";
import {DeleteBookModal} from "./DeleteBookModal";
import {Actions, EditBookModal} from "./EditBookModal";
import {Actions as SongListActions} from "./SongListActionDropdown";

export const Book = (props) => {
    let {user, slug} = useParams();
    const apiUrl = `/api/books/${user}/${slug}/`;
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState(localStorage.getItem('username'));

    useLayoutEffect(() => {
        const sub = usernameSubject.subscribe(setUsername);
        return () => {
            sub.unsubscribe();
        }
    }, []);

    useEffect(() => {
        setLoading(true);
        axios.get(apiUrl).then(response => {
            const {status, data} = response;
            if (status.toString().startsWith('2')) {
                setData(data);
            }
            setLoading(false);
        })
    }, [user, slug]);

    const handleMakePublic = (event, d) => {
        const makePublic = !data.public;
        axios.patch(`/api/books/${data.id}/`, {public: makePublic}).then(response => {
            const {status, data} = response;
            if (status === 200) {
                window.location.reload();
            }
        })
    }

    return (
        <Container>
            <Helmet>
                <title>{data.name ? `${data.name} - ${SiteName}` : `${SiteName}`}</title>
            </Helmet>
            {!loading ? <Grid stackable>
                <Grid.Row columns='equal'>
                    <Grid.Column>
                        <Header as='h1'>
                            <Header.Subheader>Book</Header.Subheader>
                            {data.name} {data.public ?
                            <Popup trigger={<Label><Icon name='users'/>Public</Label>} hideOnScroll
                                   content='Anyone with the link to this book can view it'/> :
                            <Popup trigger={<Label><Icon name='lock'/>Private</Label>} hideOnScroll
                                   content='Only you can see this book'/>}
                            <Dropdown as={Label} size='big' button circular icon='ellipsis horizontal' basic
                                      style={{display: 'inline-block'}} className='book-edit'>
                                <Dropdown.Menu>
                                    {data.owner === username ? <>
                                        <Dropdown.Item text={data.public ? 'Make Private' : 'Make Public'}
                                                       onClick={handleMakePublic}/>
                                        <Dropdown.Divider/>
                                        <EditBookModal action={Actions.edit}
                                                       trigger={<Dropdown.Item text='Edit Details'/>}
                                                       book={data} history={props.history}/>
                                        <DeleteBookModal book={data} history={props.history}/>
                                        <Dropdown.Divider/>
                                    </> : null}
                                    <Dropdown.Item text='Share'/>
                                </Dropdown.Menu>
                            </Dropdown>
                        </Header>
                    </Grid.Column>
                </Grid.Row>
                {data.info ? <Grid.Row columns={2}>
                    <Grid.Column>
                        <p>{data.info}</p>
                    </Grid.Column>
                </Grid.Row> : null}
                <Grid.Row columns='equal'>
                    <Grid.Column>
                        <Header as='h3'>
                            <Header.Subheader>Created by</Header.Subheader>
                            <Link to='#'>{data.owner}</Link>
                        </Header>
                    </Grid.Column>
                    <Grid.Column>
                        <Header>
                            <Header.Subheader>Includes</Header.Subheader>
                            {'song' in data ? `${data.song.length} Song${data.song.length === 1 ? '' : 's'}` : ''}
                        </Header>
                    </Grid.Column>
                    <Grid.Column>
                        <Header as='h3'>
                            <Header.Subheader>Created on</Header.Subheader>
                            {new Date(data.created).toDateString()}
                        </Header>
                    </Grid.Column>
                    <Grid.Column>
                        <Header as='h3'>
                            <Header.Subheader>Updated on</Header.Subheader>
                            {new Date(data.modified).toDateString()}
                        </Header>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row columns='equal'>
                    {'song' in data && data.song.length > 0 ?
                        <Grid.Column>
                            <Header as='h2'>Songs</Header>
                            <SongList songs={data.song} newTabs={true} compact={false}
                                      action={username ? (user === username ?
                                          [SongListActions.deleteFromBook, SongListActions.addToBook, SongListActions.share]
                                          : [SongListActions.addToBook, SongListActions.share])
                                          : [SongListActions.share]}
                                      bookId={data.id}
                                      skip={['original_artist', 'character_name', 'gender', 'composer', 'lyricist']}/>
                        </Grid.Column>
                        : <Grid.Column textAlign='center' style={{paddingTop: '4rem'}}>
                            <Header as='h1'>
                                <Icon name='book'/>
                            </Header>
                            <Divider horizontal>This book is empty.</Divider>
                            <Header as='h1'>
                                Let's add songs!</Header>
                            <p><Button as={NavLink} to='/search' primary size='small' content='Search' icon='search'
                                       labelPosition='left'/> for a song then
                                select <Icon name='ellipsis horizontal'/>to add to your book</p>
                        </Grid.Column>}
                </Grid.Row>
            </Grid> : <PlaceHolderBlock header paragraph repeat={2} lines={4}/>}
        </Container>
    )
}