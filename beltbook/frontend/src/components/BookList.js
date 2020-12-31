import React, {useLayoutEffect, useState} from 'react';
import {Card, Grid, Icon, List} from "semantic-ui-react";
import _ from 'lodash';
import {NavLink} from "react-router-dom";
import {usernameSubject} from "./Auth";

const SongPreviewNumber = 4;

export const BookList = (props) => {
    const {books} = props;
    const [username, setUsername] = useState(localStorage.getItem('username'));

    useLayoutEffect(() => {
        const sub = usernameSubject.subscribe(setUsername);
        return () => {
            sub.unsubscribe();
        }
    }, []);

    return (
        <Grid stackable columns={4} stretched relaxed>
            {books.map((book, idx) => (
                <Grid.Column key={book.slug}>
                    <Card as={NavLink} to={`/u/${username}/book/${book.slug}`} fluid>
                        {/*<Image src={`https://picsum.photos/400?random=${idx}`}/>*/}
                        <Card.Content style={{flexGrow: 0}}>
                            <Card.Header>{book.name}</Card.Header>
                        </Card.Content>
                        <Card.Content>
                            {book.info ? <Card.Meta>{book.info}</Card.Meta> : null}
                            <Card.Description>
                                <List>
                                    {_.take(book.song, SongPreviewNumber).map((song) =>
                                        <List.Item key={song.slug}>
                                            {song.title}
                                        </List.Item>)}
                                    {book.song.length > SongPreviewNumber ?
                                        <List.Item>and more...</List.Item> : null}
                                </List>
                            </Card.Description>
                        </Card.Content>
                        <Card.Content extra>
                            {book.song.length} {`song${book.song.length !== 1 ? 's' : ''}`}, {book.public ?
                            <strong>public <Icon name='users'/></strong> :
                            <strong>private <Icon name='lock'/></strong>}
                        </Card.Content>
                    </Card>
                </Grid.Column>
            ))}
        </Grid>
    )
}