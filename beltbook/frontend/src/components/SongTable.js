import React, {Component, Fragment} from "react";
import _ from 'lodash';
import axios from 'axios';
import {Icon, Pagination, Popup, Table} from "semantic-ui-react";
import {Link} from "react-router-dom";
import {SheetMusic} from "./SheetMusic";

export const SongColumns = [
    {key: 'title', name: 'Title'},
    {key: 'show', name: 'Show'},
    {key: 'original_artist', name: 'Original Artist'},
    {key: 'composer', name: 'Composer'},
    {key: 'lyricist', name: 'Lyricist'},
    {key: 'character_name', name: 'Character Name'},
    {key: 'voice_type', name: 'Voice Type'},
    {key: 'tessitura', name: 'Tessitura'},
    {key: 'gender', name: 'Voice Gender'},
    {key: 'character_type', name: 'Character Type'},
    {key: 'low_note', name: 'Low Note'},
    {key: 'high_note', name: 'High Note'},
    {key: 'song_type', name: 'Song Type'},
    {key: 'year', name: 'Year'},
    {key: 'era', name: 'Era'},
    {key: 'info', name: 'Additional Info'}
];
const SongPerPage = 20;

let cancel;

export function getSongs(page) {
    if (cancel) {
        cancel.cancel();
    }
    cancel = axios.CancelToken.source();
    return axios.get(`/api/songs/?page=${page === undefined ? 1 : page}`,
        {
            cancelToken: cancel.token
        }).catch(function (thrown) {
            if (axios.isCancel(thrown)) {
                // do nothing
            }
    });
}

export class SongTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sortByColumn: null,
            data: [],
            direction: null,
            count: 0,
            next: null,
            previous: null,
            totalPages: 0,
            activePage: 0,
        }
    }

    handleSort = (clickedColumn) => () => {
        const {sortByColumn, data, direction} = this.state;

        if (sortByColumn !== clickedColumn) {
            this.setState({
                sortByColumn: clickedColumn,
                data: _.sortBy(data, [clickedColumn]),
                direction: 'ascending',
            });
            return
        }

        this.setState({
            data: data.reverse(),
            direction: direction === 'ascending' ? 'descending' : 'ascending',
        })
    };

    onPageChange = (e, pageInfo) => {
        this.props.history.push(`?page=${pageInfo.activePage}`);
        getSongs(pageInfo.activePage).then(response => {
            if (response) {
                const {status, data} = response;
                if (status.toString().startsWith('2')) {
                    this.setState({
                        data: data.results,
                        count: data.count,
                        next: data.next,
                        previous: data.previous,
                    });
                    this.setState({activePage: pageInfo.activePage});
                }
            }
        })
    };

    componentDidMount() {
        const page = this.props.page ? this.props.page : 1;
        getSongs(page).then(response => {
            const {status, data} = response;
            if (status.toString().startsWith('2')) {
                this.setState(() => {
                    return {
                        data: data.results,
                        count: data.count,
                        next: data.next,
                        previous: data.previous,
                        totalPages: Math.ceil(data.count / SongPerPage),
                        activePage: page,
                    }
                });
            }
        })
    }

    componentWillUnmount() {
        if (cancel) {
            cancel.cancel();
        }
    }

    render() {
        const {sortByColumn, data, direction} = this.state;
        if (data.length > 0) {
            return (
                <>
                    <Pagination totalPages={this.state.totalPages}
                                activePage={this.state.activePage}
                                firstItem={null}
                                lastItem={null}
                                onPageChange={this.onPageChange}/>
                    <Table sortable compact={"very"} celled>
                        <Table.Header>
                            <Table.Row>
                                {SongColumns.map((column) => (
                                    <Table.HeaderCell
                                        sorted={sortByColumn === column.key ? direction : null}
                                        onClick={this.handleSort(column.key)}
                                        key={column.key}>
                                        {column.name}
                                    </Table.HeaderCell>
                                ))}
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {data.map((song, index) => (
                                <Table.Row key={index}>
                                    <Table.Cell key='title'>
                                        <Link to={`/song/${song['slug']}/`}>{song.title}</Link>
                                    </Table.Cell>
                                    <Table.Cell key='show'>
                                        <Link to={`/show/${song.show['slug']}/`}>{song.show.name}</Link>
                                    </Table.Cell>
                                    <Table.Cell key='original_artist'>
                                        {
                                            song['original_artist'].map((artist, index) => (
                                                <Fragment key={artist.id}>
                                                    {index ? ', ' : ''}
                                                    <Link to={`/artist/${artist['slug']}/`}>{artist.name}</Link>
                                                </Fragment>
                                            ))
                                        }
                                    </Table.Cell>
                                    <Table.Cell key='composer'>
                                        {
                                            song['composer'].map((artist, index) => (
                                                <Fragment key={artist.id}>
                                                    {index ? ', ' : ''}
                                                    <Link to={`/artist/${artist['slug']}/`}>{artist.name}</Link>
                                                </Fragment>
                                            ))
                                        }
                                    </Table.Cell>
                                    <Table.Cell key='lyricist'>
                                        {
                                            song['lyricist'].map((artist, index) => (
                                                <Fragment key={artist.id}>
                                                    {index ? ', ' : ''}
                                                    <Link to={`/artist/${artist['slug']}/`}>{artist.name}</Link>
                                                </Fragment>
                                            ))
                                        }
                                    </Table.Cell>
                                    <Table.Cell key='character_name'>{song['character_name']}</Table.Cell>
                                    <Table.Cell key='voice_type'>{song['voice_type']}</Table.Cell>
                                    <Table.Cell key='tessitura'>{song['tessitura']}</Table.Cell>
                                    <Table.Cell key='gender'>{Array.isArray(song['gender']) ?
                                        song['gender'].join(', ') : song['gender']}</Table.Cell>
                                    <Table.Cell
                                        key='character_type'>{Array.isArray(song['character_type']) ? song['character_type'].join(', ') : song['character_type']}</Table.Cell>
                                    <Table.Cell key='low_note'>
                                        {song['low_note']}
                                        {song['low_note'] &&
                                        <Popup on={['click', 'focus']}
                                               pinned
                                               position={"right center"}
                                               trigger={<Icon name={'info circle'}/>}>
                                            <Popup.Content>
                                                <SheetMusic notes={song['low_note'] + '/1'}/>
                                            </Popup.Content>
                                        </Popup>
                                        }
                                    </Table.Cell>
                                    <Table.Cell key='high_note'>
                                        {song['high_note']}
                                        {song['high_note'] &&
                                        <Popup on={['click', 'focus']}
                                               pinned
                                               position={"right center"}
                                               trigger={<Icon name={'info circle'}/>}>
                                            <Popup.Content>
                                                <SheetMusic notes={song['high_note'] + '/1'}/>
                                            </Popup.Content>
                                        </Popup>
                                        }
                                    </Table.Cell>
                                    <Table.Cell key='song_type'>{song['song_type']}</Table.Cell>
                                    <Table.Cell key='year'>{song['year']}</Table.Cell>
                                    <Table.Cell key='era'>{song['era']}</Table.Cell>
                                    <Table.Cell key='info'>{song['info']}</Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table>
                </>
            )
        } else return null;
    }
}