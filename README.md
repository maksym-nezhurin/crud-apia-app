# Project README

## General

This application provides functionality for user registration and authentication, along with a full suite of CRUD (Create, Read, Update, Delete) operations for managing articles. Below is a breakdown of available features and commands.

## Features
### User Management
- `Register a new user`: Create a new account in the application.
- `Login user`: Authenticate an existing user with email and password.
- `Logout user`: End the user session.
- `Refresh token`: Obtain a new authentication token if the current token is expired.

### Article Management

- `Create a new article`: Add a new article to the database.
- `Update an existing article`: Modify the content or details of an existing article.
- `Update article status`: Change the publication status of an article (e.g., publish, draft, archive).
- `Remove article`: Soft-delete the article, marking it as inactive.
- `Delete article`: Permanently delete the article from the database.
## Heroku Commands

- `heroku login` — Log in to Heroku
- `heroku ps:scale web=0` — Scale down the web process
- `heroku ps:scale web=1` — Scale up the web process
- `heroku ps` — View the current process status
- `heroku --help` — Display help information

## Seeding the Database

To seed the database, execute the following command:

```bash
yarn seed:all
```

## Environment Variables

To run this application, you need to set up the following environment variables in a `.env` file at the root of your project. These variables are essential for connecting to the database, accessing third-party APIs, and configuring specific application settings.

### Required Variables

| Variable Name      | Description                                                                                      |
|--------------------|--------------------------------------------------------------------------------------------------|
| `MONGO_URI`        | The URI for connecting to your MongoDB database. This is required for storing and retrieving data. |
| `CLARIFAI_API_KEY` | Your API key for accessing the Clarifai service. This enables image recognition functionality.     |
| `CLARIFAI_URL`     | The base URL for the Clarifai API endpoint. This should be the main endpoint URL provided by Clarifai. |
| `PAT`              | Personal Access Token for authentication with Clarifai. Ensure it has the correct permissions.    |

### Example `.env` File

Create a `.env` file in the root of your project and add the following values, replacing the placeholders with your actual credentials:

```plaintext
MONGO_URI=mongodb://your_mongo_uri
CLARIFAI_API_KEY=your_clarifai_api_key
CLARIFAI_URL=https://api.clarifai.com/v2
PAT=your_personal_access_token
```

Note: Keep your .env file secure and avoid sharing it or pushing it to version control to protect sensitive information.

### Explanation

1. **Table Format**: Using a table format clearly lists each variable, its name, and its purpose, making it easy for readers to understand the setup requirements.
2. **Example `.env` Section**: Providing an example `.env` file makes it simple for users to copy and replace values.
3. **Security Note**: Including a reminder to keep the `.env` file secure encourages best practices for protecting sensitive information.

This layout ensures that the README remains clean, organized, and informative.

### Docker

## I have implemented docker support for this app.

You can run it with docker app and user localhost:5167 address for emulation production data locally.