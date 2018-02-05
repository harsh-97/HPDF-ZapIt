import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';

import Mui from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme'; 
import {blue500} from 'material-ui/styles/colors';

import IconButton from 'material-ui/IconButton';

import AtomIcon from 'material-ui/svg-icons/hardware/toys';

import './App.css';

const muiTheme = getMuiTheme({
		palette: {
			primary1Color: blue500,
		},
	    fontFamily: 'Arial, sans-serif',
});



class Login extends Component {
	constructor(props)
	{
		super(props);
		this.state = {
			username: '',
			password: '',
			message: 'Not logged in yet',
		};

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);

	}

	doLogin() {
	  	fetch(
	  		'https://app.cramping38.hasura-app.io/login', 
	  		{
	  			method: "POST",
	  			body: {
	  				'username': this.state.username,
	  				'password': this.state.password,
	  			},
	  		}
	  	).then(response => {
	  		if(response.ok)
	  		{
	  			this.setState({status: 0});
		  		return response.json();
	  		}
		  	else
		  	{
		  		this.setState({status: 1});
		  		return {message: "There is a network connectivity problem! Request Error code: " + response.status}
		  	}
	  	}).then(result => {
	  		if(this.state.status)
	  			this.setState({message: result['message']});
	  		else
	  			this.setState({message: "Username: " + result['username'] + "\nPassword: " + result['password']});
	  	})
	}

	handleChange(event) {
		var target = event.target;
		var value = target.value;
		var name = target.name;

		this.setState({
			[name]: value,
		});
	}

	handleSubmit(event) {
		alert("Attempted to submit!" + "Username: " + this.state.username + "And password was: " + this.state.password);
		this.doLogin();
		event.preventDefault();
	}

	render() {
		return(
			<Mui muiTheme={muiTheme}>
				<h4>Login</h4>
				<form onSubmit={this.handleSubmit}>
					<input 
						name="username" 
						type="text" 
						value={this.state.username} 
						onChange={this.handleChange}
					/>			
					<input 
						name="password" 
						type="password" 
						value={this.state.password} 
						onChange={this.handleChange}
					/>
					<input 
						name="submit" 
						type="submit" 
						value="Login"
					/>
				</form>
				<br/>
				{this.state.message}
			</Mui>
		);
	}
}


class APITest extends Component {
  constructor(props)
  {
  	super(props);
  	this.state = {
  		message: 'awaiting response from server...',
  	};
  }

  fetchMessage() {
  	fetch(
  		'https://app.cramping38.hasura-app.io/json', 
  		{
  			method: "GET",
  		}
  	).then(response => {
  		if(response.ok)
	  		return response.json();
	  	else
	  		return {message: "There is a network connectivity problem! Request Error code: " + response.status}
  	}).then(result => {
  		this.setState({message: result['message']});
  	})
  }

  componentDidMount() {
  	this.fetchMessage();
  }

  render() {
    return (
      <Mui muiTheme={muiTheme}>
        <div>
        	{this.state.message}
        </div>
      </Mui>
    );
  }
}


function RouteTest(props){
  return(
  	<Mui muiTheme={muiTheme}>
	    <h4>
    	Test Route Successful!
    	</h4>
    	<IconButton tooltip="Go to Index" iconStyle={{width: 30, height: 30}} style={{width: 30, height: 30, padding: 0, marginLeft: '4%'}} href="/">
				<AtomIcon color={muiTheme.palette.primary1Color}/>
		</IconButton>
	</Mui>
    );
}


function Home(props){
	return(
		<h4>
			Work in progress... Try /testapi or /testroute
		</h4>);
}


const Redirect = () => (
  <Switch>
    <Route exact path="/testapi" component={APITest}/>
    <Route exact path="/testroute" component={RouteTest}/>
    <Route exact path="/login" component={Login}/>
    <Route path="/" component={Home}/>
  </Switch>
);


export default Redirect;
