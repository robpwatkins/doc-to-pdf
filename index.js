const express = require('express');
const app = express();

app.use(express.json());

app.get('/document/:templatesName', require('./controllers/document').show);
app.post('/pdf/download', require('./controllers/pdf').download);
app.get('/ping', (req, res) => res.send('pong'));

app.listen(process.env.PORT, () => console.log(`app listening on port ${process.env.PORT}!`));