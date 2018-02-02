from src import app
from flask import jsonify
import requests
from flask import request



@app.route("/")
def home():
    return "Hasura Hello World"

# Uncomment to add a new URL at /new

@app.route("/json")
def json_message():
    return jsonify(message="Hello World")

#Login

@app.route('/login',methods=['GET'])
def login():
	#username=request.form[username]
	#password=request.form[password]
	username='Gauri'
	password='password'
	res=requests.post(auth.cramping38.hasura-app.io/login,{'username':username,'password':password})	
	res=res.json()
	print(res.text)
	return "Login-done?"	

