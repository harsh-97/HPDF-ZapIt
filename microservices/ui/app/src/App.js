import React, { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import Mui from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme'; 
import {blue500} from 'material-ui/styles/colors';

import IconButton from 'material-ui/IconButton';

import PinWheelIcon from 'material-ui/svg-icons/hardware/toys';

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
			message: '',
			loggedIn: 0,
		};

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	doLogin() {
		var url = "https://auth.cramping38.hasura-app.io/v1/login";

		var requestOptions = {
		    "method": "POST",
		    "headers": {
		        "Content-Type": "application/json"
		    }
		};

		var body = {
		    "provider": "username",
		    "data": {
		        "username": this.state.username,
		        "password": this.state.password,
		    }
		};

		requestOptions.body = JSON.stringify(body);

	  	fetch(url, requestOptions
  		).then(response => {
	  		this.setState({username: '', password: ''});
	  		return response.json();
	  	}).then(result => {
	  		if(result.auth_token)
	  		{
	  			window.localStorage.setItem('HASURA_AUTH_TOKEN', result.auth_token);
	  			window.localStorage.setItem('HASURA_ID', result.hasura_id);
	  			window.localStorage.setItem('USERNAME', result.username);
	  			this.setState({'loggedIn': 1});
	  		}
	  		else
	  		{
	  			if(result['code']==='invalid-creds')
	  			{
	  				this.setState({message: "Invalid login credentials. Check your username and password"});
	  			}
	  			else if(result['code']==='invalid-username')
	  			{
	  				this.setState({message: "Invalid username. Check your username and try again"});
	  			}
	  			else
	  			{
	  				this.setState({message: "Whoops! Something went wrong."});
	  				alert("Error:\nMessage: " + result['message'] + "\nError Code: " + result['code']);
	  			}
	  			this.setState({'loggedIn': 0});
	  		}
	  	})
	  	.catch(error => {
	  		this.setState({username: '', password: '', message: "Whoops! Something went wrong. Check network connectivity"});
	  		alert("Error: " + error);
	  	});
	}

	handleChange(event) {
		var target = event.target;
		var value = target.value;
		var name = target.name;

		this.setState({[name]: value});
	}

	handleSubmit(event) {
		event.preventDefault();
		this.doLogin();
	}

	render() {
		return(
			<Mui muiTheme={muiTheme}>
				{
					this.state.loggedIn?
					<Redirect to="/"/>
					:
					<div>
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
					</div>
				}
			</Mui>
		);
	}
}


class Dashboard extends Component {
	constructor(props)
	{
		super(props);
		this.state = {
			auth_token: window.localStorage.getItem('HASURA_AUTH_TOKEN'),
			username: window.localStorage.getItem('USERNAME'),
			hasura_id: window.localStorage.getItem('HASURA_ID'),
		};
		this.handleClick = this.handleClick.bind(this);
	}

	doLogout() {
		var url = "https://auth.cramping38.hasura-app.io/v1/user/logout";

		var requestOptions = {
		    "method": "POST",
		    "headers": {
		        "Content-Type": "application/json",
		        "Authorization": "Bearer " + this.state.auth_token
		    }
		};

		fetch(url, requestOptions)
		.then(function(response) {
			return response.json();
		})
		.then(function(result) {
		})
		.catch(function(error) {
			console.log('Request Failed:' + error);
		});
		
		window.localStorage.removeItem('HASURA_AUTH_TOKEN');
		window.localStorage.removeItem('USERNAME');
		window.localStorage.removeItem('HASURA_ID');
		this.setState({auth_token: null, username: null, hasura_id: null});
	}

	handleClick(event) {
		event.preventDefault();
		this.doLogout();
	}

	render()
	{
		return(
			<Mui muiTheme={muiTheme}>
				{
					this.state.auth_token === null ?
					<Redirect to="/login"/>
					:
					<div>
						<h4>
							Work in progress... Try /login
						</h4>
						<h4>Dashboard will come here</h4>
						Username: {this.state.username} <br/>
						Hasura ID: {this.state.hasura_id} <br/>
						Auth Token: {this.state.auth_token} <br/>
						<br/>
				    	<IconButton tooltip="Logout" iconStyle={{width: 30, height: 30}} style={{width: 30, height: 30, padding: 10, marginLeft: '5%'}} onClick={this.handleClick}>
							<PinWheelIcon color={muiTheme.palette.primary1Color}/>
						</IconButton> <br/>		
					</div>
				}
			</Mui>
		);
	}
}


function Page404(props) {
	return(
		<Mui muiTheme={muiTheme}>
			<h4>Whoops! Looks like you ended up on a wrong page. Go to the Dashboard</h4>
	    	<IconButton tooltip="Go to Dashboard" iconStyle={{width: 30, height: 30}} style={{width: 30, height: 30, padding: 10, marginLeft: '5%'}} href="/">
				<PinWheelIcon color={muiTheme.palette.primary1Color}/>
			</IconButton> <br/>	
		</Mui>
	);
}


const Router = () => (
  <Switch>
    <Route exact path="/login" component={Login}/>
    <Route exact path="/" component={Dashboard}/>
    <Route path="*" component={Page404}/>
  </Switch>
);


export default Router;
