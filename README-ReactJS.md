### Basic Information 

This is the README for the ReactJS section of the product.
The ReactJS section can be reached by the url: `https://ui.cramping38.hasura-app.io`
It has two main pages, and handles requests to invalid urls as well.
The pages are
	- `/`
	- `/login`

Any anonymous user is redirected to `/login`
`/` is known as the Dashboard and authenticated users are redirected here.


### Premise

The application aims to create and maintain separate tables for each user and allow them to change the contents of the table,
something like a separate database for each user. Any changes made to the tables will be recorded and reflected in the server's
database. Along with this, a log will be maintained, which indicates which tables were altered. This is done via the Zapier Zap API 
web service, which sets up webhooks and is triggered by our defined actions
