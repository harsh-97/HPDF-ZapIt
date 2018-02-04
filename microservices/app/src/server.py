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

#Login

@app.route('/login',methods=['POST'])
def login():
	username=request.form[username]
	password=request.form[password]
	'''username='Gauri'
	password='password' 
	res=requests.post('auth.cramping38.hasura-app.io/login',{'username':username,'password':password})	
	res=res.json()
	print(res.text) '''
	return jsonify({'username': username,'password': password})	
@app.route('/user-tables',methods=['GET'])
def userTables():
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
	                "$eq": "user_id"
	            }
	        }
	    }
	}
	headers = {
    "Content-Type": "application/json"
	}

	# Make the query and store response in resp
	resp = requests.request("POST", url, data=json.dumps(requestPayload), headers=headers)

	# resp.content contains the json response.
	print(resp.content)
