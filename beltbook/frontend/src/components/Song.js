import React, {Fragment, useEffect, useLayoutEffect, useState} from "react";
import {Link, useParams} from 'react-router-dom';
import axios from 'axios';
import {Button, Container, Dropdown, Grid, Header, Icon, Label, Popup, Responsive} from "semantic-ui-react";
import {ColumnColor, Notes, PlaceHolderBlock, SiteName} from "./Utils";
import * as Tone from "tone";
import {SheetMusic} from "./SheetMusic";
import {Helmet} from "react-helmet";
import {usernameSubject} from "./Auth";
import {AddToBookModal} from "./AddToBookModal";
import {SearchResultPerPage} from "./SearchCategory";
import musicnotesLogo from "../stylesheets/mn-do.svg";
import playbillLogo from "../stylesheets/playbill-icon.jpeg";

export function Song(props) {
    let {slug} = useParams();
    let apiUrl = `/api/songs/${slug}/`;
    const synth = new Tone.Synth().toMaster();
    const [data, setData] = useState({title: ''});
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState(localStorage.getItem('username'));

    // states for books
    const [books, setBooks] = useState([]);

    // TODO: book pagination
    const [totalPages, setTotalPages] = useState(0);
    const [activePage, setActivePage] = useState(props.page ? props.page : 1);

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
        });
    }, [slug]);

    const handleAddToBookClick = (event, data) => {
        axios.get(`/api/books/`).then(response => {
            const {status, data} = response;
            if (status.toString().startsWith('2')) {
                setBooks(data);
                setTotalPages(Math.ceil(data.count / SearchResultPerPage));
                setActivePage(1);
            }
        });
    }

    return (
        <Container>
            <Helmet>
                <title>{data.title ? `${data.title} - ${SiteName}` : `${SiteName}`}</title>
            </Helmet>
            {!loading ?
                <Grid stackable>
                    <Grid.Row columns='equal'>
                        <Grid.Column>
                            <Header as='h1'>
                                <Header.Subheader>Song</Header.Subheader>
                                {data.title}
                                <Dropdown as={Label} size='big' button circular icon='ellipsis horizontal' basic
                                          style={{display: 'inline-block'}} className='book-edit'>
                                    <Dropdown.Menu>
                                        {username ? <>
                                            <AddToBookModal songSlug={data.slug} books={books}
                                                            trigger={<Dropdown.Item onClick={handleAddToBookClick}>
                                                                Add to Book...</Dropdown.Item>}/>
                                            <Dropdown.Divider/>
                                        </> : null}
                                        <Dropdown.Item text='Share'/>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </Header>
                            <Header as='h2'>
                                <Header.Subheader>From</Header.Subheader>
                                {data.show ? <Link to={`/show/${data.show['slug']}/`}>{data.show['name']}</Link> : null}
                                <Header.Subheader>{data.year}</Header.Subheader>
                            </Header>
                        </Grid.Column>
                    </Grid.Row>

                    <Grid.Row columns='equal'>
                        <Grid.Column>
                            <Header as='h3'>
                                <Header.Subheader>Composer</Header.Subheader>
                                {data.composer ?
                                    data.composer.map(
                                        (c, index) => {
                                            return <Fragment key={c.slug}>
                                                {(index ? ', ' : '')}<Link
                                                to={`/artist/${c.slug}/`}>
                                                {c.name}</Link>
                                            </Fragment>
                                        }
                                    ) : null
                                }
                            </Header>
                        </Grid.Column>
                        <Grid.Column>
                            <Header as='h3'>
                                <Header.Subheader>Lyricist</Header.Subheader>
                                {data.lyricist ?
                                    data.lyricist.map(
                                        (c, index) => {
                                            return <Fragment key={c.slug}>
                                                {(index ? ', ' : '')}<Link
                                                to={`/artist/${c.slug}/`}>
                                                {c.name}</Link>
                                            </Fragment>
                                        }
                                    ) : null
                                }
                            </Header>
                        </Grid.Column>
                        <Grid.Column>
                            <Header as='h3'>
                                <Header.Subheader>Original Artist</Header.Subheader>
                                {data.original_artist ?
                                    data.original_artist.map(
                                        (c, index) => {
                                            return <Fragment key={c.slug}>
                                                {(index ? ', ' : '')}<Link
                                                to={`/artist/${c.slug}/`}>
                                                {c.name}</Link>
                                            </Fragment>
                                        }
                                    ) : null
                                }
                            </Header>
                        </Grid.Column>
                        <Grid.Column>
                            <Header as='h3'>
                                <Header.Subheader>Character Name</Header.Subheader>
                                {
                                    data['character_name']
                                }
                            </Header>
                        </Grid.Column>
                    </Grid.Row>

                    <Grid.Row>
                        <Grid.Column>
                            <Label.Group size='large'>
                                <Label as={Link} to={`/search?voice-type=${data.voice_type}`}
                                       color={ColumnColor.voice_type}>
                                    Voice Type
                                    {data.voice_type ? <Label.Detail>{data.voice_type}</Label.Detail> : null}
                                </Label>
                                {data.gender ?
                                    (Array.isArray(data.gender) ?
                                        data.gender.map(gender =>
                                            <Label as={Link} to={`/search?voice-gender=${gender}`}
                                                   key={gender} color={ColumnColor.gender}>
                                                Voice Gender
                                                <Label.Detail>{gender}</Label.Detail>
                                            </Label>
                                        ) : <Label as={Link} to={`/search?voice-gender=${data.gender}`}
                                                   key={data.gender} color={ColumnColor.gender}>
                                            Voice Gender
                                            <Label.Detail>{data.gender}</Label.Detail>
                                        </Label>) : null
                                }
                                <Label as={Link} to={`/search?tessitura=${data.tessitura}`}
                                       color={ColumnColor.tessitura}>
                                    Tessitura
                                    {data.tessitura ? <Label.Detail>{data.tessitura}</Label.Detail> : null}
                                </Label>

                                <Label as={Link} to={`/search?song-type=${data['song_type']}`}
                                       color={ColumnColor.song_type}>
                                    Song Type
                                    {data['song_type'] ? <Label.Detail>{data['song_type']}</Label.Detail> : null}
                                </Label>
                                <Label as={Link} to={`/search?era=${data.era}`} color={ColumnColor.era}>
                                    Era
                                    {data.era ? <Label.Detail>{data.era}</Label.Detail> : null}
                                </Label>
                                {data.character_type ?
                                    (Array.isArray(data.character_type) ? data.character_type.map(character_type =>
                                        <Popup content='Character Type'
                                               position='top center'
                                               key={character_type}
                                               trigger={
                                                   <Label as={Link} color={ColumnColor.character_type}
                                                          to={`/search?character-type=${character_type}`}>
                                                       {character_type}
                                                   </Label>}/>
                                    ) : <Popup content='Character Type'
                                               position='top center'
                                               key={data.character_type}
                                               trigger={
                                                   <Label as={Link} color={ColumnColor.character_type}
                                                          to={`/search?character-type=${data.character_type}`}>
                                                       {data.character_type}
                                                   </Label>}/>) : null
                                }
                            </Label.Group>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row columns={2} stretched>
                        <Grid.Column>
                            <Header><Header.Subheader>Range</Header.Subheader></Header>
                            <Button.Group>
                                {data.low_note ?
                                    <Button content={data.low_note} icon='headphones'
                                            labelPosition='left'
                                            onClick={() => synth.triggerAttackRelease(Notes[Notes.indexOf(data.low_note)
                                            + (data.gender.includes("Male") ? 12 : 0)], '8n')}/> : null}
                                <Button.Or text='to'/>
                                {data.high_note ?
                                    <Button content={data.high_note} icon='headphones'
                                            labelPosition='right'
                                            onClick={() => synth.triggerAttackRelease(Notes[Notes.indexOf(data.high_note) +
                                            (data.gender.includes("Male") ? 12 : 0)], '8n')}/> : null}
                            </Button.Group>

                            {data.low_note ?
                                <>
                                    <Responsive minWidth={Responsive.onlyTablet.minWidth} as={SheetMusic}
                                                height={160}
                                                notes={
                                                    Notes[Notes.indexOf(data.low_note) + (data.gender.includes("Male") ? 12 : 0)]
                                                    + '/2, '
                                                    + Notes[Notes.indexOf(data.high_note) + (data.gender.includes("Male") ? 12 : 0)]}/>
                                    <Responsive {...Responsive.onlyMobile} as={SheetMusic}
                                                height={160} width={340}
                                                notes={
                                                    Notes[Notes.indexOf(data.low_note) + (data.gender.includes("Male") ? 12 : 0)]
                                                    + '/2, '
                                                    + Notes[Notes.indexOf(data.high_note) + (data.gender.includes("Male") ? 12 : 0)]}/>
                                </>
                                : null}

                        </Grid.Column>
                    </Grid.Row>
                    {data.info ? <Grid.Row columns='equal'>
                        <Grid.Column>
                            <Header as='h4'><Header.Subheader>Additional Info</Header.Subheader>
                                <p>{data.info}</p>
                            </Header>
                        </Grid.Column>
                    </Grid.Row> : null}
                    <Grid.Row columns='equal'>
                        <Grid.Column>
                            <Header><Header.Subheader>Explore</Header.Subheader></Header>
                            <div className='explore-buttons'>
                                <Button basic icon className='youtube' labelPosition='left'
                                        as='a' target='_blank'
                                        href={`https://youtube.com/results?search_query=${data.title}`}>
                                    <Icon name='youtube'/>
                                    Watch on YouTube
                                </Button>
                                <Button basic icon className='spotify' labelPosition='left'
                                        as='a' target='_blank'
                                        href={`https://open.spotify.com/search/${data.title}`}>
                                    <Icon name='spotify'/>
                                    Listen on Spotify
                                </Button>
                                <Button basic icon className='musicnotes' labelPosition='left'
                                        as='a' target='_blank'
                                        href={`https://musicnotes.com/search/go?w=${data.title}`}>
                                    <Icon><img src={`/static/frontend/${musicnotesLogo}`}
                                               alt='musicnotes logo'/></Icon>
                                    Sheet Music on Musicnotes
                                </Button>
                                <Button basic icon className='wikipedia' labelPosition='left'
                                        as='a' target='_blank'
                                        href={`https://www.wikiwand.com/en/${data.show ? data.show.name + ' musical' : data.title}`}>
                                    <Icon name='wikipedia w'/>
                                    Wikipedia
                                </Button>
                                {data.show ?
                                    <Button basic icon className='playbill' labelPosition='left'
                                            as='a' target='_blank'
                                            href={`https://playbill.com/searchpage/search?q=${data.show.name}`}>
                                        <Icon><img src={`/static/frontend/${playbillLogo}`}
                                                   alt='playbill logo'/></Icon>
                                        Playbill
                                    </Button> : null}
                                {/*<Button basic icon className='musicals101' labelPosition='left'
                                        as='a' target='_blank' href='http://musicals101.com'>
                                    <Icon name='graduation cap'/>
                                    Musicals101
                                </Button>*/}
                            </div>
                        </Grid.Column>
                    </Grid.Row>
                </Grid> : <PlaceHolderBlock header paragraph repeat={4} lines={6}/>}
        </Container>);
}