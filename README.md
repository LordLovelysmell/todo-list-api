# Todo List API

Welcome to the **Todo List API** project! This is an API for managing your to-do tasks.

## Installation

1. Make sure you have [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed on your computer.

2. Clone this repository to your computer:

```bash
git clone https://github.com/LordLovelysmell/todo-list-api.git
```

3. Install the dependencies:

```
npm install
```

## Configuration

1. Create a `config.env` file in the root folder of the project.

2. In the `config.env` file, specify the required environment variables. Example is in `example.env` and you can freely **copy it** to `config.env`.

## Running

### Running using Docker

To using this option you need [Docker](https://www.docker.com/) to be installed on your computer.

1. Start the application in development mode using following command:

```
docker-compose up -d --build
```

### Running without Docker

To using this option you need [MongoDB](https://www.mongodb.com/) installed on your computer, otherwise the app will not work.

1. Start the application using following command:

```
npm start
```

## Interacting with Todo List API using Postman

There is a [Postman Collection v2.1](api.postman_collection.json) for Postman.

Just import file named `api.postman_collection.json` located in root directory of the project to Postman (File -> Import).

You will also need to import [environment](env.postman_environment.json) for Postman to effectively interact with Todo List API. The environment is also in the project root.

## Testing

1. Run tests:

```
npm test
```

2. Run tests with coverage report:

```
npm run test:coverage
```

## License

[MIT](https://choosealicense.com/licenses/mit/)
