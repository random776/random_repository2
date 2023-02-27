const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static("static"));

const messages = [];

app.get("/messages", (request, response) => {
    response.json(messages);
});     //messagesをjsonデータとしてリクエストする

app.post("/send", (request, response) => {
    messages.push(request.body.message);
    response.send();
});     //messageにレスポンスされたものを突っ込む

app.listen(3000);