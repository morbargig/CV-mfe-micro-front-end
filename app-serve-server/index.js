const path = require('path')
const express = require('express')
const app = express()

app.use(express.static(path.join(__dirname, '../', 'mfe-react-host', 'build',)))
app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, '../', 'mfe-react-host', 'build', 'index.html'))
})
const port = 80
app.listen(port, () => console.log(`Running server on port ` + port))