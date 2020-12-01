var http    = require('http');
const https = require('https');
var io      = require('socket.io-client')
var Stream  = require('stream').Transform
var protocolo = http;


var proxy_server = process.argv[2]
if (!proxy_server) throw Error(`Proxy server not defined: ${proxy_server}`)

var hub = io(proxy_server, {path: '/connection_session'});

hub.on('request', async (req, response_cb) => {
    //console.log(req.method + ' ' + req.url);
    var data = await ajax(req.hostname, req.port, req.url, req.method, req.headers, req.data, req.https)
    response_cb(data)
})

hub.on('connect', () => console.log(`This <-----> ${proxy_server} [${new Date().toLocaleString()}]`))
hub.on('disconnect', () => console.log(`This <-   -> ${proxy_server} [${new Date().toLocaleString()}]`))

function ajax (hostname, port, path, method, headers, data, coneccionHttps) {
    const options = { hostname, port, path, method, headers }

    return new Promise(resolve => {
        if (coneccionHttps) {
            process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
            protocolo = https;
        } else {
            protocolo = http;
        }
        
        var req = protocolo.request(options, res => {
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
