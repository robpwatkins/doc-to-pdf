const express = require('express');
const app = express();

app.get('/page/document', require('./controllers/document').show);

app.get('/pdf/download', require('./controllers/pdf').download);

app.get('/ping', (req, res) => res.send('pong'));

app.listen(process.env.PORT, () => console.log(`app listening on port ${process.env.PORT}!`));