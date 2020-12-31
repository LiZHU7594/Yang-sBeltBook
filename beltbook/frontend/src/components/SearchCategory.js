import React, {Fragment, useEffect, useLayoutEffect, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import _ from 'lodash';
import axios from 'axios';
import {
    Button,
    Container,
    Grid,
    Header,
    Icon,
    Label,
    Pagination,
    Placeholder,
    Responsive,
    Search,
    Segment,
    Table
} from "semantic-ui-react";
import {ColumnColor, SiteName} from "./Utils";
import {SongList} from "./SongList";
import {Helmet} from "react-helmet";
import {Actions} from "./SongListActionDropdown";
import {usernameSubject} from "./Auth";

export const SearchResultPerPage = 20;
const AutocompleteListSize = 6;

let cancel;
const apiUrl = (c) => `/api/${c}/?`;

const getSongs = (query, page) => {
    if (cancel) {
        cancel.cancel();
    }
    cancel = axios.CancelToken.source();
    let url = apiUrl('songs');
    if (page > 1) url = apiUrl('songs') + `page=${page}`;
    url += query;
    return axios.get(url, {
        cancelToken: cancel.token
    }).catch(function (thrown) {
        if (axios.isCancel(thrown)) {
            // do nothing
        }
    });
}

const resultRenderer = ({match, redirect, title, show, original_artist, composer, lyricist, slug}) => {
    const description = [];
    if (match && match.length === 1 && match[0] === 'title') {
        // if only 'title' matches, add 'show' to description for visual consistency,
        // also avoid mix up for songs with same name
        description.push(<>from show {show.name}</>)
    } else if (match) {
        if (match.includes('show')) {
            description.push(<>from show <strong>{show.name}</strong></>);
        } else {
            description.push(<>from show {show.name}</>);
        }
        if (match.includes('original_artist')) description.push(<>original
            artist <strong>{original_artist.map(o => o.name).join(', ')}</strong></>);
        if (match.includes('composer')) description.push(<>composer <strong>{composer.map(o => o.name).join(', ')}</strong></>);
        if (match.includes('lyricist')) description.push(<>lyricist <strong>{lyricist.map(o => o.name).join(', ')}</strong></>);
    }

    return redirect ? (
        <div key='content' className='content'>
            {title && <div className='title'>{title}
                <span style={{marginLeft: '.75em'}}><Link to={`/${redirect}/${slug}/`}
                                                          target='_blank'><small>details</small></Link></span>
            </div>}
            {match && <div className='description'>
                {description.map((d, index) => (
                    <Fragment key={index}>
                        {index ? ', ' : ''}
                        {d}
                    </Fragment>
                ))}
            </div>}
        </div>
    ) : (
        <Link to={`/song/${slug}`} target='_blank'>
            <div key='content' className='content'>
                {title && <div className='title'>{title}</div>}
                {match && <div className='description'>
                    {description.map((d, index) => (
                        <Fragment key={index}>
                            {index ? ', ' : ''}
                            {d}
                        </Fragment>
                    ))}
                </div>}
            </div>
        </Link>
    )
}

export function SearchCategory(props) {
    let {keyword} = useParams();
    const {title, queryParams} = props;
    const [data, setData] = useState({});
    const [totalPages, setTotalPages] = useState(0);
    const [activePage, setActivePage] = useState(props.page ? props.page : 1);
    const [query, setQuery] = useState('');
    const [choice, setChoice] = useState(
        {
            'voice_type': [],
            'gender': [],
            'tessitura': [],
            'era': [],
            'song_type': [],
            'character_type': [],
            'note': [],
        }
    );
    const [categoryLoading, setCategoryLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [autocomplete, setAutocomplete] = useState({});
    const [searchValue, setSearchValue] = useState(keyword ? keyword : '');
    const [username, setUsername] = useState(localStorage.getItem('username'));

    useLayoutEffect(() => {
        const sub = usernameSubject.subscribe(setUsername);
        return () => {
            sub.unsubscribe();
        }
    })

    // load all category definitions
    useEffect(() => {
        setCategoryLoading(true);
        const requests = Object.keys(choice).map(c => axios.get(apiUrl(c)));
        axios.all(requests).then(axios.spread((...responses) => {
            setChoice({
                'voice_type': responses[0].data.map(d => toCategorySelect(d)),
                'gender': responses[1].data.map(d => toCategorySelect(d)),
                'tessitura': responses[2].data.map(d => toCategorySelect(d)),
                'era': responses[3].data.map(d => toCategorySelect(d)),
                'song_type': responses[4].data.map(d => toCategorySelect(d)),
                'character_type': responses[5].data.map(d => toCategorySelect(d)),
                'note': responses[6].data,
            });
            setCategoryLoading(false);
        }));
    }, []);

    // pre-select category if present in url params
    useEffect(() => {
        if (Object.values(choice).some(x => x.length > 0) &&
            Object.values(queryParams).some(x => (x !== null && x !== ''))) {
            // TODO: modifying "choice" state in this way seems problematic
            for (let [key, value] of Object.entries(choice)) {
                value.find((o, i, arr) => {
                    if (o.name === queryParams[key]) {
                        arr[i] = {name: o.name, selected: true};
                        return true;
                    }
                });
                choice[key] = value;
            }
            handleSearch();
        }
    }, [choice]);

    // preload SongList if keyword presents in route
    useEffect(() => {
        if (keyword) {
            setLoading(true);
            getSongs(`search=${keyword}`).then(response => {
                const {status, data} = response;
                if (status.toString().startsWith('2')) {
                    setData(data);
                }
                setTotalPages(Math.ceil(data.count / SearchResultPerPage));
                setActivePage(1);
                setLoading(false);
            });
        }
    }, [keyword]);

    const toCategorySelect = (data) => ({name: data, selected: false});

    // This handles the search button click
    const handleSearch = () => {
        if (searchValue) {
            // props.history.push(`/search/${searchValue}`);
            keyword = searchValue;
        }
        // reset page to 1
        setLoading(true);
        let q = query;
        if (searchValue) {
            q += `&search=${searchValue}`;
        } else {
            q = choiceToQuery(choice);
        }
        setQuery(q);
        getSongs(q, 1).then(response => {
            const {status, data} = response;
            if (status.toString().startsWith('2')) {
                setData(data);
            }
            setTotalPages(Math.ceil(data.count / SearchResultPerPage));
            setActivePage(1);
            setLoading(false);
        });
    }

    /**
     * Handler for selecting search bar autocomplete suggestion.
     * @param e
     * @param {object} result
     */
    const handleResultSelect = (e, {result}) => {
        setSearchValue(result.title);
        handleSearchChange(null, {value: result.title});
    }

    /**
     * Handler for the search bar autocomplete.
     * @param e
     * @param {object} value
     */
    const handleSearchChange = (e, {value}) => {
        if (value) {
            setLoading(true);
            setSearchValue(value);
            const requests = ['songs', 'shows', 'artists'].map(c => axios.get(apiUrl(c) + `search=${value}`));

            axios.all(requests).then(axios.spread((...responses) => {
                let r = {};
                if (responses[0].data.count > 0) {
                    // all entries in "song" category will have a special attribute "match"
                    r['songs'] = {
                        name: 'Songs',
                        results: _.take(responses[0].data.results, AutocompleteListSize).map(s => {
                            const titleContains = s.title.toLowerCase().includes(value.toLowerCase());
                            const showContains = s.show.name.toLowerCase().includes(value.toLowerCase());
                            const ogArtistContains = _.filter(s['original_artist'],
                                (o) => o.name.toLowerCase().includes(value.toLowerCase()))
                                .length > 0;
                            const composerContains = _.filter(s['composer'],
                                (o) => o.name.toLowerCase().includes(value.toLowerCase()))
                                .length > 0;
                            const lyricistContains = _.filter(s['lyricist'],
                                (o) => o.name.toLowerCase().includes(value.toLowerCase()))
                                .length > 0;
                            s['match'] = [];
                            if (titleContains) s['match'].push('title');
                            if (showContains) s['match'].push('show');
                            if (ogArtistContains) s['match'].push('original_artist');
                            if (composerContains) s['match'].push('composer');
                            if (lyricistContains) s['match'].push('lyricist');
                            return s;
                        })
                    };
                }
                // "show" and "artist" entries in the autocomplete dropdown will have a redirect link
                if (responses[1].data.count > 0) {
                    r['shows'] = {
                        name: 'Shows',
                        results: _.take(responses[1].data.results, AutocompleteListSize).map(s => {
                            return {'title': s.name, 'slug': s.slug, 'redirect': 'show'};
                        })
                    }
                }
                if (responses[2].data.count > 0) {
                    r['artists'] = {
                        name: 'Artists',
                        results: _.take(responses[2].data.results, AutocompleteListSize).map(s => {
                            return {'title': s.name, 'slug': s.slug, 'redirect': 'artist'};
                        })
                    };
                }
                setAutocomplete(r);
                setLoading(false);
            }));
        } else {
            // clear autocomplete
            setAutocomplete([]);
            setSearchValue('');
        }
    }

    /**
     * Handler for label click in categories.
     * @param event
     * @param {object} data data attribute dict on the label
     * @param {string} name the name of the category of this label
     * @param {boolean} multiple allow multiple choices
     */
    const handleLabelClick = (event, data, name, multiple = false) => {
        let v = choice[name];
        v = v.map(i => {
            if (i.name === data['data-label-id']) {
                i.selected = !i.selected;
            } else if (!multiple) {
                i.selected = false;
            }
            return i;
        });
        let c = {};
        Object.assign(c, choice)
        c[name] = v;
        setChoice(c);
        setQuery(choiceToQuery(choice));
    };

    /**
     * Compile categorized choices into query string.
     * @param {object} choice the dict of current choices
     * @returns {string}
     */
    const choiceToQuery = (choice) => {
        return '&' + Object.keys(choice).map(key => {
            const selected = choice[key].filter(c => c.selected);
            if (selected.length === 1) {
                if (['gender', 'character_type'].includes(key)) return `${key}__regex=(^|,)${selected[0].name}(,|$)`;
                else return `${key}=${selected[0].name}`
            } else if (selected.length > 1 && selected.length < choice[key].length) {
                if (key === 'gender') {
                    return;
                }
                return `${key}__in=${selected.map(s => s.name).join(',')}`;
            }
        }).filter(c => !!c).join('&');
    }

    /**
     * Handler for pagination page change.
     * @param e
     * @param {object} pageInfo
     */
    const onPageChange = (e, pageInfo) => {
        getSongs(query, pageInfo.activePage).then(response => {
            if (response) {
                const {status, data} = response;
                if (status.toString().startsWith('2')) {
                    setData(data);
                    setActivePage(pageInfo.activePage);
                    setTotalPages(Math.ceil(data.count / SearchResultPerPage));
                }
            }
        });
    }

    return (
        <Container>
            <Helmet>
                <title>{`Search - ${SiteName}`}</title>
            </Helmet>
            <Grid stackable>
                {/* search bar with autocomplete*/}
                <Grid.Row columns='equal'>
                    <Grid.Column>
                        <Responsive as={Search} minWidth={Responsive.onlyTablet.minWidth}
                                    category
                                    input={{
                                        fluid: true, size: 'massive',
                                        placeholder: 'search songs, shows, artists, composers, lyricists...',
                                        icon: <Icon name='search' circular link
                                                    onClick={handleSearch}/>
                                    }}
                                    loading={loading}
                                    onResultSelect={handleResultSelect}
                                    onSearchChange={_.debounce(handleSearchChange, 500, {leading: true})}
                                    results={autocomplete}
                                    resultRenderer={resultRenderer}
                                    fluid={true}/>
                        <Responsive as={Search} {...Responsive.onlyMobile}
                                    category
                                    input={{
                                        fluid: true, size: 'massive',
                                        placeholder: 'search songs, shows, artists, composers, lyricists...',
                                        icon: null
                                    }}
                                    loading={loading}
                                    onResultSelect={handleResultSelect}
                                    onSearchChange={_.debounce(handleSearchChange, 500, {leading: true})}
                                    results={autocomplete}
                                    resultRenderer={resultRenderer}
                                    fluid={true}/>
                    </Grid.Column>
                </Grid.Row>
                {/* search category row 1 */}
                <Grid.Row columns='equal'>
                    <Grid.Column>
                        <Header sub attached='top'>
                            Voice Type
                        </Header>
                        <Segment attached>
                            {categoryLoading ? (
                                <Placeholder>
                                    <Placeholder.Header>
                                        <Placeholder.Line/>
                                        <Placeholder.Line/>
                                    </Placeholder.Header>
                                </Placeholder>
                            ) : (
                                <Label.Group size='large'>
                                    {choice['voice_type'].map(voiceType => (
                                        <Label key={voiceType.name} data-label-id={voiceType.name} as='a'
                                               color={choice['voice_type'].find(i => i.name === voiceType.name).selected ? ColumnColor['voice_type'] : null}
                                               onClick={(e, data) => {
                                                   handleLabelClick(e, data, 'voice_type', true)
                                               }}>{voiceType.name}</Label>
                                    ))}
                                </Label.Group>
                            )
                            }
                        </Segment>
                    </Grid.Column>
                    <Grid.Column>
                        <Header sub attached='top'>
                            Voice Gender
                        </Header>
                        <Segment attached>
                            {categoryLoading ? (
                                <Placeholder>
                                    <Placeholder.Header>
                                        <Placeholder.Line/>
                                        <Placeholder.Line/>
                                    </Placeholder.Header>
                                </Placeholder>
                            ) : (
                                <Label.Group size='large'>
                                    {choice['gender'].map(gender => (
                                        <Label key={gender.name} data-label-id={gender.name} as='a'
                                               data-label-enum
                                               color={choice['gender'].find(i => i.name === gender.name).selected ? ColumnColor['gender'] : null}
                                               onClick={(e, data) => {
                                                   handleLabelClick(e, data, 'gender', true)
                                               }}>{gender.name}</Label>
                                    ))}
                                </Label.Group>
                            )}
                        </Segment>
                    </Grid.Column>
                    <Grid.Column>
                        <Header sub attached='top'>
                            Era
                        </Header>
                        <Segment attached>
                            {categoryLoading ? (
                                <Placeholder>
                                    <Placeholder.Header>
                                        <Placeholder.Line/>
                                        <Placeholder.Line/>
                                    </Placeholder.Header>
                                </Placeholder>
                            ) : (
                                <Label.Group size='large'>
                                    {choice['era'].map(era => (
                                        <Label key={era.name} data-label-id={era.name} as='a'
                                               color={choice['era'].find(i => i.name === era.name).selected ? ColumnColor['era'] : null}
                                               onClick={(e, data) => {
                                                   handleLabelClick(e, data, 'era', true)
                                               }}>{era.name}</Label>
                                    ))}
                                </Label.Group>
                            )}
                        </Segment>
                    </Grid.Column>
                    <Grid.Column>
                        <Header sub attached='top'>
                            Tessitura
                        </Header>
                        <Segment attached>
                            {categoryLoading ? (
                                <Placeholder>
                                    <Placeholder.Header>
                                        <Placeholder.Line/>
                                        <Placeholder.Line/>
                                    </Placeholder.Header>
                                </Placeholder>
                            ) : (
                                <Label.Group size='large'>
                                    {choice['tessitura'].map(tessitura => (
                                        <Label key={tessitura.name} data-label-id={tessitura.name} as='a'
                                               data-label-enum
                                               color={choice['tessitura'].find(i => i.name === tessitura.name).selected ? ColumnColor['tessitura'] : null}
                                               onClick={(e, data) => {
                                                   handleLabelClick(e, data, 'tessitura', true)
                                               }}>{tessitura.name}</Label>
                                    ))}
                                </Label.Group>
                            )}
                        </Segment>
                    </Grid.Column>
                </Grid.Row>
                {/* search category row 2 with go button */}
                <Grid.Row verticalAlign='middle'>
                    <Grid.Column width={8}>
                        <Header sub attached='top'>
                            Character Type
                        </Header>
                        <Segment attached>
                            {categoryLoading ? (
                                <Placeholder>
                                    <Placeholder.Header>
                                        <Placeholder.Line/>
                                        <Placeholder.Line/>
                                    </Placeholder.Header>
                                </Placeholder>
                            ) : (
                                <Label.Group size='large'>
                                    {choice['character_type'].map(characterType => (
                                        <Label key={characterType.name} data-label-id={characterType.name} as='a'
                                               color={choice['character_type'].find(i => i.name === characterType.name).selected ? ColumnColor['character_type'] : null}
                                               onClick={(e, data) => {
                                                   handleLabelClick(e, data, 'character_type')
                                               }}>{characterType.name}</Label>
                                    ))}
                                </Label.Group>
                            )}
                        </Segment>
                    </Grid.Column>
                    <Grid.Column width={6}>
                        <Header sub attached='top'>
                            Song Type
                        </Header>
                        <Segment attached>
                            {categoryLoading ? (
                                <Placeholder>
                                    <Placeholder.Header>
                                        <Placeholder.Line/>
                                        <Placeholder.Line/>
                                    </Placeholder.Header>
                                </Placeholder>
                            ) : (
                                <Label.Group size='large'>
                                    {choice['song_type'].map(tempo => (
                                        <Label key={tempo.name} data-label-id={tempo.name} as='a'
                                               color={choice['song_type'].find(i => i.name === tempo.name).selected ? ColumnColor['song_type'] : null}
                                               onClick={(e, data) => {
                                                   handleLabelClick(e, data, 'song_type', true)
                                               }}>{tempo.name}</Label>
                                    ))}
                                </Label.Group>
                            )}
                        </Segment>
                    </Grid.Column>
                    <Grid.Column width={2} textAlign='center'>
                        <Button circular size='massive' icon='arrow right' onClick={handleSearch}/>
                    </Grid.Column>
                </Grid.Row>
                {'results' in data ? <Grid.Row columns='equal'>
                    <Grid.Column>
                        <Table basic='very'>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>
                                        <Header as='h1'>{data.count}
                                            <Header.Subheader>song{data.count !== 1 ? 's' : null} matching your
                                                query {keyword && <strong>{keyword}</strong>}</Header.Subheader>
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
                        <SongList songs={data.results} newTabs={true}
                                  action={username ? [Actions.addToBook, Actions.share] : [Actions.share]}
                                  skip={['original_artist', 'character_name', 'gender',]}/>
                        {totalPages > 1 ? <Table basic='very'>
                            <Table.Footer>
                                <Table.Row>
                                    <Table.HeaderCell colSpan='3'>
                                        <Pagination floated='right'
                                                    firstItem={null}
                                                    lastItem={null}
                                                    totalPages={totalPages}
                                                    activePage={activePage}
                                                    onPageChange={onPageChange}/>
                                    </Table.HeaderCell>
                                </Table.Row>
                            </Table.Footer>
                        </Table> : null}
                    </Grid.Column>
                </Grid.Row> : null}
            </Grid>
        </Container>
    );
}