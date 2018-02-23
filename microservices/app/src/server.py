from src import app
from flask import jsonify
import requests
import json
from flask import request
import datetime
import os

zapurl = os.environ['ZAPURL']
clustername = os.environ['CLUSTER_NAME']

@app.route("/")
def home():
	return "Hasura Hello World"


@app.route("/json")
def json_message():
    return jsonify(message="Hello World")


#Printing the table details
@app.route('/user-tables',methods=['POST'])
def userTables():
	#Getting the table ids from the user-tables
	url = "http://data." + clustername + "-hasura/v1/query"

	user_id=request.json
	user_id=user_id['user_id']

	requestPayload = {
	    "type": "select",
	    "args": {
	        "table": "Table_details",
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
	}

	resp = requests.request("POST", url, data=json.dumps(requestPayload), headers=headers)
	resp=resp.json()
	details={}

	for i in range(len(resp)):
		table_id=resp[i]['table_id']
		details[table_id] =table_details(table_id)

	return (json.dumps(details))


def table_details(table_id):
	url = "http://data." + clustername + "-hasura/v1/query"

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
	}

	resp = requests.request("POST", url, data=json.dumps(requestPayload), headers=headers)
	resp = resp.json()

	return(resp[0])


#get user defined table details 
@app.route('/fetch-data',methods=['POST'])
def fetch_table_data():
	table_id=request.json;
	table_id=table_id['table_id']

	url = "http://data." + clustername + "-hasura/v1/query"

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
	}

	sql_string=("SELECT column_name from information_schema.columns where table_name='%s' ;" %table_id)

	requestPayload2 = {
    "type" : "run_sql",
    "args" : {
        "sql" :	sql_string,

    	},
	}
	
	resp1 = requests.request("POST", url, data=json.dumps(requestPayload), headers=headers)
	resp1 = resp1.json()
	resp2 = requests.request("POST", url, data=json.dumps(requestPayload2), headers=headers)
	resp2=resp2.json()
	respDict={"data":resp1,"columns":resp2["result"]}

	return(json.dumps(respDict))


#to create a new table
@app.route('/new-table',methods=['POST'])
def create_table():
	data=request.json;
	user_id=data['user_id']
	table_name=data['table_name']
	col=data['columns']
	#adding data in table_details
	#updating the table details

	Data={
		"name":"Table_details",
		"columns": {
			"user_id":user_id,"table_name":table_name , 
			"date_created":datetime.datetime.today().strftime("%Y-%m-%d"), 
			"date_last_modified":datetime.datetime.today().strftime("%Y-%m-%d")
		}
	}

	insert_data_table_details(Data)
	#fetching table_id
	url = "http://data." + clustername + "-hasura/v1/query"

	requestPayload = {
	    "type": "select",
	    "args": {
	        "table": "Table_details",
	        "columns": [
	            "table_id"
	        ],
        "where": {
            "$and": [
                {
                    "table_name": table_name
                },
                {
                    "user_id": user_id
                }
            ]
        }
	    }
	}

	headers = {
	    "Content-Type": "application/json",
	}

	resp = requests.request("POST", url, data=json.dumps(requestPayload), headers=headers)
	resp = resp.json()
	table_id=resp[0]['table_id']

	#creating a sql string
	#creating a new table
	sql_string=('CREATE TABLE "%s" (sno  SERIAL NOT NULL PRIMARY KEY ' %(table_id))

	for val in col:
		sql_string=sql_string+","+val+" TEXT "
	sql_string=sql_string+");"

	url = "http://data." + clustername + "-hasura/v1/query"

	requestPayload = {
    "type" : "run_sql",
    "args" : {
        "sql" :	sql_string
    	}
	}

	headers = {
	    "Content-Type": "application/json",
	}
	
	resp = requests.request("POST", url, data=json.dumps(requestPayload), headers=headers)
	resp = resp.json()

	#adding in the tracked table
	table_id=str(table_id)
	requestPayload = {
	"type": "add_existing_table_or_view",
	"args":{
	    "name": table_id
	    }
	}

	resp = requests.request("POST", url, data=json.dumps(requestPayload), headers=headers)
	resp = resp.json()

	#Zapier Zap:
	Zaprequest = {
	"user_id":user_id,
	"table_id":table_id,
	"action":"Create Table"
	}

	newHeaders = {
	    "Content-Type": "application/json",
	}

	zap_resp = requests.request("POST", zapurl, data=json.dumps(Zaprequest), headers=newHeaders)
	zap_resp=zap_resp.json()

	return(json.dumps(resp))


