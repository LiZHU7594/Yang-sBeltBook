import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {useParams} from 'react-router-dom';
import {Container, Grid, Header} from "semantic-ui-react";
import {PlaceHolderBlock, SiteName} from "./Utils";
import {SongList} from "./SongList";
import {Helmet} from "react-helmet";

export function Artist(props) {
    let {slug} = useParams();
    let apiUrl = `/api/artists/${slug}/`;
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        name: '',
        slug: '',
        songs_as_artist: [],
        songs_as_composer: [],
        songs_as_lyricist: []
    })

    useEffect(() => {
        setLoading(true);
        axios.get(apiUrl).then(response => {
            const {status, data} = response;
            if (status.toString().startsWith('2')) {
                setData(data);
            }
        })
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
                                <Header.Subheader>Artist</Header.Subheader>
                                {data.name}
                            </Header>
                        </Grid.Column>
                    </Grid.Row>
                    {data.songs_as_artist.length > 0 ? <Grid.Row columns='equal'>
                        <Grid.Column>
                            <Header as='h1'><Header.Subheader>As Original Artist</Header.Subheader></Header>
                            <SongList songs={data.songs_as_artist} skip={['original_artist']}/>
                        </Grid.Column>
                    </Grid.Row> : null}
                    {data.songs_as_composer.length > 0 ? <Grid.Row columns='equal'>
                        <Grid.Column>
                            <Header as='h1'><Header.Subheader>As Composer</Header.Subheader></Header>
                            <SongList songs={data.songs_as_composer} skip={['composer']}/>
                        </Grid.Column>
                    </Grid.Row> : null}
                    {data.songs_as_lyricist.length > 0 ? <Grid.Row columns='equal'>
                        <Grid.Column>
                            <Header as='h1'><Header.Subheader>As Lyricist</Header.Subheader></Header>
                            <SongList songs={data.songs_as_lyricist} skip={['lyricist']}/>
                        </Grid.Column>
                    </Grid.Row> : null}
                </Grid>}
        </Container>
    )
}