import React from 'react';
import {Button, Container, Grid, Header, Segment} from "semantic-ui-react";

export const Footer = (props) => {
    return (
        <Segment vertical>
            <Container>
                <Grid stackable>
                    <Grid.Row>
                        <Grid.Column width={2}>
                            <Header as='h1' content='BeltBook'/>
                        </Grid.Column>
                        <Grid.Column width={3}>
                            <Button circular color='facebook' icon='facebook'/>
                            <Button circular color='twitter' icon='twitter'/>
                            <Button circular color='linkedin' icon='linkedin'/>
                            <Button circular color='google plus' icon='google plus'/>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Container>
        </Segment>
    )
}