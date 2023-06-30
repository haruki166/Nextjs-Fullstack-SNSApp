const express = require('express');
const app = express();
const {PrismaClient} = require('@prisma/client')
const bcrypt = require('bcrypt');

const PORT = 5050;

//prismaclientのインスタンス化
const prisma = new PrismaClient();


//jsonを受け取れるようにミドルウェア設定
app.use(express.json());


//新規ユーザー登録API
app.post('/api/auth/register',async(req,res)=>{
    //クライアントからのbodyを分割代入
    const {username ,email ,password} = req.body;

    //passwordをそのままDBnに保存するのは危ないためハッシュ化を行う
    //第二引数の10は裏側でランダムな値に置き換える時間のことを指定している
    const hashedPassword = await bcrypt.hash(password,10)

    //SQLでいうINSERT文　modelがUserのものに追加！
    const user =  await prisma.user.create({
        data:{
            username,
            email,
            password:hashedPassword
        }
    })

    return res.json({user})
})

//ユーザーログインAPI
app.post('/api/auth/login',async(req,res)=>{
    //クライアントからのbodyを分割代入
    const {email,password} = req.body;

    //同じメールアドレスが見つかればそのレコードの情報がuserに入る
    const user = prisma.user.findUnique({where:{email}});

    //もしデータベースに同じメールアドレスがなかったときの処理
    if(!user){
        return res
            .status(401)
            .json({error:'そのメールアドレスは登録されていません'});
    }

    //クライアントから渡ってきたパスワードとuserのパスワードを照合する
    const isPasswordVaild = await bcrypt.compare(password,user.password);
    if(!isPasswordVaild){
        return res
            .status(401)
            .json({error:'パスワードが間違っています'});
    }

    

})

//サーバー起動
app.listen(PORT,()=>{
    console.log(`Server start🏃‍♂️:${PORT}Port`);
})


