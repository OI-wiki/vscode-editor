import express from 'express';
import serveStatic from 'serve-static';

var staticBasePath = './vscode';
 
var app = express();
 
app.use(serveStatic(staticBasePath));
app.listen(8080);
console.log('Listening on port 8080');
