const express = require('express')
const mysql = require('mysql')

const app = express()
const port = 2010

app.use(express.json())

const conn = mysql.createConnection({
    user: 'devuser',
    password: 'Mysql123',
    host: 'localhost',
    database: 'jc8expressmysql',
    port: '3306'
})

app.post('/users', (req, res) => {
    const {nama, age} = req.body
    var sql = `INSERT INTO users (nama, age) VALUES ('${nama}', ${age});`
    var sql2 = `SELECT * FROM users;`

    conn.query(sql, (err, result) => {
        if(err) throw err

        conn.query(sql2, (err, result) => {
            if(err) throw err

            res.send(result)
        })
    })
})


app.listen(port, () => {
    console.log("Running at ", port);
    
})