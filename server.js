const http = require('http');
const io = require('socket.io')
var hostname = "erp.itsc.ec"
var port = 8088;
var io_conn = null; //Server GET
var client = null; //cliente GET

var server = http.createServer(function (req, resp) {

	if (!io_conn || !client) {
		resp.statusCode = 500
		return resp.end();
	}

	const { headers, method, url } = req;
	console.log(method + ' ' + url);
	
	var payload = [];
	req.on('error', (err) => {
		console.error(err);
		resp.statusCode = 500
		return resp.end('error request server side');
	})
	.on('data', chunk => payload.push(chunk))
	.on('end', () => {

		client.emit('request', { hostname, port, method, url, headers, data: Buffer.concat(payload) }, response => {
			let { statusCode, headers, body } = response

			resp.statusCode = statusCode;
			for (var header in headers)
				resp.setHeader(header, headers[header]);
				
			resp.end(body)
		})
	})
})

io_conn = io(server, {path: '/connection_session'});

io_conn.on('connection', socket => {
	console.log("cliente conectado")
	client = socket
	socket.on('disconnect', () => client = null)
})

server.listen(5000);