## ZapIt

### Premise
This application aims to create and maintain separate tables for each user and allow them to change the contents of the table, something like a separate database for each user. Any changes made to the tables will be recorded and reflected in the server's database. Along with this, we maintain records of all user actions. This is done via the Zapier Zap API web service, which sets up webhooks and is triggered along with every user action.

The logs can be found at [this link]   (https://docs.google.com/spreadsheets/d/1j1tS5zJudkOnZsRYWLUnQYMZfXX29gR-a39B9WleGPc/edit?usp=sharing)

### How to Access It
The application is hosted on cluster `cramping38` as of posting, and can be accessed [here] (https://ui.cramping38.hasura-app.io). It has two main endpoints
  + / (known as the Dashboard)
  + /login   

Anonymous users are redirected to `/login`

### New User Guide
New users should go [here] (https://ui.cramping38.hasura-app.io/login) and select the sign-up option.

 ![SignupProcess (2).png](https://filestore.hasura.io/v1/file/9038d9e7-47c3-4573-a1d4-f8087a32bb43)

After a quick signup process, you will be redirected to the Dashboard. 

#### New Tables
Select the `New Table` option (found at the bottom left of the page). Fill in the details, select `New Column` to get new columns and select `Create Table` to complete the process 

 ![CreateTable (2).png](https://filestore.hasura.io/v1/file/09b3561f-d18c-4254-958e-7e19a0e7c5b6)

A browser refresh may be required to update the list of tables on the Sidebar.

#### Inserting Data
Having selected a table, enter data in the empty text fields at the end of the table and press the plus icon, to insert a new row. 

You can leave certain fields blank, but at least one of all fields has to be filled

#### Updating Rows
By clicking on any data item, it will become editable and you will be able to change the contents of that item. 

 ![Update (2).png](https://filestore.hasura.io/v1/file/af109f36-2808-4f67-b50b-46a61eb8b73f)

**A word of caution:** Leaving the field blank will also be recorded as a change, and as such will change the contents of that data item to blank
 
#### Deleting Rows
The minus icon placed beside every row is used to delete the particular row in question.

#### Deleting Tables
A button placed at the bottom of the page marked `Delete Table` is used to delete the table.

A browser refresh may be required to update the list of tables on the Sidebar


### Deploying on Another Cluster
The `app` microservice (the backend), has been set up to be cluster independent, while the `ui` microservice (the frontend), is *almost* cluster independent. You will have to change a variable to get all requests pointed to your cluster

1. Run the command `hasura quickstart gauri_97/zapit`
2. Run the command `cd zapit/microservices/ui/app/src`
3. Open up `App.js` and edit line 24 

    >const CLUSTER_NAME = <clustername>;

    Replace <clustername> with the name of your cluster, save and exit

4. `cd ../../../..` and run `git add . && git commit -m "First Commit"`
5. Run the command `git push hasura master`. Once that is complete, Zapit has been deployed on your cluster
6. Go on ahead to `ui.<clustername>.hasura-app.io/`


### Internal Implementation Details
#### Zapier Zap Integration
The Zapier webservice is used in this application and whenever a user makes change to a table in the UI, a webhook is sent to Zapier with the following information:
``` 
{
  "user_id": "ham",
  "table_id": "spam",
  "action": "eggs",
}
```

The Zapier Zap is set to unpack the object sent to it and insert it into a Google Sheets [sheet]
 (https://docs.google.com/spreadsheets/d/1j1tS5zJudkOnZsRYWLUnQYMZfXX29gR-a39B9WleGPc/edit?usp=sharing), as a means of logging it. 


#### Changing the Zap URL
There will arise a situation where you would require to change the location where Zapier will log all the data, or maybe you would like something else to be done with the logging information. In that case, you will need to change the Zap URL.

This is done relatively straightforward. Enter `hasura secrets update zap.key <new url>`

Hey presto! All webhooks are now sent to the new Zap

### Additional Notes
+ The changes made to the database via users are, as of yet, **irreversible**.
+ It may take some time to propagate changes and reflect in the displayed table. However, when the progress indicator in the top right stops, and a message saying
 >All changes synced and logged

Then you can rest assured that the changes have been made. If the changes do not reflect in the view, re-select the table from the list of tables to manually refresh it.
+ The application is also [hosted on the Hasura Hub] (https://hasura.io/hub/projects/gauri_97/zapit). Go check it out if you're interested in deploying it on a cluster of your own.

### Contributors
We hope that this application turns out to be useful and (relatively) bugfree for you. 

In case you require some support, have an idea you would like to share, want to contribute to this application, or just say hi, feel free to reach out to the contributors of the application at the email ids given below

Made with <3 by
+ Harsh Seth (sethharsh.sureshchand2016@vitstudent.ac.in)
+ Gauri Singh (gauri.singh2016@vitstudent.ac.in)
