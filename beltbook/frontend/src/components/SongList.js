import React, {Fragment} from 'react';
import {Table} from "semantic-ui-react";
import _ from "lodash";
import {SongColumns} from "./SongTable";
import {Link} from "react-router-dom";
import {SongListActionDropdown} from "./SongListActionDropdown";

export const SongList = (props) => {
    let {songs, skip, newTabs, compact, action, bookId} = props;
    if (skip === undefined) skip = [];

    return (
        <Table unstackable compact={compact} selectable basic className='song-list'>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>{_.find(SongColumns, ['key', 'title']).name}</Table.HeaderCell>
                    {skip.includes('original_artist') ? null :
                        <Table.HeaderCell>{_.find(SongColumns, ['key', 'original_artist']).name}</Table.HeaderCell>}
                    {skip.includes('show') ? null :
                        <Table.HeaderCell>{_.find(SongColumns, ['key', 'show']).name}</Table.HeaderCell>}
                    {skip.includes('composer') ? null :
                        <Table.HeaderCell>{_.find(SongColumns, ['key', 'composer']).name}</Table.HeaderCell>}
                    {skip.includes('lyricist') ? null :
                        <Table.HeaderCell>{_.find(SongColumns, ['key', 'lyricist']).name}</Table.HeaderCell>}
                    {skip.includes('gender') ? null :
                        <Table.HeaderCell>{_.find(SongColumns, ['key', 'gender']).name}</Table.HeaderCell>}
                    <Table.HeaderCell>{_.find(SongColumns, ['key', 'song_type']).name}</Table.HeaderCell>
                    <Table.HeaderCell>{_.find(SongColumns, ['key', 'voice_type']).name}</Table.HeaderCell>
                    <Table.HeaderCell>{_.find(SongColumns, ['key', 'character_type']).name}</Table.HeaderCell>
                    <Table.HeaderCell>{_.find(SongColumns, ['key', 'tessitura']).name}</Table.HeaderCell>
                    {skip.includes('era') ? null :
                        <Table.HeaderCell>{_.find(SongColumns, ['key', 'era']).name}</Table.HeaderCell>}
                    {skip.includes('character_name') ? null :
                        <Table.HeaderCell>{_.find(SongColumns, ['key', 'character_name']).name}</Table.HeaderCell>}
                    {action ? <Table.HeaderCell/> : null}
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {songs.map((song) => (
                        <Table.Row key={song.slug}>
                            <Table.Cell key='title'>
                                <Link to={`/song/${song.slug}/`}
                                      target={newTabs ? '_blank' : null}><strong>{song.title}</strong></Link>
                            </Table.Cell>
                            {skip.includes('original_artist') ? null : <Table.Cell key='original_artist'>
                                {song['original_artist'].map((artist, index) => (
                                    <Fragment key={artist.slug}>
                                        {index ? ', ' : ''}
                                        <Link to={`/artist/${artist['slug']}/`}
                                              target={newTabs ? '_blank' : null}>{artist.name}</Link>
                                    </Fragment>
                                ))}
                            </Table.Cell>}
                            {skip.includes('show') ? null : <Table.Cell key='show'>
                                <Link to={`/show/${song['show'].slug}`}
                                      target={newTabs ? '_blank' : null}>{song['show'].name}</Link>
                            </Table.Cell>}
                            {skip.includes('composer') ? null : <Table.Cell key='composer'>
                                {song['composer'].map((artist, index) => (
                                    <Fragment key={artist.slug}>
                                        {index ? ', ' : ''}
                                        <Link to={`/artist/${artist['slug']}/`}
                                              target={newTabs ? '_blank' : null}>{artist.name}</Link>
                                    </Fragment>
                                ))}
                            </Table.Cell>}
                            {skip.includes('lyricist') ? null : <Table.Cell key='lyricist'>
                                {song['lyricist'].map((artist, index) => (
                                    <Fragment key={artist.slug}>
                                        {index ? ', ' : ''}
                                        <Link to={`/artist/${artist['slug']}/`}
                                              target={newTabs ? '_blank' : null}>{artist.name}</Link>
                                    </Fragment>
                                ))}
                            </Table.Cell>}
                            {skip.includes('gender') ? null : <Table.Cell key='gender'>
                                {
                                    Array.isArray(song['gender']) ? song['gender'].join(', ') : song['gender']
                                }
                            </Table.Cell>}
                            <Table.Cell key='song_type'>{song['song_type']}</Table.Cell>
                            <Table.Cell key='voice_type'>{song['voice_type']}</Table.Cell>
                            <Table.Cell key='character_type'>
                                {
                                    Array.isArray(song['character_type'])
                                        ? song['character_type'].join(', ') : song['character_type']}
                            </Table.Cell>
                            <Table.Cell key='tessitura'>{song['tessitura']}</Table.Cell>
                            {skip.includes('era') ? null : <Table.Cell key='era'>{song['era']}</Table.Cell>}
                            {skip.includes('character_name') ? null :
                                <Table.Cell key='character_name'>{song['character_name']}</Table.Cell>}
                            {action ? <Table.Cell key='action'>
                                <SongListActionDropdown action={action} songSlug={song.slug}
                                                        bookId={bookId}/></Table.Cell> : null}
                        </Table.Row>
                    )
                )}
            </Table.Body>
        </Table>
    )
}

SongList.defaultProps = {
    compact: 'very',
    action: [],
}