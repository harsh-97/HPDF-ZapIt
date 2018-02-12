from src import app
from flask import jsonify
import requests
import json
from flask import request



@app.route("/")
def home():
    return "Hasura Hello World"

# Uncomment to add a new URL at /new

@app.route("/json")
def json_message():
    return jsonify(message="Hello World")


#Printing the table details
@app.route('/user-tables',methods=['POST'])
def userTables():
	#Getting the table ids from the user-tables
	url = "https://data.cramping38.hasura-app.io/v1/query"
	user_id=request.json
	user_id=user_id['user_id']
	requestPayload = {
	    "type": "select",
	    "args": {
	        "table": "User_tables",
	        "columns": [
	            "table_id"
	        ],
	        "where": {
	            "user_id": {
	                "$eq": user_id
	            }
	        }
	    }
	}
	headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer 3b1228c491387cac6c8a09797f61c5e5190957e2f8866b65"
	}
	resp = requests.request("POST", url, data=json.dumps(requestPayload), headers=headers)
	#Using the response to fetch table names that a user has
	resp=resp.json()
	details={}
	for i in range(len(resp)):
		table_id=resp[i]['table_id']
		details[table_id] =table_details(table_id)
	return (json.dumps(details))




def table_details(table_id):

	url = "https://data.cramping38.hasura-app.io/v1/query"
	requestPayload = {
	    "type": "select",
	    "args": {
	        "table": "Table_details",
	        "columns": [
	            "table_name",
	            "date_created",
	            "date_last_modified"
	        ],
	        "where": {
	            "table_id": {
	                "$eq": table_id
	            }
	        }
	    }
	}
	# Setting headers
	headers = {
	    "Content-Type": "application/json",
	    "Authorization": "Bearer 3b1228c491387cac6c8a09797f61c5e5190957e2f8866b65"
	}

	# Make the query and store response in resp
	resp = requests.request("POST", url, data=json.dumps(requestPayload), headers=headers)
	# resp.content contains the json response.
	resp = resp.json()
	print(resp)
	return(resp[0])

#get user defined table details 
@app.route('/fetch-data',methods=['POST'])
def fetch_table_data():
	table_id=request.json;
	table_id=table_id['table_id']
	print(table_id)
	# This is the url to which the query is made
	url = "https://data.cramping38.hasura-app.io/v1/query"

	# This is the json payload for the query
	requestPayload = {
	    "type": "select",
	    "args": {
	        "table": table_id,
	        "columns": [
	            "*"
	        ]
	    }
	}

	headers = {
	    "Content-Type": "application/json",
	    "Authorization": "Bearer 3b1228c491387cac6c8a09797f61c5e5190957e2f8866b65"
	}

	# Make the query and store response in resp
	resp = requests.request("POST", url, data=json.dumps(requestPayload), headers=headers)
	resp = resp.json()
	print(resp)
	return(json.dumps(resp))
#new table 

@app.route('/new-table',methods=['POST'])
def create_table():
	data=request.json;
	name=data['name']	
	print(name)
	col1=data['col1']
	print(col1)
	col2=data['col2']
	print(col2)
	url = "https://data.cramping38.hasura-app.io/v1/query"
	requestPayload = {
    "type" : "run_sql",
    "args" : {
        "sql" : ("CREATE TABLE %s(id SERIAL NOT NULL PRIMARY KEY,%s TEXT NOT NULL, %s TEXT);" %(name,col1,col2))
    	}
	}
	headers = {
	    "Content-Type": "application/json",
	    "Authorization": "Bearer 3b1228c491387cac6c8a09797f61c5e5190957e2f8866b65"
	}
	# Make the query and store response in resp
	resp = requests.request("POST", url, data=json.dumps(requestPayload), headers=headers)
	resp = resp.json()
	print(resp)
	return(json.dumps(resp))
