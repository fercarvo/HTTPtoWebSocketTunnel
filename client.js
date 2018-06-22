var http = require('http');
var io = require('socket.io-client')
var Stream = require('stream').Transform
var hub = io(process.argv[2] || 'http://localhost:3000', {path: '/connection_session'});

hub.on('request', async (req, response_cb) => {
    console.log(req.method + ' ' + req.url);
    var data = await ajax(req.hostname, req.port, req.url, req.method, req.headers, req.data)
    response_cb(data)
})

function ajax (hostname, port, path, method, headers, data) {
    const options = { hostname, port, path, method, headers }

    return new Promise(resolve => {
        var req = http.request(options, res => {
            var payload = new Stream();     

            res.on('data', chunk => payload.push(chunk))

            res.on('end', function () {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: payload.read()
                })
            })
        })
        
        req.on('error', err => {
            console.log(err.message)
            return resolve({
                statusCode: 500,
                headers: {},
                body: "Error client"
            })
        })
        req.write(data || "")
        req.end()
    })
}