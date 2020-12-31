import React, {useState} from 'react';
import {Button, Container, Dimmer, Form, Grid, Header, Icon, List, Loader, Message} from "semantic-ui-react";
import {Helmet} from "react-helmet";
import {SiteName} from "./Utils";
import {auth} from "./Auth";
import {Link} from "react-router-dom";

const AdminEmail = 'noreply@thebeltbook.com';

export function Signup(props) {
    const [username, setUsername] = useState('');
    const [password1, setPassword1] = useState('');
    const [password2, setPassword2] = useState('');
    const [email, setEmail] = useState('');
    const [prompt, setPrompt] = useState({});
    const [loading, setLoading] = useState(false);

    const handleSignup = () => {
        setLoading(true);
        auth.register(username, password1, password2, email)
            .then(response => {
                const {status, data} = response;
                if (status.toString().startsWith('2')) {
                    setPrompt({success: 'success'});
                }
            }).catch(error => {
            setPrompt(error.response.data);
        }).finally(() => {
            setLoading(false);
        })
    }

    return (
        <Container>
            <Helmet>
                <title>{`Signup - ${SiteName}`}</title>
            </Helmet>

            <Grid stackable relaxed='very'>
                <Grid.Row columns={3} centered>
                    <Grid.Column>
                        <Header as='h1'>Sign Up</Header>
                        <Dimmer.Dimmable>
                            <Form className='attached fluid segment'>
                                <Form.Input
                                    icon='user'
                                    iconPosition='left'
                                    label='Username'
                                    placeholder='Username'
                                    error={prompt.username && {
                                        content: prompt.username,
                                        pointing: 'above'
                                    }}
                                    onChange={(event, data) => setUsername(data.value)}/>
                                <Form.Input
                                    icon='lock'
                                    iconPosition='left'
                                    label='Password'
                                    type='password'
                                    placeholder='Password'
                                    error={prompt.password1 && {
                                        content: prompt.password1,
                                        pointing: 'above'
                                    }}
                                    onChange={(event, data) => setPassword1(data.value)}/>
                                <Form.Input
                                    icon='lock'
                                    iconPosition='left'
                                    label='Confirm Password'
                                    type='password'
                                    placeholder='Confirm Password'
                                    error={prompt.password2 && {
                                        content: prompt.password2,
                                        pointing: 'above'
                                    }}
                                    onChange={(event, data) => setPassword2(data.value)}/>
                                <Form.Input
                                    icon='mail'
                                    iconPosition='left'
                                    label='Email'
                                    placeholder='Email'
                                    error={prompt.email && {
                                        content: prompt.email,
                                        pointing: 'above'
                                    }}
                                    onChange={(event, data) => setEmail(data.value)}/>
                                <Button content='Sign Up' primary
                                        onClick={handleSignup}/> or <Link to='/login'>log in</Link>
                            </Form>
                            <Dimmer active={!!prompt['success']} inverted>
                                <Header as='h2' icon style={{color: "#666666"}}>
                                    <Icon name='heart' style={{color: "#d24646"}}/>
                                    You're in!
                                </Header>
                            </Dimmer>
                            <Dimmer active={loading} inverted>
                                <Loader inverted/>
                            </Dimmer>
                        </Dimmer.Dimmable>
                        {prompt['non_field_errors'] && <Message attached='bottom' error>
                            <List bulleted>{
                                prompt['non_field_errors'].map((msg, index) => (
                                    <List.Item key={index}>{msg}</List.Item>
                                ))
                            }</List>
                        </Message>}
                        {prompt['success'] &&
                        <Message attached='bottom' success
                                 header='Your registration is almost complete!'
                                 content={`Please check your mailbox and click the link in the verification email from ${AdminEmail}`}/>}
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </Container>
    )
}