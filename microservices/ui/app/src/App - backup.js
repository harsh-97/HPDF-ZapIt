import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';

import Mui from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme'; 
import {blue500} from 'material-ui/styles/colors';

import IconButton from 'material-ui/IconButton';

import AtomIcon from 'material-ui/svg-icons/hardware/toys';


import logo from './logo.svg';
import './App.css';

const muiTheme = getMuiTheme({
		palette: {
			primary1Color: blue500,
		},
	    fontFamily: 'Arial, sans-serif',
});


class App extends Component {
  render() {
    return (
      <Mui muiTheme={muiTheme}>
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h1 className="App-title">Welcome to React</h1>
          </header>
          <p className="App-intro">
            To get started, edit <code>src/App.js</code> and save to reload.<br/>
            <code>"This should reflect after the push"</code>
          </p>
      		<IconButton tooltip="Go to Test Route" iconStyle={{width: 30, height: 30}} style={{width: 30, height: 30, padding: 0}} href="/testroute">
				<AtomIcon color={muiTheme.palette.primary1Color}/>
			</IconButton>
        </div>
      </Mui>
    );
  }
}


function Test(props){
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


const Redirect = () => (
  <Switch>
    <Route exact path="/" component={App}/>
    <Route exact path="/testroute" component={Test}/>
  </Switch>
);


export default Redirect;

// export default App;