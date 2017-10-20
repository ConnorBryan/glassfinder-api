const express = require('express');
const app = express();
const port = process.env.PORT || 6166;
const version = '1.0.0';

app.get('/', (req, res) => res.send(`Glassfinder API v. ${version}`));

app.listen(port, () => console.info(`Glassfinder API listening on port ${port}`));