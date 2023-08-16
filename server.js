/*
 * Start custom HTTP/HTTPS server with Next.js build
 */

const express = require("express")
const fs = require("fs")
const next = require("next")

const config = {
    dev: true,
    ports: {
        http: 8080,
        https: 8443,
        dev: 3000,
    },
    ssl: {
        key: "/vol/home/spr/cert/conifer2.key",
        certificate: "/vol/home/spr/cert/conifer2_cs_brown_edu_cert.cer",
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
            throw error
        }
        log("App ready on port " + config.ports.dev)
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