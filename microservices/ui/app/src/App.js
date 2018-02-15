import React, { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import Mui from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme'; 
import {orange200, white} from 'material-ui/styles/colors';
import FlatButton from 'material-ui/FlatButton';


import IconButton from 'material-ui/IconButton';

import PinWheelIcon from 'material-ui/svg-icons/hardware/toys';

import './App.css';


const muiTheme = getMuiTheme({
		palette: {
			primary1Color: orange200,
			alternate1Color: white,
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
	  				console.log("Error:\nMessage: " + result['message'] + "\nError Code: " + result['code']);
	  			}
	  			this.setState({'loggedIn': 0});
	  		}
	  	})
	  	.catch(error => {
	  		this.setState({username: '', password: '', message: "Whoops! Something went wrong. Check network connectivity"});
	  		console.log("Error: " + error);
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


function UnpackTableList(props){
	const data = props.data;
	const listTables = Object.entries(data).map(([key, table]) =>
			<div key={key} tableid={key} datecreated={table['date_created']} datemodified={table['date_last_modified']} onClick={props.handleClick}>
					{table['table_name']}<hr/>
			</div>
		);

	return (
		<div>{listTables}</div>
		);
}


class Sidebar extends Component {
	constructor(props)
	{
		super(props);
		this.state = {
			username: props.username,
			hasura_id: props.hasura_id,
			tableData: {},
			fetched: false,
			message: 'Fetching tables...',
		};
		this.handleTableClick = props.handleTableClick;
		this.doLogout = props.doLogout;
		this.openCreateTableDialog = props.openCreateTableDialog;
	}

	fetchTableList() {
		var url = "https://app.cramping38.hasura-app.io/user-tables";

		var requestOptions = {
		    "method": "POST",
		    "headers": {
		        "Content-Type": "application/json"
		    }
		};

		var body = {
			"user_id": this.state.hasura_id
		} 

		var that = this;

		requestOptions.body = JSON.stringify(body);

		fetch(url, requestOptions)
		.then(function(response) {
			return response.json();
		})
		.then(function(result) {
			that.setState({fetched: true, tableData: result});
		})
		.catch(function(error) {
			that.setState({message: 'Failed to fetch from servers. Please try again later'});
			console.log('Failed: ' + error);
		});
	}

	componentDidMount() {
		this.fetchTableList();
	}

	render()
	{
		return(
			<div className="sidebar" style={{background: muiTheme.palette.primary1Color}}>
				<div>
					ZapIt<br/>
					{this.state.username}<br/>
					<hr/>
					<hr/>
					{
						this.state.fetched ?
							Object.keys(this.state.tableData).length === 0 ?
							<div>
								<span>No tables found!</span><br/>
								<span>Create a new table</span>
							</div>
							:
							<UnpackTableList data={this.state.tableData} handleClick={this.handleTableClick}/>
						:
						<div>
							<span>{this.state.message}</span>
						</div>
					}
				</div>
				<div>
					<input type='button' value="New Table" onClick={this.openCreateTableDialog}/>
					<input type='button' value="Logout" onClick={this.doLogout}/>
				</div>
			</div>
		);
	}
}


function UnpackTableData(props){
	const data = props.data;

	const tableInner = data.map((row) =>
		<tr key={row['sno']}>
			{
				Object.entries(row).map(([key, value]) =>
				{
					if(key !== 'sno')
						if(key === props.editing.colname && row['sno'].toString() === props.editing.sno)
							{
								return(
								<td key={key} colname={key} sno={row['sno']}>
									<input autoFocus type="text" sno={row['sno']} colname={key} placeholder={value} onBlur={props.handleUpdateBlur}/>
								</td>
								);
							}
						else
						{
							return(
								<td key={key} colname={key} sno={row['sno']} onClick={props.handleUpdateClick}>
									{value}
								</td>
							);
						}
				})
			}
			<td key={row['sno']}>
				<input type="button" sno={row['sno']} value="Delete Row" onClick={props.handleDeleteClick}/>
			</td>
		</tr>
	);

	var firstRow = data[0];
	firstRow['button'] = undefined;

	const columns = Object.keys(firstRow).map((column) =>
	{	
		if(column === 'button')
			return(<th key='button'></th>);
		else if(column !== 'sno')
			return(
				<th key={column}>
					{column.split('_').join(' ')}
				</th>
			)
	});

	const newRow = Object.keys(firstRow).map((column) =>
	{
		if(column === 'button')
			return(
				<td key={firstRow['sno']}>
					<input type="button" value="Insert Row" onClick={props.handleInsertClick}/>
				</td>
			);
		else if(column !== 'sno')
			return(
				<td key={column}>
					<input type='text' name={column} onChange={props.handleNewRowDataChange} value={props.newRow[column]}/>
				</td>
			);
	});

	delete firstRow['button'];

	return (
		<table>
		<tbody>
			<tr>
				{columns}
			</tr>
			{tableInner}
			<tr>
				{newRow}
			</tr>
		</tbody>
		</table>
		);
}


class Tablespace extends Component {
	constructor(props)
	{
		super(props);
		this.state = {
			table_id: props.table_id,
			tabledata: {},
			fetched: false,
			message: 'Fetching data from server...',
			editing: {sno: undefined, colname: undefined},
			newRow: {},
		}

		this.handleInsertClick = this.handleInsertClick.bind(this);
		this.handleUpdateClick = this.handleUpdateClick.bind(this);
		this.handleUpdateBlur = this.handleUpdateBlur.bind(this);
		this.handleDeleteClick = this.handleDeleteClick.bind(this);
		this.handleNewRowDataChange = this.handleNewRowDataChange.bind(this);
	}

	fetchTableData(table_id) {
		var url = "https://app.cramping38.hasura-app.io/fetch-data";

		var requestOptions = {
		    "method": "POST",
		    "headers": {
		        "Content-Type": "application/json"
		    }
		};

		var body = {
			"table_id": table_id,
		} 

		var that = this;

		requestOptions.body = JSON.stringify(body);

		fetch(url, requestOptions)
		.then(function(response) {
			return response.json();
		})
		.then(function(result) {
			if(result['code'] === 'not-exists')
				that.setState({message: "The table does not exist!", fetched: false})
			else
				that.setState({fetched: true, tableData: result});
		})
		.catch(function(error) {
			that.setState({message: 'Failed to fetch from servers. Please try again later'});
			console.log('Failed: ' + error);
		});
	}

	componentDidMount() {
		this.fetchTableData(this.state.table_id);
	}

	componentWillReceiveProps(nextProps) {
		if(this.state.table_id !== nextProps.table_id)
		{
			this.fetchTableData(nextProps.table_id);
			this.setState({table_id: nextProps.table_id});
		}
	}

	doInsert() {
		var url = "https://app.cramping38.hasura-app.io/insert-table";

		var requestOptions = {
		    "method": "POST",
		    "headers": {
		        "Content-Type": "application/json"
		    }
		};

		var body = {
			"table_id": this.state.table_id,
			"columns": {},
		} 

		for (var i = Object.keys(this.state.newRow).length - 1; i >= 0; i--) {
			body["columns"][Object.keys(this.state.newRow)[i]] = this.state.newRow[Object.keys(this.state.newRow)[i]];
		};

		requestOptions.body = JSON.stringify(body);

		fetch(url, requestOptions)
		.then(function(response) {
			return response.json();
		})
		.then(function(result) {
		})
		.catch(function(error) {
			alert(JSON.stringify(error));
			console.log('Failed: ' + error);
		});
		this.fetchTableData(this.state.table_id);
	}

	doUpdate(sno, colname, value) {
		var url = "https://app.cramping38.hasura-app.io/update-table";

		var requestOptions = {
		    "method": "POST",
		    "headers": {
		        "Content-Type": "application/json"
		    }
		};

		var body = {
			"table_id": this.state.table_id,
			"columns": {
				[colname]: value
			},
			"sno": sno,
		};

		requestOptions.body = JSON.stringify(body);

		fetch(url, requestOptions)
		.then(function(response) {
			return response.json();
		})
		.then(function(result) {
		})
		.catch(function(error) {
			alert(JSON.stringify(error));
			console.log('Failed: ' + error);
		});
		this.fetchTableData(this.state.table_id);
	}

	doDelete(sno) {
		var url = "https://app.cramping38.hasura-app.io/delete-row";

		var requestOptions = {
		    "method": "POST",
		    "headers": {
		        "Content-Type": "application/json"
		    }
		};

		var body = {
			"table_id": this.state.table_id,
			"sno": sno,
		};

		requestOptions.body = JSON.stringify(body);

		alert(requestOptions.body);

		fetch(url, requestOptions)
		.then(function(response) {
			return response.json();
		})
		.then(function(result) {
		})
		.catch(function(error) {
			alert(JSON.stringify(error));
			console.log('Failed: ' + error);
		});
		this.fetchTableData(this.state.table_id);
	}

	handleInsertClick(event) {
		if(Object.keys(this.state.newRow).length !== 0)
		{
			this.doInsert();
		}
		else
			alert("Nothing to insert!");
	}

	handleNewRowDataChange(event) {
		var target = event.target;
		var value = target.value;
		var name = target.name;
		var tempRow = this.state.newRow
		
		if(value === '')
			delete tempRow[name];
		else
			tempRow[name] = value
		this.setState({newRow: tempRow});
	}

	handleUpdateClick(event) {
		var target = event.target;
		var colname = target.getAttribute('colname');
		var sno = target.getAttribute("sno");

		this.setState({editing: {sno: sno, colname: colname}});
	}

	handleUpdateBlur(event) {
		var target = event.target;
		var value = target.value;
		var colname = target.getAttribute('colname');
		var sno = target.getAttribute("sno");

		this.setState({editing: {sno: undefined, colname: undefined}});
		if(value !== "")
			this.doUpdate(sno, colname, value);
	}

	handleDeleteClick(event) {
		var target = event.target;
		var sno = target.getAttribute("sno");

		if(window.confirm("Are you sure!"))
			this.doDelete(sno);
	}

	render() {
		return (
			<div className="tablespace">
		    	{
					this.state.fetched ?
						Object.keys(this.state.tableData).length === 0 ?
						<div>
							<span>No data in table!</span><br/>
							<span>Insert new data</span>
						</div>
						:
						<UnpackTableData 
							data={this.state.tableData} 
							handleInsertClick={this.handleInsertClick} 
							handleUpdateClick={this.handleUpdateClick} 
							handleUpdateBlur={this.handleUpdateBlur}
							handleDeleteClick={this.handleDeleteClick} 
							handleNewRowDataChange={this.handleNewRowDataChange} 
							editing={this.state.editing}
							newRow={this.state.newRow}
						/>
					:
					<div>
						<span>{this.state.message}</span>
					</div>
				}
			</div>
		);
	}
}


function CreateTableDialog(props) {
	var i = 1;
	const columns = Object.entries(props.newTable.slice(1)).map((value) =>
		<div>
			<span>Column Name: </span>
			<input type='text' name={i} value={props.newTable[i].split('_').join(' ')} onChange={props.handleNewTableChange}/>
			<input type='button' name={i++} value="Delete" onClick={props.handleRemoveRowRequest}/>
		</div>
	);

	return(
		<div className="tablespace">
			<div>
				<span>Table Name: </span>
				<input type='text' name={0} value={props.newTable[0]} onChange={props.handleNewTableChange}/>
			</div>
			{columns}
			<input type='button' value='New Row' onClick={props.handleNewRowRequest}/>
			{
				props.newTable.length !== 1 ?
				<input type='button' value='Create table' onClick={props.handleCreateTableRequest}/>
				:
				<span></span>
			}
		</div>
	);
}

class Dashboard extends Component {
	constructor(props)
	{
		super(props);
		this.state = {
			auth_token: window.localStorage.getItem('HASURA_AUTH_TOKEN'),
			username: window.localStorage.getItem('USERNAME'),
			hasura_id: window.localStorage.getItem('HASURA_ID'),
			table_id: null,
			newTable: {data: ['', ], dialog: false},
		};
		this.openCreateTableDialog = this.openCreateTableDialog.bind(this);
		this.handleNewTableChange = this.handleNewTableChange.bind(this);
		this.handleNewRowRequest = this.handleNewRowRequest.bind(this);
		this.handleRemoveRowRequest = this.handleRemoveRowRequest.bind(this);
		this.handleCreateTableRequest = this.handleCreateTableRequest.bind(this);
		this.doLogout = this.doLogout.bind(this);
		this.handleTableClick = this.handleTableClick.bind(this);
	}

	doCreateTable(){
		var url = "https://app.cramping38.hasura-app.io/new-table";

		var requestOptions = {
		    "method": "POST",
		    "headers": {
		        "Content-Type": "application/json"
		    }
		};

		var body = {
			"user_id": this.state.hasura_id,
			"table_name": this.state.newTable.data[0],
			"columns": this.state.newTable.data.slice(1),
		} 

		var that = this;

		requestOptions.body = JSON.stringify(body);

		fetch(url, requestOptions)
		.then(function(response) {
			return response.json();
		})
		.then(function(result) {
		})
		.catch(function(error) {
			alert(error);
			console.log('Failed: ' + error);
		});
	}

	openCreateTableDialog(event) {
		event.preventDefault();

		var tempTable = this.state.newTable;
		tempTable.dialog = true;
		this.setState({newTableDialog : tempTable, table_id: null});
	}

	handleNewTableChange(event) {
		event.preventDefault();
		var target = event.target;
		var value = target.value;
		var index = target.name;

		var tempTable = this.state.newTable;
		if(index !== 1)
		{
			value = value.split(" ").join('_');
		}
		tempTable.data[index] = value;

		this.setState({newTable: tempTable});
	}

	handleNewRowRequest(event) {
		event.preventDefault();

		var tempTable = this.state.newTable;
		tempTable.data[tempTable.data.length] = '';
		this.setState({newTable: tempTable});
	}

	handleRemoveRowRequest(event) {
		event.preventDefault();
		var target = event.target;
		var index = target.name;

		var tempTable = this.state.newTable;
		tempTable.data.splice(index, 1);
		this.setState({newTable: tempTable});
	}

	handleCreateTableRequest(event) {
		event.preventDefault();

		this.doCreateTable();
		
		this.setState({
			newTable: {
				data: ['', ],
				dialog: false,
			}
		});
	}

	doLogout(event) {
		event.preventDefault();
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

	handleTableClick(event) {
		event.preventDefault();

		var target = event.target;
		var value = target.getAttribute('tableid');
		this.setState({table_id: value});
	}

	render()
	{
		return(
			<Mui muiTheme={muiTheme}>
				{
					this.state.auth_token === null ?
					<Redirect to="/login"/>
					:
					<div className="dashboard">
						<Sidebar 
							username={this.state.username} 
							hasura_id={this.state.hasura_id} 
							handleTableClick={this.handleTableClick} 
							doLogout={this.doLogout}
							openCreateTableDialog={this.openCreateTableDialog}
						/>
						{
							this.state.table_id == null ?
								this.state.newTable.dialog ?
								<CreateTableDialog 
									newTable={this.state.newTable.data} 
									handleNewTableChange={this.handleNewTableChange}
									handleNewRowRequest={this.handleNewRowRequest}
									handleRemoveRowRequest={this.handleRemoveRowRequest}
									handleCreateTableRequest={this.handleCreateTableRequest}
								/>
								:
								<div className="tablespace">
									<span>Select a table</span>
								</div>
							:
							<Tablespace table_id={this.state.table_id}/>		
						}
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
