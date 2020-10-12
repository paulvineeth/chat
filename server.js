const path = require('path')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
//const { Socket } = require('dgram')

const app = express()
const server = http.createServer(app)
const io = socketio(server)
const forwardMessages = require('./utils/messages.js')
const { userJoin, getCurrentUser } = require('./utils/users.js')
app.use(express.static(path.join(__dirname, 'public')));


const botName = 'paul bot';
//Run when client connects
io.on('connection', socket => {
  socket.on('joinRoom', ({username, room})=>{
    const user = userJoin(socket.id, username, room)
    console.log('Room ', user.room)
    socket.join(user.room)
    socket.emit('message', forwardMessages(user.username, 'Welcome to Chat'))
    socket.broadcast.to(user.room).emit('message', forwardMessages(botName, `A ${user.username} has joined the chat`))
  })



  
  socket.on('disconnect', ()=>{
    const user = getCurrentUser(socket.id)
    io.to(user.room).emit('message', forwardMessages(botName,'User has left the chat'))
  })
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id)
    console.log(user)
    if(user){
      io.to(user.room).emit('message', forwardMessages(user.username, msg))
    }
    else{
      console.log('No user found')
    }
    
    //socket.broadcast.emit('message', msg)
  } )
  //console.log('New Web connection..')
})



const PORT = process.env.PORT || 3000
server.listen(PORT, ()=>{
  console.log(`Server Listening to ${PORT}`)
})

