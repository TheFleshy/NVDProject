const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({status: 'Sistemot e online', proekt: 'NVD Task Tracker'});
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Serverot raboti na port ${PORT}`));