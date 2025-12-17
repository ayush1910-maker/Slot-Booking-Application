import express from 'express';
import cors from 'cors';
import database from './src/common/config/db1.js';
import fs from 'fs';
import config from './src/common/config/envConfig.js';
import path from 'path';
import {createServer} from 'http';
// import userRoute from './src/api/user/index.js';
// import globalRoute from './src/api/global/index.js'


import user from './src/Api/user/index.js';
import Admin from './src/Api/Admin/index.js'

const app = express();

const server = createServer(app);

app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.json({message: "Hello from the server"});
})

// routes
// app.use('/global', globalRoute);

// app.set("view engine", "ejs")

app.use("/user", user);

app.use("/Admin",Admin)

// database connectivity
database;
console.log(`Database connected to url ${database.url}`)

// server
server.listen(config.PORT, config.HOST, () =>{
    console.log(`Server is running on http://${config.HOST}:${config.PORT}`);
})




























// file upload on local
// app.use('/assets', express.static('assets'));

// Serve static files from src/templates 
// app.use("/templates", express.static(path.join(process.cwd(), "src/templates")));

// swagger for API documentation
// const swaggerSpec = JSON.parse(fs.readFileSync(new URL('./swagger.json', import.meta.url)));
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
