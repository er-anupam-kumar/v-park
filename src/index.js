const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const hbs = require('hbs')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const pathToPublic = path.join(__dirname,'../public')
const pathToViews    = path.join(__dirname,'../templates/views')
const pathToPartials = path.join(__dirname,'../templates/partials')
const port = process.env.PORT || 3000

app.set('view engine','hbs')
app.set('views',pathToViews)
hbs.registerPartials(pathToPartials)

app.use(express.static(pathToPublic))

app.get('/',async(req,res)=>{
	res.render('index',{title:"V-Park"})
})

let users = []

io.on('connection', function(socket){
	io.sockets.emit("user-joined", socket.id, io.engine.clientsCount, Object.keys(io.sockets.clients().sockets));

	socket.on('signal', (toId, message) => {
		io.to(toId).emit('signal', socket.id, message);
	});

	socket.on("message", function(data){
		io.sockets.emit("broadcast-message", socket.id, data);
	})

	socket.on('disconnect', function() {
		io.sockets.emit("user-left", socket.id);
	})
});

server.listen(port,()=>{
	console.log(`Server is running at port:${port}`)
})