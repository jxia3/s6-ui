/*
 * Start server process keep process alive
 */

const forever = require("forever-monitor")

const app = new forever.Monitor("server.js", {
    args: process.argv.slice(2),
    minUptime: 5000,
})
app.start()