iPlan API Documentation
=======================

The iPlan API is a RESTful API for managing events on a calendar. It uses [Node.js](https://nodejs.org/) and [Express](https://expressjs.com/) for the server and [MongoDB](https://www.mongodb.com/) as the database. This API uses [Mongoose](https://mongoosejs.com/) as the ODM (Object Document Mapper) for MongoDB.

Prerequisites
-------------

*   Node.js
*   Express
*   MongoDB
*   Mongoose
*   validator

Installation
------------

1.  Clone the repository:

`git clone https://github.com/czerkisi/iPlan.git`

2.  Install the dependencies:

`npm install`

Connecting to MongoDB
---------------------

The API connects to a local instance of MongoDB with the following line of code:

`mongoose.connect('mongodb://localhost/iplan', { useNewUrlParser: true });`

Event Schema
------------

| Field               | Type             | Validation                                                                                                       |
|---------------------|------------------|------------------------------------------------------------------------------------------------------------------|
| summary             | String           | Required, minimum length of 5 characters, maximum length of 100 characters                                       |
| start               | Date             | Required                                                                                                         |
| end                 | Date             | Required, must be after the start date                                                                           |
| stamp               | Date             | Immutable, default value is the current date                                                                     |
| description         | String           | Default value is an empty string, maximum length of 1000 characters                                              |
| location            | String           | Default value is an empty string, maximum length of 100 characters                                               |
| status              | String           | Default value is "CONFIRMED", must be one of ["TENTATIVE", "CONFIRMED", "CANCELLED"]                             |
| organizer           | String           | Default value is an empty string, maximum length of 100 characters                                               |
| attendees           | Array of Strings | Default value is an empty array, each email address must be a maximum of 100 characters and a valid email format |
| uid                 | String           | Required, unique, minimum length of 5 characters, maximum length of 100 characters                               |
| sequence            | Number           | Default value is 0, minimum value is 0                                                                           |
| created             | Date             | Default value is the current date                                                                                |
| lastModified        | Date             | Default value is the current date, must be after the created date                                                |
| recurrenceId        | String           | Default value is an empty string, maximum length of 100 characters                                               |
| recurrenceRule      | String           | Default value is an empty string, maximum length of 1000 characters                                              |
| recurrenceException | Array of Dates   | Default value is an empty array                                                                                  |
| alarm               | Object           | Default value is an empty object, must have "action" and "trigger" properties                                    |

Calendar Schema
---------------

| Field     | Type                   | Validation                                                                                                            |
|-----------|------------------------|-----------------------------------------------------------------------------------------------------------------------|
| creator   | String                 | Required                                                                                                              |
| name      | String                 | Required                                                                                                              |
| events    | Array of Event Objects |
| productId | String                 | Default value is "-//iPlan API//NONSGML ${this.name}//EN".                                                            |
| version   | String                 | Default value is "2.0".                                                                                               |
| calscale  | String                 | Default value is "GREGORIAN".                                                                                         |
| method    | String                 | Default value is "PUBLISH".                                                                                           |
| uid       | String                 | Immutable, default value is generated using the creator, a random string of 16 hex characters, and the calendar name. |

User Schema
-----------

| Field     | Type                      | Validation                       |
|-----------|---------------------------|----------------------------------|
| username  | String                    | Required                         |
| password  | String                    | Required                         |
| calendars | Array of Calendar Objects | Default value is an empty array. |

API Documentation:
-----------------

**POST /login**

*   Authenticate user's credentials
*   Returns a session key to authorize future requests

Request Body:

*   No request body is required.

Responses:

*   200 OK: Login successful.
*   401 Unauthorized: Incorrect username or password.
*   500 Internal Server Error: An error occurred when creating session key.

**POST /createUser**

*   Creates a new user

Request Body:

*   username (string): The username for the new user (required)
*   password (string): The password for the new user (required)

Responses:

*   201 Created: User successfully created.
*   400 Bad Request: A required field is missing in the request body.
*   500 Internal Server Error: An error occurred when creating the user.

**GET /events**

*   Retrieve events from the specified calendar of a specific user

Query Parameters:

*   username (string): The username of the user whose calendar is being requested (required)
*   calendarName (string): The name of the calendar to retrieve (required)

Responses:

*   200 OK: Events successfully retrieved.
*   400 Bad Request: A required parameter is missing in the request.
*   404 Not Found: The specified user or calendar was not found in the database.
*   500 Internal Server Error: An error occurred when retrieving events from the database.

**POST /events**

*   Add a new event to the specified calendar of a specific user

Query Parameters:

*   username (string): The username of the user whose calendar is being updated (required)
*   calendarName (string): The name of the calendar to update (required)

Request Body:

*   (object): The event data to add to the calendar (required)

Responses:

*   201 Created: Event successfully created and added to the specified calendar.
*   400 Bad Request: A required parameter is missing in the request or no request body was provided.
*   404 Not Found: The specified user or calendar was not found in the database.
*   500 Internal Server Error: An error occurred when adding the event to the calendar.

**PUT /events**

*   Update an existing event in the specified calendar of a specific user

Query Parameters:

*   username (string): The username of the user whose calendar is being updated (required)
*   calendarName (string): The name of the calendar to update (required)
*   eventId (string): The ID of the event to update (required)

Request Body:

*   (object): The updated event data to replace the existing event (required)

Responses:

*   200 OK: Event successfully updated.
*   400 Bad Request: A required parameter is missing in the request or no request body was provided.
*   404 Not Found: The specified user, calendar, or event was not found in the database.
*   500 Internal Server Error: An error occurred when updating the event.

**DELETE /events**

*   Delete an existing event from the specified calendar of a specific user

Query Parameters:

*   username (string): The username of the user whose calendar is being updated (required)
*   calendarName (string): The name of the calendar to update (required)
*   eventId (string): The ID of the event to delete (required)

Responses:

*   200 OK: Event successfully deleted.
*   400 Bad Request: A required parameter is missing in the request.
*   404 Not Found: The specified user, calendar, or event was not found in the database.
*   500 Internal Server Error: An error occurred when deleting the event.

**GET /:uid.ics**

*   Retrieve an iCal file for a specified calendar

Query Parameters:

*   uid (string): The unique ID of the calendar (required)

Responses:

*   200 OK: Returns the iCal file for the specified calendar.
*   500 Internal Server Error: An error occurred when retrieving the iCal file.

**POST /createCalendar**

*   Create a new calendar for a specific user

Query Parameters:

*   calendarName (string): The name of the new calendar (required)

Request Body:

*   sessionKey (string): The session key of the user creating the calendar (required)

Responses:

*   201 Created: The calendar was successfully created and returns the newly created calendar.
*   400 Bad Request: A required parameter is missing in the request.
*   401 Unauthorized: The session key provided is invalid or expired.
*   404 Not Found: The specified user was not found in the database.
*   500 Internal Server Error: An error occurred when creating the calendar.