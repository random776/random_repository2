const fs = require("fs");
const express = require("express");
const cookieParser = require("cookie-parser");
const prisma = require("@prisma/client");
const client = new prisma.PrismaClient();
const ejs = require("ejs");
const _ = require("lodash")
let random = Math.random().toString(32).substring(2);

const app = express();
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
//入力フォームの提示
app.get("/", (request, response) => {
    const template = fs.readFileSync("unknown/template.ejs", "utf-8"); 
    const html = ejs.render(template);
    response.send(html);
});
//サインインした場合
app.post("/signin", (request, response) => {
    const user_name = request.body.username;
    const pass_word = request.body.password;
    const name = request.body.name;
    const age = parseInt(request.body.age);
    async function main() {
        await client.user.create({ 
            data: { 
                username: user_name, 
                password: pass_word,
                name: name,
                age: age,  
            }});
        const count = await client.user.findUnique({ 
            where: { 
                username: user_name, 
            }});
        const count2 = await client.user.findUnique({ 
            where: { 
                password: pass_word, 
            }});
        if (_.isEqual(count, count2)) {
            await client.session.create({ 
                data: {
                     userId: count.id,
                     id: random,
            }});
            const template2 = fs.readFileSync("unknown/template2.ejs", "utf-8"); //ejsを入れる
            const html = ejs.render(template2);
            response.cookie( "random", random);
            response.send(html);
        } else {
            response.send("エラーです。設定し直してください。");
        }
    }
    main(); //入力処理・クッキー処理

});
//ログインした場合
app.post("/login" , (request, response) => {
    const user_name = request.body.username2;
    const pass_word = request.body.password2;
    async function main2() {
        const username = await client.user.findUnique({
            where: {
                username: user_name,
            },
        });
        const username2 = await client.user.findUnique({
            where: {
                password: pass_word,
            },
        });
        if (_.isEqual(username, username2)) {
            await client.session.create({ 
                data: { 
                    userId: username.id,
                    id: random,
        }});
            const template2 = fs.readFileSync("unknown/template2.ejs", "utf-8"); //ejsを入れる
            const html = ejs.render(template2);
            response.cookie( "random", random);
            response.send(html);
        } else {
            response.send("該当するユーザーはいません。");
        }
    }
    main2(); //入力処理・クッキー処理
});
//profileの表示
app.get("/profile", (request, response) => {
    async function main3() {
        key = request.cookies.random;
        const cookpad = await client.session.findUnique({ 
            where: { 
                id: key,
            }
        });
        const cookpad2 = await client.user.findUnique({
            where: {
                id: cookpad.userId,
            }
        });
        const name = cookpad2.name;
        const age = cookpad2.age;
        const template3 = fs.readFileSync("unknown/template3.ejs", "utf-8" ); //ejsを入れる
        const html = ejs.render(template3, { name: name, age: age});
        response.send(html);
    }
    main3();
});

app.listen(3000);