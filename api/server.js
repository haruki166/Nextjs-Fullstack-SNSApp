const express = require('express');
const app = express();
const authRoute = require('./routes/auth');

const PORT = 5050;

//jsonを受け取れるようにミドルウェア設定
app.use(express.json());

app.use('/api/auth',authRoute);


//サーバー起動
app.listen(PORT,()=>{
    console.log(`Server start🏃‍♂️:${PORT}Port`);
})


