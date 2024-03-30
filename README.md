# Event-Management-System-Assignment


# Tech Stack and Database Choice:


For this project, I choose the following technologies:

Node.Js:As the runtime environment for the application
Express.js:A fast, minimalist web framework for Node.js, ideal for building robust and scalable web applications.
MySQL:A widely-used open-source relational database management system, providing a reliable and scalable solution for storing structured data.
Axios:A promise-based HTTP client for making requests to external APIs, simplifying asynchronous request handling.
Moment.js:A popular library for manipulating and formatting dates and times in JavaScript, crucial for handling event schedules.



# Design Decisions and Challenges:

Express.js:Chosen for its simplicity and scalability, allowing quick setup of routes and handling HTTP requests efficiently.
MySQL: Provides a reliable database solution with strong consistency.
Axios: Simplifies asynchronous request handling and response parsing, crucial for making requests to external APIs.
Moment.js: Facilitates easy manipulation and formatting of date and time data, enhancing the functionality of the application.

# Challenges Addressed:
I recieved a error while checking the events according to pagination
I recieved some syntax errors while inserting and counting the events in database i cleared i changed the database name as event_assignment


# Setup Instructions:

# Prerequisites:

Node.js and npm installed on your machine.
MySQL database server installed and running.

# Steps:
Clone the project repository.
Install dependencies using npm install.
Configure MySQL connection details in the connection object.
Run the MySQL schema setup script to create the necessary database and tables.
Start the Express server using npm start.

# API Documentation:

Endpoint: /events/create
Request Format: JSON

{
  "latitude": "number",
  "longitude": "number",
  "date": "YYYY-MM-DD"
}


Endpoint: /events/find
Request Format: JSON

{
  "latitude": "number",
  "longitude": "number",
  "date": "YYYY-MM-DD"
}

# Error Codes:
400: Bad Request - If required fields are missing or invalid.
404:Events Not Found - If the requested page exceeds the total number of pages available.
500: Internal Server Error