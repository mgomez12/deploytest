import React, { Component } from 'react';
import "../../public/css/styles.css"
import io from 'socket.io-client';
import { Message, Input, Loader, Checkbox } from 'semantic-ui-react';
import { post } from "./api"

class SuggestionForm extends Component {
    constructor(props) {
        super(props);

        this.socket = io('http://localhost:3000');

        this.state = {
            input: '',
            submitted: false,
            response: null,
            anonymous: false
        };
        this.handleChange = this.handleChange.bind(this)
        this.submitSuggestion = this.submitSuggestion.bind(this)
        this.checkboxChange = this.checkboxChange.bind(this)

    }

    handleChange(event){
        if (this.state.input == '') {
            this.setState({
                input: event.target.value,
            })
            return
        }
        this.setState({
            input: event.target.value,
        })
    }

    checkboxChange(event, data) {
        console.log(data)
        if (data.checked == null) {
            return
        }
        this.setState({
            anonymous: data.checked
        })
       
    }

    submitSuggestion() {
        this.setState({
            input: '',
            submitted: true,
            response: null
        })
        const date = new Date()
        if (!this.props.isTrack) {
            console.log('submitted' + this.props.userId + this.state.input)
            post('/api/suggestion', {receiver: this.state.input, sender: (this.state.anonymous? 'anonymous' : this.props.userId), track: this.props.track, time:date},
            (response) => {
                console.log(response);
                if (response.status =='success') {
                    this.setState({
                        response: true
                    })
                    return
                }
                this.setState({
                    response: false
                })
            })
        }
        else {
        console.log('submitted' + this.props.userId + this.props.receiverId)
        post('/api/suggestion', {receiver: this.props.receiverId, sender: (this.state.anonymous? 'anonymous' : this.props.userId), track: this.state.input, time:date})
        }
    }
    render() {
        let banner;
        if (this.state.submitted) {
            console.log(this.state.response)
            if (this.state.response == null) {
                banner=<Message compact ><Loader active size='medium'/></Message>
            }
            else if (this.state.response) {
                banner=<Message compact positive><Message.Header>Submitted!</Message.Header></Message>
            }
            else {
                banner=<Message compact negative><Message.Header>Failed!</Message.Header></Message>
            }
        }
        else {
            banner=''
        }
        return(
            <React.Fragment>
            <div style={{display:'inline-block'}}>
            <Input
                action={{ color: 'teal', content: 'submit', onClick: this.submitSuggestion}}
                placeholder={this.props.isTrack? "Type in track id..." : "Type in user id..."}
                value={this.state.input}
                onChange={this.handleChange}
            />
            {banner}
            </div>
            <Checkbox toggle label='Submit anonymously' onClick={this.checkboxChange}/>
            </React.Fragment>
        )
    }
}
export default SuggestionForm;