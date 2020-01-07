const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/users')
const taskRouter = require('./routers/tasks')

const app = express()
const port = process.env.PORT || env.PORT

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, ()=> {
    console.log('Server is on port : ' + port)
})


