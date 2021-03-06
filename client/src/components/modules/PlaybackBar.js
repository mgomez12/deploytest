import React, { Component } from 'react';
import "../../public/css/styles.css"
import {Menu } from 'semantic-ui-react';

class PlaybackBar extends Component {
    constructor(props) {
        super(props);
        // will have to change server directory at some time

        this.state = {
            audio: '',
            playing: false,
            maxTime: 1,
            time: 0,
            seekValue: null,
            update: true
        };
        this.player = null;
        this.gotSongInfo = false;
        this.device_id = '';
        this.loaded = false;
        this.prevSong = this.props.track;
        this.audio = null;
        this.pause = this.pause.bind(this);
        this.play = this.play.bind(this);
        this.onSeekChange = this.onSeekChange.bind(this);
        this.onSeekMouseDown = this.onSeekMouseDown.bind(this);
        this.onSeekMouseUp = this.onSeekMouseUp.bind(this);
        this.handleScriptLoad = this.handleScriptLoad.bind(this);

        if (this.props.premium) {
          
                


    }
}

      componentWillUnmount() {
        clearInterval(this.interval);
        this.pause();
      }

      componentDidMount() {
      }

    componentDidUpdate() {
        if (this.prevSong !== this.props.track) {
            this.setState({update: true})
            this.prevSong = this.props.track
            clearInterval(this.interval)
        }
        if (!this.updated && this.props.premium) {
            this.updated = true;
            const script = document.createElement("script");
  
          script.src = "https://sdk.scdn.co/spotify-player.js";
          document.body.appendChild(script);
              window.onSpotifyWebPlaybackSDKReady = () => {
                  const player = new Spotify.Player({      // Spotify is not defined until 
                  name: 'Web SDK player',            // the script is loaded in 
                  getOAuthToken: cb => { cb(this.props.token) }
                });
                player.connect();
                player.addListener('ready', ({ device_id }) => {
                    this.device_id = device_id;
                    this.player = player;
                    this.setState({update: true})})
                player.on('initialization_error', ({ message }) => {
                    console.error('Failed to initialize', message);
                    });
                player.on('authentication_error', ({ message }) => {
                console.error('Failed to authenticate', message);
                });
                player.on('account_error', ({ message }) => {
                    console.error('Failed to validate Spotify account', message);
                  });
                player.on('playback_error', ({ message }) => {
                console.error('Failed to perform playback', message);
                });
                }
        }
        if (this.state.update && this.props.track !== '' && !this.props.premium) {
            this.setState({
                playing: true,
                maxTime: 30,
                time:0,
                update: false,
                audio: <audio autoPlay src={this.props.track} ref={(audioTag) => {this.audio = audioTag}}/>
            }) 
            this.interval = setInterval(() => this.setState({ time: this.audio.currentTime}), 250);
        }
        
        else if (this.state.update && this.props.premium && this.player !== null) {
            let obj = this;
            fetch('https://api.spotify.com/v1/me/player/play?device_id=' + this.device_id, {
              method: 'PUT',
              headers: {
                  'Authorization': 'Bearer ' + this.props.token,
              },
              body: JSON.stringify({
                  'uris': [this.props.track]
              })}).then(() => {
            this.player.getCurrentState().then(info => {
            obj.setState({
                playing: true,
                maxTime: this.props.maxTime,
                time: info.position,
                update: false
            })
        })})
            this.interval = setInterval(() => 
            this.player.getCurrentState().then(info => {this.setState({ time: info.position})}), 250);
        }
    }

    pause(){
        if (this.state.audio == '') {
            if (this.props.premium) {
                this.player.pause();
                this.setState({playing: false})
                return;
            }
            return
        }
        this.audio.pause()
        this.setState({playing: false})
    }
    play(){
        if (this.state.audio == '') {
            if (this.props.premium) {
                this.player.resume();
                this.setState({playing: true})
            }
            return
        }
        this.audio.play()
        this.setState({playing: true})
    }

    onSeekMouseDown() {
        clearInterval(this.interval);
    }
    onSeekMouseUp() {
        if (this.props.premium) {
            this.player.seek(this.state.seekValue);
            this.interval = setInterval(() => 
            this.player.getCurrentState().then(info => {this.setState({ time: info.position})}), 250);this.setState({
                time: this.state.seekValue,
                seekValue: null
            })
        }
        else if (this.state.audio !== '') {
        this.audio.currentTime = this.state.seekValue
        this.setState({
            time: this.state.seekValue,
            seekValue: null
        }) 
        this.interval = setInterval(() => this.setState({ time: this.audio.currentTime}), 250);}
    }
    onSeekChange(e) {
       
        this.setState({
            seekValue: e.target.value
        })
    }

    handleScriptLoad = () => {
        
        
    


    
}

    render() {
        
        
        let time=0;
        if (this.state.audio !== '' || this.props.premium) {
           time = this.state.time
        }
        let timeString='0:00'
        if (this.state.audio !== '') {
            const minutes = Math.floor(this.state.time / 60);
            let seconds = Math.floor(this.state.time % 60);
            if (seconds < 10) {seconds = '0' + seconds}
            timeString = minutes + ':' + seconds;
        }
        else if (this.props.premium) {
            const minutes = Math.floor(this.state.time / 1000 / 60);
            let seconds = Math.floor(this.state.time / 1000 % 60);
            if (seconds < 10) {seconds = '0' + seconds}
            timeString = minutes + ':' + seconds;
        }
        return(
            <div>
        <React.Fragment>
            {this.props.premium ? '' : 
            this.state.audio}
        <Menu inverted fixed='bottom'>
            {this.state.playing ? 
            <Menu.Item style={{width:'5%'}} icon='pause' onClick={this.pause} ></Menu.Item> :
            <Menu.Item style={{width:'5%'}} icon='play' onClick={this.play}></Menu.Item>}
            
            <Menu.Item style={{width:'90%'}}>
            <input className="slider"
                  type='range' min={0} max={this.state.maxTime} step='any'
                  value={this.state.seekValue == null ? time : this.state.seekValue}
                  onMouseDown={this.onSeekMouseDown}
                  onChange={this.onSeekChange}
                  onMouseUp={this.onSeekMouseUp}
                />
            </Menu.Item>
            <Menu.Item>
                {timeString}
            </Menu.Item>
        </Menu>
        </React.Fragment>
        </div>)
    }
}

export default PlaybackBar;