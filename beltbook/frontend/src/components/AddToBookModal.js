import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {Button, Divider, Grid, Header, Icon, List, Modal, Responsive, Segment} from "semantic-ui-react";
import {Link} from "react-router-dom";
import {Actions, EditBookModal} from "./EditBookModal";

export const AddToBookModal = (props) => {
    const {trigger, songSlug, books} = props;
    const [booksAdded, setBooksAdded] = useState({});
    const [booksAdding, setBooksAdding] = useState({});

    useEffect(() => {
        const map = {};
        if ('results' in books) {
            books.results.forEach(book => {
                map[book.slug] = false;
            })
            setBooksAdded(map);
            setBooksAdding({...map});
        }
    }, [books]);

    const handleClick = (e, data) => {
        const id = data['data-book-id'];
        const slug = data['data-book-slug'];

        if (!booksAdded[slug]) {
            const adding = {}
            Object.assign(adding, booksAdding);
            adding[slug] = true;
            setBooksAdding(adding);

            const map = {};
            Object.assign(map, booksAdded);
            axios.patch(`/api/books/${id}/`, {
                'song': [{slug: songSlug}]
            }).then(response => {
                const {status, data} = response;
                if (status === 200) {
                    adding[slug] = false;
                    setBooksAdding(adding);
                    map[slug] = true;
                    setBooksAdded(map);
                }
            });
        }
    }

    return (
        <Modal closeIcon trigger={trigger} size='small'
               onKeyDown={e => e.stopPropagation()}
               onKeyUp={e => e.stopPropagation()}
               onClick={e => e.stopPropagation()}
               onFocus={e => e.stopPropagation()}
               onMouseOver={e => e.stopPropagation()}>
            <Modal.Content>
                <Segment basic>
                    <Grid columns='equal' relaxed='very' stackable>
                        <Grid.Column verticalAlign='middle' textAlign='center'>
                            <EditBookModal songSlug={songSlug} action={Actions.create}
                                           trigger={<div style={{cursor: 'pointer'}}>
                                               <Icon.Group size='huge'>
                                                   <Icon name='book' style={{color: '#999999'}}/>
                                                   <Icon corner='bottom right' name='add' style={{color: '#cecece'}}/>
                                               </Icon.Group>
                                               <Header as='h2' icon style={{color: '#666666', display: 'block'}}>Create
                                                   a new
                                                   book</Header>
                                           </div>}/>
                        </Grid.Column>
                        {'results' in books && books.results.length > 0 ? <Grid.Column>
                            <Responsive {...Responsive.onlyMobile}><Divider horizontal>Or</Divider></Responsive>
                            <Header as='h2' content='Choose book'/>
                            <List divided relaxed className='add-book-list'>
                                {books.results.map((book, idx) => (
                                    <List.Item key={book.slug}>
                                        <List.Content floated='right'>
                                            <Button circular toggle loading={booksAdding[book.slug]}
                                                    icon={booksAdded[book.slug] ? 'checkmark' : 'plus'}
                                                    data-book-id={book.id}
                                                    data-book-slug={book.slug}
                                                    active={booksAdded[book.slug]}
                                                    onClick={handleClick}/>
                                        </List.Content>
                                        <List.Content>
                                            <List.Header as={Link} target='_blank'
                                                         to={`/u/${book.owner}/book/${book.slug}`}>{book.name}</List.Header>
                                            <List.Description>{book.info ? book.info : 'No description'}</List.Description>
                                        </List.Content>
                                    </List.Item>
                                ))}
                            </List>
                        </Grid.Column> : null}
                    </Grid>
                    {'results' in books && books.results.length > 0 ?
                        <Responsive minWidth={Responsive.onlyTablet.minWidth}><Divider
                            vertical>Or</Divider></Responsive> : null}
                </Segment>
            </Modal.Content>
        </Modal>
    )
}