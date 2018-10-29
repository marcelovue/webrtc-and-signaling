const makeSocket = require('socket.io')
const express = require('express')

const app = express()

app.use(express.static(__dirname+'/public/'))

let port = 7000
const server = app.listen(port,
  () => console.log(`Server listining on ${port}`))


const io = makeSocket(server)

class UsersClass {
  constructor() {
    this.users = {}
  }
  user(socketId) {
    return this.users[socketId]
  }
  add(user) {
    this.users[user.socket.id] = user
    return user
  }
  remove(socketId) {
    delete this.users[socketId]
  }
  removeConnections(socketId) {
    this.users.each((user) => {
      delete user.connections[socketId]
    })
  }
  addConnection(data) {
    let { connId, user } = data
    if (!data || (data && !data.answer) || (data && !data.offer))
      return;
    user.connections[connId] = data
  }
  getUsers() {
    let users = []
    Object.keys(this.users).map(socketId => {
      let user = Object.assign({},this.users[socketId])
      delete user.socket
      users.push(user)
    })
    return users
  }
}
global.Users = new UsersClass()

Object.prototype.each = function(callback) {
  for (let key of Object.keys(this)) {
    let value = this[key];
    callback(value, key)
  }
}
Object.prototype.indexOf = function(key) {
  return Object.keys(this).indexOf(key)
}
Object.prototype.length = function() {
  return Object.keys(this).length
}
let connId = 0;
const sockets = io.on('connection', (socket) => {
  let user = JSON.parse(socket.handshake.query.user)
  user = Users.add({ socket, ...user, connections: [] })

  // socket.broadcast.emit('sdp', user.sdp)
  sockets.emit('users', Users.getUsers())

  const connectToOthers = () => {
    let users = Users.users
    let userOffer = user
    users.each((userAnswer, socketId) => {
      //if this user's already trying to connect to me
      if (userAnswer.connections.indexOf(userOffer.socket.id) !== -1)
        return;
      if (userOffer.connections.indexOf(userAnswer.socket.id) !== -1)
        return;
      if (socketId === socket.id) return;
      if (userOffer.connections.indexOf(socketId) === -1) {
        console.log(`${socket.id} connecting to ${socketId}`)
        connId++
        //this is going to the offer
        socket.emit('create offer', { answer: { socketId }, connId })
        //offer connecting to answer
        userOffer.connections[socketId] = {}
        //answer connecting to offer
        userAnswer.connections[userOffer.socket.id] = {}
      }
    })
    socket.on('offer created', (data) => {
      console.log('______________________________________')
      console.log('offer created', socket.id)
      let { offer, answer, connId } = data
      let { socketId } = answer
      //this is going to the answer
      socket.to(socketId).emit('create answer', { offer, answer, connId })
    })
    socket.on('answer created', (data) => {
      console.log('answer created', socket.id)
      let { answer, offer, connId } = data
      let { socketId, sdp } = offer
      //this is going to the offer
      socket.to(socketId).emit('set answer', { answer, connId })
    })
    socket.on('peers connected', (data) => {
      console.log('peers connected <<<<<<<<')
      data.user = user
      data.connId = connId
      Users.addConnection(data)
      // console.log('PEERS CONNECTED!')
      // let { answer, offer } = data
      // let tmpUser = Users.users[offer.socketId]
      // if (!tmpUser) return;
      // tmpUser.connections = { answer, offer }
    })

    socket.on('set ice candidate', data => {
      //target is answer or offer
      let { target, candidate, connId } = data
      socket.to(target.socketId).emit('set ice candidate', {
        candidate, connId
      })
    })

    socket.on('offer negotiation', data => {
      socket.to(answer.socketId).emit('offer negotiation', data)
    })
    socket.on('answer negotiation', data => {
      socket.to(offer.socketId).emit('answer negotiation', data)
    })

    // socket.to().emit('create offer', {})
    // socket.to().emit('create answer', {})
  }

  connectToOthers()

  socket.on('disconnect', () => {
    Users.removeConnections(socket.id)
    Users.remove(socket.id)
    // Connections.remove(user)
  })
  console.log(`${socket.id} connected`)
})
