const express = require('express');
const db = require('./db');
const routes = require('./routes')
require("dotenv").config();

const app = express();
app.use(express.json())
app.use("/user",routes)

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`)
});