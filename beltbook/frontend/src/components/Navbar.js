import {Dropdown, Grid, Icon, Menu, Responsive, Sidebar} from "semantic-ui-react";
import {SiteName} from "./Utils";
import {NavLink} from "react-router-dom";
import {auth, usernameSubject} from "./Auth";
import React, {useLayoutEffect, useState} from "react";

export const NavBar = (props) => {
    const [username, setUsername] = useState(auth.username);
    const [sidebarVisible, setSidebarVisible] = useState(false);

    const openSidebar = () => setSidebarVisible(true);
    const closeSidebar = () => setSidebarVisible(false);

    useLayoutEffect(() => {
        const sub = usernameSubject.subscribe(setUsername);
        return () => {
            sub.unsubscribe();
        }
    }, []);

    return (
        <>
            <Responsive minWidth={Responsive.onlyTablet.minWidth} as={Menu} size='massive' borderless fluid
                        style={{
                            borderRadius: 0,
                            borderLeft: 'none',
                            borderRight: 'none',
                            boxShadow: 'none',
                        }}>
                <Menu.Item header>{`${SiteName}`}</Menu.Item>
                {/*<Menu.Item name='All Songs' as={NavLink} to={'/all-songs'}/>*/}
                <Menu.Item name='Search' as={NavLink} to={'/search'}/>
                <Menu.Menu position='right'>
                    {username ?
                        <>
                            <Menu.Item as={NavLink} to={`/u/${username}/book`}>My Books</Menu.Item>
                            <Dropdown item text={username}>
                                <Dropdown.Menu>
                                    <Dropdown.Item as={NavLink} to={`/u/${username}`}>Profile</Dropdown.Item>
                                    <Dropdown.Item onClick={auth.logout}>Log Out</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </>
                        : <Menu.Item name='Login' as={NavLink} to={'/login'}/>}
                </Menu.Menu>
            </Responsive>
            <Responsive {...Responsive.onlyMobile} as={Menu} size='massive' borderless fluid
                        style={{
                            borderRadius: 0,
                            boxShadow: 'none',
                            borderLeft: 'none',
                            borderRight: 'none',
                        }}>
                <Menu.Item onClick={openSidebar}><Icon name='bars'/></Menu.Item>
                <Grid container>
                    <Grid.Column textAlign='center'>
                        <Menu.Item header style={{display: 'block'}}>{`${SiteName}`}</Menu.Item>
                    </Grid.Column>
                </Grid>
                <Menu.Item position='right' as={NavLink} to={'/search'}><Icon name='search'/></Menu.Item>

                <Sidebar as={Menu} vertical width='thin' visible={sidebarVisible} size='massive'
                         style={{
                             borderTop: 'none'
                         }}>
                    <Menu.Item style={{display: 'inherit'}} onClick={closeSidebar}>
                        <Icon name='close' style={{marginLeft: 0}}/>
                    </Menu.Item>
                    {username ?
                        <>
                            <Menu.Item>{username}</Menu.Item>
                            <Menu.Item as={NavLink} to={`/u/${username}/book`}>My Books</Menu.Item>
                            <Menu.Item onClick={auth.logout}>Log Out</Menu.Item>
                        </>
                        : <Menu.Item as={NavLink} to={'/login'} name='Log In' onClick={closeSidebar}/>}
                </Sidebar>
            </Responsive>
        </>)
}