import React, {Fragment, useEffect, useState} from 'react';
import axios from 'axios';
import _ from 'lodash';
import {Link, useParams} from 'react-router-dom';
import {Container, Grid, Header} from "semantic-ui-react";
import {PlaceHolderBlock, SiteName} from "./Utils";
import {SongList} from "./SongList";
import {Helmet} from "react-helmet";

export function Show(props) {
    let {slug} = useParams();
    let apiUrl = `/api/shows/${slug}/`;
    const [data, setData] = useState({name: '', slug: '', songs: []});
    const [composer, setComposer] = useState([]);
    const [lyricist, setLyricist] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        axios.get(apiUrl).then(response => {
            const {status, data} = response;
            if (status.toString().startsWith('2')) {
                setData(data);
            }
            const composers = [];
            const lyricists = [];

            data.songs.forEach(song => {
                if (song.composer && song.composer.length > 0) {
                    song.composer.forEach(c => composers.push(c));
                }
                if (song.lyricist && song.lyricist.length > 0) {
                    song.lyricist.forEach(l => lyricists.push(l));
                }
            });
            setComposer(_.uniqBy(composers, 'slug'));
            setLyricist(_.uniqBy(lyricists, 'slug'));
        });

        setLoading(false);
    }, [slug]);

    return (
        <Container>
            <Helmet>
                <title>{data.name ? `${data.name} - ${SiteName}` : `${SiteName}`}</title>
            </Helmet>
            {loading ? <PlaceHolderBlock header paragraph repeat={2} lines={4}/> :
                <Grid stackable>
                    <Grid.Row columns='equal'>
                        <Grid.Column>
                            <Header as='h1'>
                                <Header.Subheader>Show</Header.Subheader>
                                {data.name}
                            </Header>
                        </Grid.Column>
                    </Grid.Row>

                    <Grid.Row columns='equal'>
                        <Grid.Column>
                            <Header as='h3'>
                                <Header.Subheader>Composer{composer.length > 1 ? 's' : null}</Header.Subheader>
                                {composer.map(
                                    (c, index) => {
                                        return <Fragment key={c.slug}>
                                            {(index ? ', ' : '')}<Link
                                            to={`/artist/${c.slug}/`}>
                                            {c.name}</Link>
                                        </Fragment>
                                    }
                                )}
                            </Header>
                        </Grid.Column>
                        <Grid.Column>
                            <Header as='h3'>
                                <Header.Subheader>Lyricist{lyricist.length > 1 ? 's' : null}</Header.Subheader>
                                {lyricist.map(
                                    (c, index) => {
                                        return <Fragment key={c.slug}>
                                            {(index ? ', ' : '')}<Link
                                            to={`/artist/${c.slug}/`}>
                                            {c.name}</Link>
                                        </Fragment>
                                    }
                                )}
                            </Header>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row columns='equal'>
                        <Grid.Column>
                            <Header as='h1'><Header.Subheader>Song{data.songs.length > 1 ? 's' : null}</Header.Subheader></Header>
                            <SongList songs={data.songs} skip={['show']}/>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>}
        </Container>
    )
}