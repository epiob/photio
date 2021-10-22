const express = require('express');

const config = require('./server/config.js');
//database
require('./database');

//server
const app = config(express());

app.listen(app.get('port'), () => {

   console.log('Server on port', app.get('port'));
});
