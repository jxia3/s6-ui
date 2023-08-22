/*
 * Start custom HTTP/HTTPS server with Next.js build
 */

const express = require("express")
const fs = require("fs")
const http = require("http")
const https = require("https")
const next = require("next")

const config = {
    dev: process.argv[2] !== "--prod",
    ports: {
        http: 8080,
        https: 8443,
        dev: 3000,
    },
    ssl: {
        enabled: true,
        key: "/vol/home/spr/cert/conifer2.key",
        cert: "/vol/home/spr/cert/conifer2_cs_brown_edu_cert.cer",
    },
    logToConsole: true,
}

// Create log file write stream

const logStream = fs.createWriteStream("server.log", { flags: "a" })
logStream.write("- STARTING AT " + new Date().toISOString() + "\n")
if (config.dev) {
    log("Starting server in DEVELOPMENT mode...")
} else {
    log("Starting server in PRODUCTION mode...")
}

;(async () => {

// Prepare Next.js app

const nextApp = next({ dev: config.dev })
const handleRequest = nextApp.getRequestHandler()
await nextApp.prepare()
log("Next app prepared")

if (config.dev) {
    // Start development server on development port

    const server = express()
    server.all("*", (req, res) => {
        log("Received " + req.method + " request on " + req.url)
        return handleRequest(req, res)
    })

    server.listen(config.ports.dev, error => {
        if (error) {
            log("Error listening on port " + config.ports.dev + ": " + error.message)
            process.exit(1)
        }
        log("App ready on port " + config.ports.dev)
    })
} else {
    // Start production HTTP server

    const app = express()
    app.all("*", (req, res) => {
        log("Received " + req.method + " request on " + req.url)
        return handleRequest(req, res)
    })

    const httpServer = http.createServer(app)
    httpServer.listen(config.ports.http, error => {
        if (error) {
            log("Error listening on port " + config.ports.http + ": " + error.message)
            process.exit(1)
        }
        log("[HTTP] App ready on port " + config.ports.http)
    })

    // Start production HTTPS server

    if (!config.ssl.enabled) {
        return
    }

    const sslOptions = {}
    try {
        sslOptions.key = fs.readFileSync(config.ssl.key)
        sslOptions.cert = fs.readFileSync(config.ssl.cert)
    } catch(error) {
        log("Error reading certificates: " + error.message)
        process.exit(1)
    }
    log("[HTTPS] Loaded certificates")

    const httpsServer = https.createServer(sslOptions, app)
    httpsServer.listen(config.ports.https, error => {
        if (error) {
            log("Error listening on port " + config.ports.https + ": " + error.message)
            process.exit(1)
        }
        log("[HTTPS] App ready on port " + config.ports.https)
    })
}

})()

// Log message to log file

function log(message) {
    const logMessage = "[" + new Date().toISOString() + "] " + message
    if (config.dev || config.logToConsole) {
        console.log(logMessage)
    }
    logStream.write(logMessage + "\n")
}
