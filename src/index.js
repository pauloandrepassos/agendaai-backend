const express = require('express');
const cors = require('cors')
const app = express();
const routes = require('./routes')

require('./models/associassoes')

app.use(express.json())

app.use(cors())

app.use('/', routes)

module.exports = app