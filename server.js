const bodyParser = require('body-parser');
const fs = require('fs');
const readline = require('readline');
const http = require('http');
const express = require('express');
let fname = 'public/history/history.txt';
let app = module.exports.app = express();
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
let server = http.createServer(app);
server.listen(888);
const io = require('socket.io')(server);
const send = (socket) => {
    socket.emit('message', {message: answer})
}

let userCount = 0;
let messagesCount = 0;
io.on('connection', (socket) => {
    userCount++;
    console.log("Connected. Users: " +userCount);
    socket.on('disconnect', () => {
        userCount--;
        console.log("Disconnected. Users: " +userCount);
    })
    socket.on('newMessage', (data) => {
        messagesCount++;
        console.log("New Message! Messages: " +messagesCount);
        socket.broadcast.emit('message', {message: data.message, nick: data.nick, avatar: data.avatar});
        socket.emit('message', {message: data.message, nick: data.nick, avatar: data.avatar});
        fs.appendFile(fname, data.nick +":  "+ data.message + "\n", 'utf-8');
    });
    // socket.on('registration', (data) => {
    //     fs.writeFileSync("public/users/" +data.login+ ".json", `{\n\
    //         "nickname": "${data.login}",\n\
    //         "password": "${data.pass}",\n\
    //         "avatar": "${data.avatar}"\n\
    //     }`);
    //     socket.emit('TrueData', {nickname: data.login, avatar: data.avatar});
    //     // socket.emit('Registered', {nickname: data.login, avatar: data.avatar})
    // })
    const getRegData = (req, res) => {
        console.log("getRegData");
        return new Promise((resolve, reject) => {

            let body = req.body;
            const {nickname, password, avatarUrl} = body;
            let user = {
                    "nickname": nickname,
                    "password": password,
                    "avatarUrl": avatarUrl
                }
            resolve(user)

        })
    }
    const checkUserData = (user) => {
        console.log("checkUserData");
        return new Promise((resolve, reject) => {

            fs.readFile(`public/users/${user.nickname}.json`, (err) => {
                if (err) {
                    resolve(user)
                } else {
                    socket.emit('FailedAuth', {error: "Никнейм уже занят"});
                    console.log("FailedReg: Nick");
                }
            });

        })
    }
    const addNewUser = (user) => {
        console.log("addNewUser");
        return new Promise((resolve, reject) => {

            fs.writeFile(`public/users/${user.nickname}.json`, JSON.stringify(user), (err) => {
                if (err) {
                    socket.emit('FailedAuth', {error: "Недопустимые данные"});
                    console.log("FailedReg");
                }
                console.log("Reged");
                resolve(user);
            });

        })
    }
    app.post('/registration', (req, res) => {

        getRegData(req, res)
            .then((user) => {
                checkUserData(user)
                    .then((user) => {
                        addNewUser(user)
                            .then((user) => {
                                console.log("END!");
                                socket.emit('Authed', {nickname: user.nickname, avatar: user.avatarUrl, isAuth: true})
                            })
                    })
            })

    })

    socket.on('login', (data) => {
        let direct = "public/users/" +data.nickname+ ".json";
        fs.readFile(direct, 'utf-8', (err, fileData) => {
            if (err) {
                socket.emit('FailedAuth', {error: "Пользователя с данным ником не найдено"});
            }
            else {
                let json = JSON.parse(fileData);

                    if (json.password === data.pass) {
                        socket.emit('Authed', {nickname: json.nickname, avatar: json.avatar, isAuth: true});
                        console.log("Authed");
                    }
                    else {
                        socket.emit('FailedAuth', {error: "Недопустимые данные"});
                        console.log("FailedAuth");
                    }
            }


        })


    })
})
