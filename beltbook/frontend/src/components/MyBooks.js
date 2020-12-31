import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import axios from 'axios';
import {Button, Container, Grid, Header, Label, Pagination, Table} from "semantic-ui-react";
import {Helmet} from "react-helmet";
import {PlaceHolderBlock, SiteName} from "./Utils";
import {SearchResultPerPage} from "./SearchCategory";
import {BookList} from "./BookList";
import {Actions, EditBookModal} from "./EditBookModal";

export const MyBooks = (props) => {
    const {user} = useParams();
    let apiUrl = '/api/books/';
    const [data, setData] = useState({});

    // TODO: book pagination
    const [totalPages, setTotalPages] = useState(0);
    const [activePage, setActivePage] = useState(props.page ? props.page : 1);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        axios.get(apiUrl).then(response => {
            const {status, data} = response;
            if (status.toString().startsWith('2')) {
                setData(data);
                setTotalPages(Math.ceil(data.count / SearchResultPerPage));
                setActivePage(1);
            }
            setLoading(false);
        }).catch(error => {
            // TODO: fix book vs. user logic
            console.log(error.response);
            props.history.push('/login');
        })
    }, []);

    /**
     * Handler for pagination page change.
     * @param e
     * @param {object} pageInfo
     */
    const onPageChange = (e, pageInfo) => {
    }

    return (
        <Container>
            <Helmet>
                <title>{`My Books - ${SiteName}`}</title>
            </Helmet>
            {!loading ? <Grid stackable>
                <Grid.Row columns='equal'>
                    <Grid.Column>
                        <Header as='h1'>My Books
                            <EditBookModal action={Actions.create}
                                           trigger={<Label content='New Book' icon='plus' as={Button}/>}/>
                        </Header>
                    </Grid.Column>
                </Grid.Row>
                {totalPages > 1 ? <Grid.Row columns='equal'>
                    <Grid.Column>
                        <Table basic='very'>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>
                                        <Header as='h1'>{data.count}
                                            <Header.Subheader>
                                                book{data.count !== 1 ? 's' : null} created by you
                                            </Header.Subheader>
                                        </Header>
                                    </Table.HeaderCell>
                                    {totalPages > 1 ?
                                        <Table.HeaderCell colSpan='3'>
                                            <Pagination floated='right'
                                                        firstItem={null}
                                                        lastItem={null}
                                                        totalPages={totalPages}
                                                        activePage={activePage}
                                                        onPageChange={onPageChange}/>
                                        </Table.HeaderCell> : null}
                                </Table.Row>
                            </Table.Header>
                        </Table>
                    </Grid.Column>
                </Grid.Row> : null}
            </Grid> : <PlaceHolderBlock header paragraph repeat={2} lines={4}/>}
            {'results' in data ? <BookList books={data.results}/> : null}
        </Container>
    )
}