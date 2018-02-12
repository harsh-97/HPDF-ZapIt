from src import app
from flask import jsonify
import requests
import json
from flask import request
import datetime



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
	
	headers = {
	    "Content-Type": "application/json",
	    "Authorization": "Bearer 3b1228c491387cac6c8a09797f61c5e5190957e2f8866b65"
	}

	
	resp = requests.request("POST", url, data=json.dumps(requestPayload), headers=headers)
	
	resp = resp.json()
	print(resp)
	return(resp[0])

#get user defined table details 
@app.route('/fetch-data',methods=['POST'])
def fetch_table_data():
	table_id=request.json;
	table_id=table_id['table_id']
	print(table_id)

	url = "https://data.cramping38.hasura-app.io/v1/query"

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

	
	resp = requests.request("POST", url, data=json.dumps(requestPayload), headers=headers)
	resp = resp.json()
	print(resp)
	return(json.dumps(resp))
#to create a new table

@app.route('/new-table',methods=['POST'])
def create_table():
	data=request.json;
	table_id=data['table_id']
	user_id=data['user_id']
	table_name=data['table_name']
	col=data['columns']
	#creating a sql string
	#creating a new table
	sql_string=('CREATE TABLE "%s" (sno  SERIAL NOT NULL PRIMARY KEY ' %(table_id))
	for val in col:
		sql_string=sql_string+","+val+" TEXT "
	sql_string=sql_string+");"

	print(sql_string)
	url = "https://data.cramping38.hasura-app.io/v1/query"
	requestPayload = {
    "type" : "run_sql",
    "args" : {
        "sql" :	sql_string
    	}
	}
	headers = {
	    "Content-Type": "application/json",
	    "Authorization": "Bearer 3b1228c491387cac6c8a09797f61c5e5190957e2f8866b65"
	}
	
	resp = requests.request("POST", url, data=json.dumps(requestPayload), headers=headers)
	resp = resp.json()
	print(resp)
	#updating the value in user_details
	insertData={
		"name":"User_tables",
		"columns": {"user_id":user_id, "table_id":table_id}
	}
	insert_data(insertData)
	#updating the table details
	insertData={
	"name":"Table_details",
	"columns": {"table_id":table_id, "table_name":table_name , "date_created":datetime.datetime.today().strftime("%Y-%m-%d"), "date_last_modified":datetime.datetime.today().strftime("%Y-%m-%d")}
	}
	insert_data(insertData)


#insert-table
@app.route('/insert-table',methods=['POST'])
def insert_data(data=None):
	if(data==None):
		data=request.json();
	name=data['name']
	col=data['columns']

	#creating sql string
	sql_string=('INSERT INTO "%s" (' %(name))
	colname=""
	colvalue=""
	for key in col.keys():
		colname=colname+ "'"+key+"'"+", "
		if(not key.isnumeric()):
			colvalue=colvalue+"'"+col[key]+"'"+", "
		else:
			colvalue=colvalue+col[key]+", "

	colname=colname[:-2]
	colvalue=colvalue[:-2]
	sql_string=sql_string+colname+")"+" values ("+colvalue+");"

	print(sql_string)
	url = "https://data.cramping38.hasura-app.io/v1/query"
	requestPayload = {
    "type" : "run_sql",
    "args" : {
        "sql" :	sql_string
    	}
	}
	headers = {
	    "Content-Type": "application/json",
	    "Authorization": "Bearer 3b1228c491387cac6c8a09797f61c5e5190957e2f8866b65"
	}
	
	resp = requests.request("POST", url, data=json.dumps(requestPayload), headers=headers)
	resp = resp.json()
	print(resp)
	return(json.dumps(resp))
