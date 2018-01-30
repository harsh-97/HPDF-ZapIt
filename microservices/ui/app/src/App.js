import React, { Component } from 'react';
// import { Switch, Route } from 'react-router-dom';

// import Mui from 'material-ui/styles/MuiThemeProvider';
// import getMuiTheme from 'material-ui/styles/getMuiTheme'; 

import logo from './logo.svg';
import './App.css';

// const muiTheme = getMuiTheme({
//     fontFamily: 'Arial, sans-serif',
// });


class App extends Component {
  render() {
    return (
      // <Mui muiTheme={muiTheme}>
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h1 className="App-title">Welcome to React</h1>
          </header>
          <p className="App-intro">
            To get started, edit <code>src/App.js</code> and save to reload.
          </p>
        </div>
      // </Mui>
    );
  }
}


function Test(props){
  return(
    <h4>
    Test Route Successful!
    </h4>
    );
}


// const Redirect = () => (
//   <Switch>
//     <Route exact path="/" component={App}/>
//     <Route path="/testRoute" component={Test}/>
//   </Switch>
// );


// export default Redirect;

export default App;