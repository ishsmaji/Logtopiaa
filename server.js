const express = require("express");
const { Server } = require('socket.io');
const { createServer } = require('http');
const app = express();
const cors = require("cors"); 

require("dotenv").config();
const PORT = process.env.PORT || 4000;

const CORS_OPTIONS = {
  origin: "*",
  methods: ["GET", "POST"]
};

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: CORS_OPTIONS
});



app.use(cors(CORS_OPTIONS)); 



app.use(express.json());


const logRoutes = require("./routes/logRoutes");


app.use("/api", logRoutes(io)); 

const dbConnect = require("./config/database");
dbConnect();


const { swaggerUi, swaggerSpec } = require('./config/swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.send(`<h1> This is HOMEPAGE </h1>`);
});


io.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});


httpServer.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
