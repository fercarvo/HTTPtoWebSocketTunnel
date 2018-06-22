const http = require('http');
const io = require('socket.io')

var io_get = null; //Server GET
var io_post = null; //Server POST
var io_default = null; //Server POST

var client_get = null; //cliente GET
var client_post = null; //cliente POST
var client_default = null; //cliente default

var server = http.createServer(function (req, resp) {

	if (!io_get || !io_post || !io_default || !client_get || !client_post || !client_default) {
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
		var data = {
			method, url, headers, data: Buffer.concat(payload)//.toString() 
		}

		if (method === "GET") {
			client_get.emit('request', data, response => {
				let { statusCode, headers, body } = response

				resp.statusCode = statusCode;
				for (var header in headers)
					resp.setHeader(header, headers[header]);
					
				resp.end(body)
			})
		} else if (method === "POST") {
			client_post.emit('request', data, response => {
				let { statusCode, headers, body } = response

				resp.statusCode = statusCode;
				for (var header in headers)
					resp.setHeader(header, headers[header]);
					
				resp.end(body)
			})
		} else {
			console.log("default")
			client_default.emit('request', data, response => {
				let { statusCode, headers, body } = response

				resp.statusCode = statusCode;
				for (var header in headers)
					resp.setHeader(header, headers[header]);
					
				resp.end(body)
			})
		}
	})

})

io_get = io(server, {path: '/get'});
io_post = io(server, {path: '/post'});
io_default = io(server, {path: '/def'});

io_get.on('connection', pil_http_get => {
	console.log("cliente conectado GET")
	client_get = pil_http_get
})

io_post.on('connection', pil_http_post => {
	console.log("cliente conectado POST")
	client_post = pil_http_post
})

io_default.on('connection', pil_http_default => {
	console.log("cliente conectado default")
	client_default = pil_http_default
})

server.listen(5000)



/*var server = http.createServer(function (req, resp) {
    console.log(req.url)

    const options = {
        hostname: 'erp.itsc.ec',
        port: 8088,
        path: req.url,
        method: req.method,
        headers: req.headers
    };
    
    var conn = http.request(options, (res) => {
        res.pipe(resp, {end:true})
        resp.statusCode = res.statusCode

        for (var header in res.headers)
            resp.setHeader(header, res.headers[header]);
    })

    req.pipe(conn, {end:true})

})*/