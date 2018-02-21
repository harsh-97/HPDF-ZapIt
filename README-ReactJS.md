### Basic Information 

This is the README for the ReactJS section of the product.
The ReactJS section can be reached by the url: `https://ui.cramping38.hasura-app.io`
It has two main pages, and handles requests to invalid urls as well.
The pages are  
  + /  
  + /login  

Any anonymous user is redirected to `/login`
`/` is known as the Dashboard and authenticated users are redirected here.

Authenticated test user credentials:  
  + Username: Test1  
  + Password: password  

### Premise

The application aims to create and maintain separate tables for each user and allow them to change the contents of the table,
something like a separate database for each user. Any changes made to the tables will be recorded and reflected in the server's
database. Along with this, a log will be maintained, which indicates which tables were altered. This is done via the Zapier Zap API     
web service, which sets up webhooks and is triggered by our defined actions


The url for our Google Sheet where all the changed are being logged by Zapier Zap
`https://docs.google.com/spreadsheets/d/1j1tS5zJudkOnZsRYWLUnQYMZfXX29gR-a39B9WleGPc/edit?ouid=101416289756549645318&usp=sheets_home&ths=true`


### Zapier Zap Webhook Format
The webhook should contain data with the following keys
  + user_id
  + table_id
  + action

### Changing the Zap Url
To change the webhook for the Zap, type the following command in the hasura console
`hasura secrets update zap.key <new url>`
This will then redirect any and all zap webhooks to the new URL


### Changing the Auth Token for the Data API
To change the auth token for the Data API, type the following command in the hasura console
`hasura secrets update auth.token <new auth token>`
This will then authorize your server's requests to the Auth API
