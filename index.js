const express = require('express');
const cors = require('cors');
require('dotenv').config();

const port = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(express.json());


app.get('/', async (req, res) =>{
    res.send('Server Started');
})

app.listen(port, () => {
    console.log(`Server is running at PORT: ${port}`); 
})
