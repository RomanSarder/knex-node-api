const jwt = require('jsonwebtoken');
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjEsInBhc3N3b3JkIjoiMThhMDI1YTZmYTZjMmEwNDZmZTM1ZDUyMWNiMjI5ZDM5YjI4NGE5NjdlY2I5ZjJmOGU1MGM1NjM1YTM0YzE0NCIsIm5hbWUiOiJSb21hbiIsImVtYWlsIjoicm9tYW5AeWEucnUiLCJpYXQiOjE0OTM3MjUyODYsImV4cCI6MTQ5MzgxMTY4Nn0.VdiR12mTmdKmDBoVdmY3en4Gqp1D6qjGJ-3lRAiOWdw";

jwt.verify(token, 'supersecret', (err, decoded) => {
    console.log(decoded);
})