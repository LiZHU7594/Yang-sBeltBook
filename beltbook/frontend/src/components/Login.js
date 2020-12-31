import React, {useState} from "react";
import {Button, Container, Dimmer, Form, Grid, Header, Icon, Loader, Message} from "semantic-ui-react";
import {Helmet} from "react-helmet";
import {SiteName} from "./Utils";
import {auth} from "./Auth"
import {Link} from "react-router-dom";

export function Login(props) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [prompt, setPrompt] = useState({type: {}, message: null});
    const [loading, setLoading] = useState(false);

    const handleLogin = () => {
        setLoading(true);
        auth.login(username, password)
            .then(response => {
                const {status} = response;
                if (status.toString().startsWith('2')) {
                    props.history.push('/search');
                }
            }).catch((thrown) => {
            setPrompt({
                type: {warning: true},
                message: (<>
                    <Icon name='help'/> Login failed. <Link to={'/'}>Forgot your password?</Link>
                </>)
            })
        }).finally(() => {
            setLoading(false);
        })
    }

    return (
        <Container>
            <Helmet>
                <title>{`Login - ${SiteName}`}</title>
            </Helmet>

            <Grid stackable relaxed='very'>
                <Grid.Row columns={3} centered>
                    <Grid.Column>
                        <Header as='h1'>Log In</Header>
                        <Form className='attached fluid segment'>
                            <Dimmer active={loading} inverted>
                                <Loader inverted/>
                            </Dimmer>
                            <Form.Input
                                icon='user'
                                iconPosition='left'
                                label='Username'
                                placeholder='Username'
                                onChange={(event, data) => setUsername(data.value)}/>
                            <Form.Input
                                icon='lock'
                                iconPosition='left'
                                label='Password'
                                type='password'
                                placeholder='Password'
                                onChange={(event, data) => setPassword(data.value)}/>
                            <Button content='Log In' primary
                                    onClick={handleLogin}/> or <Link to='/signup'>sign up</Link>
                        </Form>
                        {prompt.message && <Message attached='bottom' {...prompt.type}>
                            {prompt.message}
                        </Message>}
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </Container>
    )
}