#insert-table
@app.route('/insert-table',methods=['POST'])
def insert_data():
	data = request.json;
	table_id=data['table_id']
	user_id=data['user_id']
	col=data['columns']

	#creating sql string
	sql_string=('INSERT INTO "%s" (' %(table_id))

	colname=""
	colvalue=""
	for key in col.keys():
		colname=colname+key+", "

		if(not col[key].isnumeric()):
			colvalue=colvalue+"'"+col[key]+"'"+", "
		else:
			colvalue=colvalue+col[key]+", "

	colname=colname[:-2]
	colvalue=colvalue[:-2]
	sql_string=sql_string+colname+")"+" values ("+colvalue+");"

	url = "http://data." + clustername + "-hasura/v1/query"

	requestPayload = {
    "type" : "run_sql",
    "args" : {
        "sql" :	sql_string,

    	},
	}

	headers = {
	    "Content-Type": "application/json",
	}
	
	resp = requests.request("POST", url, data=json.dumps(requestPayload), headers=headers)
	resp = resp.json()

	#Zapier Zap:
	Zaprequest = {
	"user_id":user_id,
	"table_id":table_id,
	"action":"Insert Row"
	}

	newHeaders = {
	    "Content-Type": "application/json",
	}
	zap_resp = requests.request("POST", zapurl, data=json.dumps(Zaprequest), headers=newHeaders)
	zap_resp=zap_resp.json()

	return(json.dumps(resp))


#insert-table when new table is formed
def insert_data_table_details(data):
	name=data['name']
	col=data['columns']

	#creating sql string
	sql_string=('INSERT INTO "%s" (' %(name))

	colname=""
	colvalue=""
	for key in col.keys():
		colname=colname+key+", "

		if(not col[key].isnumeric()):
			colvalue=colvalue+"'"+col[key]+"'"+", "
		else:
			colvalue=colvalue+col[key]+", "

	colname=colname[:-2]
	colvalue=colvalue[:-2]
	sql_string=sql_string+colname+")"+" values ("+colvalue+");"

	url = "http://data." + clustername + "-hasura/v1/query"

	requestPayload = {
    "type" : "run_sql",
    "args" : {
        "sql" :	sql_string,

    	},
	}

	headers = {
	    "Content-Type": "application/json",
	}
	
	resp = requests.request("POST", url, data=json.dumps(requestPayload), headers=headers)
	resp = resp.json()

	return(json.dumps(resp))


#update table
@app.route('/update-table',methods=['POST'])
def update_table():
	data=request.json;
	table_id=data['table_id']
	col=data['columns']
	sno=data['sno']
	user_id=data['user_id']

	url = "http://data." + clustername + "-hasura/v1/query"

	table_id=str(table_id)
	sql_dict={}
	for key in col.keys():
		sql_dict[key]=col[key]


	requestPayload = {
	    "type": "update",
	    "args": {
	        "table": table_id,
	        "where": {
	            "sno": sno
	        },
	        "$set": sql_dict
	    }
	}

	headers = {
	    "Content-Type": "application/json",
	}

	resp = requests.request("POST", url, data=json.dumps(requestPayload), headers=headers)
	resp=resp.json()

	#Zapier Zap:
	Zaprequest = {
	"user_id":user_id,
	"table_id":table_id,
	"action":"Update Row"
	}

	newHeaders = {
	    "Content-Type": "application/json",
	}

	zap_resp = requests.request("POST", zapurl, data=json.dumps(Zaprequest), headers=newHeaders)
	zap_resp=zap_resp.json()

	return(json.dumps(resp))


#deleting rows from table
@app.route('/delete-row',methods=['POST'])
def delete_rows():
	data=request.json
	table_id=data['table_id']
	user_id=data['user_id']
	sno=data['sno']

	url = "http://data." + clustername + "-hasura/v1/query"

	table_id=str(table_id)
	requestPayload = {
	    "type": "delete",
	    "args": {
	        "table": table_id,
	        "where": {
	            "sno": {
	            "$eq": sno

	        	}
	        }
	    }
	}

	headers = {
	    "Content-Type": "application/json",
	}


	resp = requests.request("POST", url, data=json.dumps(requestPayload), headers=headers)
	resp=resp.json()

	#Zapier Zap:
	Zaprequest = {
	"user_id":user_id,
	"table_id":table_id,
	"action":"Delete Row"
	}

	newHeaders = {
	    "Content-Type": "application/json",
	}
	zap_resp = requests.request("POST", zapurl, data=json.dumps(Zaprequest), headers=newHeaders)
	zap_resp=zap_resp.json()

	return(json.dumps(resp))


#dropping table
@app.route('/drop-table',methods=['POST'])
def drop_table():
	data=request.json;
	user_id=data['user_id']
	table_id=data['table_id']
	sql_string=('DROP TABLE "%s" ;' %table_id)
	
	url = "http://data." + clustername + "-hasura/v1/query"

	requestPayload = {
    "type" : "run_sql",
    "args" : {
        "sql" :	sql_string
    	}
	}

	headers = {
	    "Content-Type": "application/json",
	}
	
	resp = requests.request("POST", url, data=json.dumps(requestPayload), headers=headers)
	resp = resp.json()

	requestPayload = {
    "type": "delete",
    "args": {
        "table": "Table_details",
        "where": {
            "table_id": {
                "$eq": table_id
            	}
        	}
    	}
	}

	resp = requests.request("POST", url, data=json.dumps(requestPayload), headers=headers)
	resp = resp.json()

	#Zapier Zap:
	Zaprequest = {
	"user_id":user_id,
	"table_id":table_id,
	"action":"Drop Table"
	}

	newHeaders = {
	    "Content-Type": "application/json",
	}
	zap_resp = requests.request("POST", zapurl, data=json.dumps(Zaprequest), headers=newHeaders)
	zap_resp=zap_resp.json()
	return(json.dumps(resp))
