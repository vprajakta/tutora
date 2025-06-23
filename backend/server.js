import express from 'express';
import cors from 'cors';
import 'dotenv/config'
import bodyParser from 'body-parser';
import {createServer} from 'http';
import { Server } from 'socket.io';

import connectDB from './configs/mongodb.js';
import {clerkWebhooks, stripeWebhooks} from './controllers/webhooks.js'
import educatorRouter from './routes/educatorRoutes.js';
import { clerkMiddleware } from '@clerk/express';
import connectCloudinary from './configs/cloudinary.js';
import courseRouter from './routes/courseRoute.js';
import userRouter from './routes/userRoutes.js'
import doubtRouter from './routes/doubtRoute.js';



//Initialize Express
const app = express();



//connect to database
await connectDB()
await connectCloudinary()

//Middlewares
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(clerkMiddleware())
app.use("/clerk", bodyParser.raw({ type: "application/json" }));

const server = createServer(app);

//Initialize IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();
//establish the connection

io.on("connection", (socket) => {
  console.log(`Socket Connected`, socket.id);
  socket.on("room:join", (data) => {
    const { email, room } = data;
    emailToSocketIdMap.set(email, socket.id);
    socketidToEmailMap.set(socket.id, email);
    io.to(room).emit("user:joined", { email, id: socket.id });
    socket.join(room);
    io.to(socket.id).emit("room:join", data);
  });

  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incomming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    console.log("peer:nego:needed", offer);
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    console.log("peer:nego:done", ans);
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });
});

//Routes
app.get('/',(req,res)=>{
    res.send('Api Working successfully');
})

app.post('/clerk',express.json(),clerkWebhooks)

app.use('/api/educator',express.json(),educatorRouter)

app.use('/api/course',express.json(),courseRouter);

app.use('/api/user',express.json(),userRouter)

app.use("/api/doubts", express.json(), doubtRouter);



app.post('/stripe',bodyParser.raw({type: 'application/json'}),stripeWebhooks)



//Port

const PORT = process.env.PORT || 7000

server.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});
