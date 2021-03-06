import React, { Component } from 'react';
import "../../public/css/styles.css"
import { Loader, Header, Grid, Segment, Image, Container, Card, Form, TextArea } from 'semantic-ui-react';
import default_profile from "../../public/assets/default_profile.png";
import circle_llama from "../../public/assets/circle_llama.png";
import confused_llama from "../../public/assets/confused_llama.png";
import SuggestionForm from '../modules/SuggestionForm';
import FriendForm from '../modules/FriendForm';
import Coverflow from 'react-coverflow';
import DescriptionInputForm from '../modules/DescriptionInputBox';

class Profile extends Component {
    constructor(props) {
        super(props);


        this.state = {
            userInfo: null,
            isRedirecting: false
        };
        this.gotProfileInfo = false;

    }

    componentDidMount() {
        if (this.props.match.params.user !== "me") {
            this.getProfile(this.props.match.params.user); 
        }
    }

    componentDidUpdate() {
        if (!this.gotProfileInfo) {
            if (this.props.match.params.user !== "me") {
                this.getProfile(this.props.match.params.user); }

            else if (!this.state.isRedirecting && this.props.viewerInfo.access_token !== null) {
            this.props.history.push('/u/profile/' + this.props.viewerInfo._id)
            this.state.isRedirecting = true;
        }
    }
    }

    getProfile = (id) => {
        fetch('/api/user?_id=' + id).then(res => res.json())
        .then((profile) => {
            this.setState({
                userInfo: profile,
                isRedirecting: false
            })
            this.gotProfileInfo = true;
        })
    }

    loadSuggestionBox() {
        if(this.gotProfileInfo) {
            if(this.props.match.params.user==this.props.viewerInfo._id) {
                return <div></div>
            }
            else {
                return (<div>
                        <Header as='h4'>Suggest a song!</Header>
                        <SuggestionForm userInfo={this.props.viewerInfo} receiverId={this.state.userInfo._id} isTrack={true}/>
                    </div>);
            }
        }
        else {
            <Loader active inline size='tiny'>Loading<Image size='tiny' centered src={confused_llama}/></Loader>

        }
    }

    loadDescriptionBox() {
        if(this.gotProfileInfo) {
            return (
            <DescriptionInputForm userId={this.props.viewerInfo._id} personId={this.state.userInfo._id} userProfile={this.props.viewerInfo} personProfile={this.state.userInfo}/>);
        }
        else {
            <Loader active inline size='tiny'>Loading<Image size='tiny' centered src={confused_llama}/></Loader>

        }
    }
    

    loadFriendBox() {
        if(this.gotProfileInfo) {
            return (<FriendForm userId={this.props.viewerInfo._id} receiverId={this.state.userInfo._id} />);
        }
        else {
            <Loader active inline size='tiny'>Loading<Image size='tiny' centered src={confused_llama}/></Loader>
        }
    }

    loadFavArtistsImagesList() {
        if(this.state.userInfo!=null) {
            return(
                
                this.state.userInfo.top_artists.map( artist => {
                return(
                    <a href={"/artist/" + artist.id}><img src={artist.images[0].url} alt={artist.name} style={{ display: 'block', width: '100%' }}/></a>
                );
                })
            );
        }
        else {
            <Segment>
                <Loader active size='tiny'>Loading<Image size='tiny' centered src={confused_llama}/></Loader>
            </Segment>
        }
    }

    loadFavSongs() {
        if(this.gotProfileInfo) {
            return(
                this.state.userInfo.top_songs.map( song => {
                return(
                <Segment className='center-parent' key={song.id}>
                    <a href={"/song/" + song.id}>{song.name}</a>
                </Segment>);
            })
            );
        }
        else {
            <Segment>
                <Loader active size='tiny'>Loading<Image size='tiny' centered src={confused_llama}/></Loader>
            </Segment>
        }
    }

    loadFavSongsCards() {
        if(this.gotProfileInfo) {
            return(
                this.state.userInfo.top_songs.map( song => {
                return(
                    <Card> <a href={"/song/" + song.id}><Image src={String(song.album.images[0].url)}/></a><Card.Content>
                <Card.Header>{song.name}</Card.Header></Card.Content></Card>);
            })
            );
        }
        else {
            <Segment>
                <Loader active size='tiny'>Loading<Image size='tiny' centered src={confused_llama}/></Loader>
            </Segment>
        }
    }

    render() {
        let image, description, name= '';
        let artistimage_list=[]
        let songimage_list=[]
        let spotify_follower = 0;

        if (this.gotProfileInfo) {
            name = (this.state.userInfo.name)
            image = (this.state.userInfo.image !== '' ? this.state.userInfo.image : circle_llama)
            description = this.state.userInfo.descrip;

            spotify_follower = this.state.userInfo.spotify_followers;

            artistimage_list=this.loadFavArtistsImagesList()
            songimage_list=this.loadFavSongsCards()
            
            return (
                <div className='page'>
                    <Grid style={{padding:"10px"}}>
                        <Grid.Row columns={2} verticalAlign='middle'>  
                            <Grid.Column width='5' className='center-parent'>
                                <Image circular className= 'center-parent' size='small' src={image}/>
                                <Header as='h2'>{name}</Header>
                                <Header as="h5">Spotify Followers: {spotify_follower}</Header>
                            </Grid.Column >
                            <Grid.Column width='10'>
                                <div className='center-parent'>
                                {this.loadSuggestionBox()}
                                </div>
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row columns={3}>
                            <Grid.Column>
                                <div className='center-parent'>
                                    {this.loadFriendBox()}
                                </div>
                            </Grid.Column>
                            <Grid.Column width='10'>
                                <div className='center-parent'>
                                <Header as='h4'>About:</Header>
                                {this.loadDescriptionBox()}
                                </div>
                            </Grid.Column> 
                        </Grid.Row>
                    </Grid>
                    <Container>
                    <Header as="h2">
                            Top Songs: 
                    </Header>
                    <Card.Group itemsPerRow={5}>
                        {songimage_list}
                    </Card.Group>    
                    <Header as="h2">
                                    Top Artists: 
                    </Header>
                    <Coverflow
                        width={960}
                        height={480}
                        displayQuantityOfSide={2}
                        navigation={false}
                        enableHeading={false}
                    >
                    <div
                     onClick={() => fn()}
                     onKeyDown={() => fn()}
                     role="menuitem"
                     tabIndex="0"
                    >
                    </div>
                    {artistimage_list}
                    </Coverflow>
                    </Container> 
                </div>
            ) 
        }
        else {
            return (
                <Loader active size='massive'>Loading<Image size='tiny' centered src={confused_llama}/></Loader>
            )
        }
        

    }
    
}
export default Profile;
