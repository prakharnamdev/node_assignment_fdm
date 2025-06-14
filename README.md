# Node Assignment - FDM User Import Service

A Node.js Express application to manage users through RESTful APIs and Excel upload. Includes Swagger documentation, structured logging, validation, and error handling.

---

## Features

- Upload users via Excel (.xlsx)
- Full CRUD operations for users
- Pagination and search support
- Swagger API documentation
- Centralized error handling
- Validation using Joi
- Logger with winston

---

## Getting Started

### Environment Variables

Create a `.env` file in the root directory: 
add this data in your .env

PORT=5000
MONGO_URI=mongodb://localhost:27017/node-assignment-fdm

---

### Installation and server start

Install dependencies using:

```bash

npm install

###
Start nodemon server using:

npm run dev


---

###
node_assignment-fdm.postman_collection — all API requests added for Postman testing

sample_users.xlsx — a sample Excel file to test the upload API ()

swagger url - http://localhost:5000/docs (use this url inside browser)