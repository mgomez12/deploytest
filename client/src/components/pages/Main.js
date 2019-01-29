import React, { Component } from 'react';
import "../../public/css/styles.css";
import {withRouter} from "react-router-dom";
import NavBar from "../modules/NavBar"
import SuggestionBox from "../modules/SuggestionBox"
import Dash from "../modules/Dash"
import { Sticky, Visibility, Loader, Container, Grid} from "semantic-ui-react";
import SearchBarUser from '../modules/SearchBarUser';
import WeeklyPlaylist from '../modules/WeeklyPlaylist';

class Main extends Component {
	constructor(props) {
        super(props);
        this.state = {}
    }

    componentDidUpdate() {
        if (this.props.userInfo !== null && !this.props.userInfo.name) {
            this.props.history.push("/login");
        }
    }

    handleContextRef = contextRef => this.setState({ contextRef })

    render() {
        const { contextRef } = this.state
        if (this.props.userInfo.access_token == null) {
            return <Loader active size='massive'/>
        }
        return(<div className='page' >
            <Container>
                <NavBar history={this.props.history} userInfo={this.props.userInfo}/>
            </Container>
                <Container style={{paddingTop: '2em', paddingBottom:'2em'}}>
                    <Grid columns='2' stackable style={{margin: '0px', height:'80vh', width:'100%'}}>
                        <Grid.Column width='6'>
                                <WeeklyPlaylist userInfo={this.props.userInfo} history={this.props.history}/>
                                <SearchBarUser history={this.props.history}/>
                                <SuggestionBox userInfo={this.props.userInfo}/>
                        </Grid.Column>
                        <Grid.Column width='10'>
                                {console.log(contextRef)}
                                <Dash userInfo={this.props.userInfo} friendCount ={this.props.userInfo.friends}/>
                        </Grid.Column>
                    </Grid>
                </Container>            
        </div>)

    }
}

export default withRouter(Main);
