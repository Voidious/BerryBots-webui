#!/usr/bin/env node

var express = require('express');
var cgi = require('cgi');
var path = require('path');

var app = express();

app.use('/cgi-bin/runmatch.pl',
        cgi(path.resolve(__dirname, 'app/cgi-bin/runmatch.pl')));
app.use(express.static(__dirname + '/app'));

app.listen(process.env.PORT || 8000);
