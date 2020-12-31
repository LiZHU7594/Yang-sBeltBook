import React from "react";
import {Route, Switch, useLocation} from "react-router-dom";
import {Song} from "./Song";
import {Show} from "./Show";
import {Artist} from "./Artist";
import {SearchCategory} from "./SearchCategory";
import {Login} from "./Login";
import {NavBar} from "./Navbar";
import {Signup} from "./Signup";
import {MyBooks} from "./MyBooks";
import {Book} from "./Book";

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export function App() {
    let query = useQuery();
    return (
        <>
            <NavBar/>
            <div className='content-wrapper'>
                <Switch>
                    <Route path='/login' render={routeProps => <Login {...routeProps}/>}/>
                    <Route path='/signup' render={routeProps => <Signup {...routeProps}/>}/>
                    {/*<Route path='/all-songs'*/}
                    {/*       component={routeProps => <SongTable page={query.get('page')} {...routeProps}/>}/>*/}
                    <Route path='/song/:slug' render={routeProps => <Song/>}/>
                    <Route path='/show/:slug' render={routeProps => <Show/>}/>
                    <Route path='/artist/:slug' render={routeProps => <Artist/>}/>
                    <Route path='/u/:user/book/:slug' render={routeProps => <Book {...routeProps}/>}/>
                    <Route path='/u/:user/book/' render={routerProps => <MyBooks {...routerProps}/>}/>
                    <Route path='/search/:keyword?'
                           render={routeProps =>
                               <SearchCategory queryParams={{
                                   title: query.get('title'),
                                   voice_type: query.get('voice-type'),
                                   gender: query.get('voice-gender'),
                                   era: query.get('era'),
                                   tessitura: query.get('tessitura'),
                                   character_type: query.get('character-type'),
                                   song_type: query.get('song-type')
                               }} {...routeProps}/>}/>
                </Switch>
            </div>
            <div className="footer-wrapper">
                {/*<Footer/>*/}
            </div>
        </>
    );
}