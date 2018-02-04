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
@app.route('/user-tables',methods=['GET'])
def userTables():
	#Getting the table ids from the user-tables
	url = "https://data.cramping38.hasura-app.io/v1/query"
	user_id=2
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
    "Content-Type": "application/json"
	}
	resp = requests.request("POST", url, data=json.dumps(requestPayload), headers=headers)
	#Using the response to fetch table names that a user has
	resp=resp.json()

	count=0
	for i in range (len(resp)):
		table_id=resp[i]['table_id']
		table_details(table_id)

		count=count+1
	print("hello2",count)
	return(count)




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
	    "Content-Type": "application/json"
	}

	# Make the query and store response in resp
	resp = requests.request("POST", url, data=json.dumps(requestPayload), headers=headers)
	
	# resp.content contains the json response.
	print(resp.content)
	print("hello1")
	return("Hello")
