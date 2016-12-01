const onError = (text) => {
    $('.info').css({display: "block"});
    $('.info').html(text)
    $('.info').animate({opacity: "1"}, 200);
    setTimeout(() => {
        $('.info').animate({opacity: "0"}, 100);
        setTimeout(() => {
            $('.info').css({display: "none"});
        }, 100);
    }, 2000);
}
const logoAnim = () => {
    $('.overlay').css({
        background: "rgba(0,0,0,.53)"
    })
    $('.logoText').animate({
        opacity: "1",
        lineHeight: "15vw",
    })
}
const logoReAnim = () => {
    $('.overlay').css({
        background: "rgba(0,0,0,.5)"
    })
    $('.logoText').animate({
        opacity: "0",
        lineHeight: "5vw"
    })
}
let nickname, avatar;
let socket = io('http://localhost:888/');
const logIn = () => {

    $('.logNick, .logPass, .logGo').css({display: "block"});
    $('.logNick, .logPass, .logGo').animate({opacity: "1"}, 300)
    $('.goLog, .goReg').css({display: "none"})
}
const signUp = () => {
    $('.goLog, .goReg').css({display: "none"})
    $('.regNick, .regPass, .regPass2, .regGo, .regAvatar').css({display: "block"})
    $('.regNick, .regPass, .regPass2, .regGo, .regAvatar').animate({opacity: "1"}, 300)
}
const register = () => {
    let regNick = document.getElementById('regNick').value;
    let regPass = document.getElementById('regPass').value;
    let regPass2 = document.getElementById('regPass2').value;
    let regAvatar = document.getElementById('regAvatar').value;
    if (regNick.length >= 4) {

        if (regPass.length >= 8 && regPass2.length >= 8) {
            let user = {nickname: regNick, password: regPass, avatarUrl: regAvatar}
            if (regPass === regPass2) {
                fetch("/registration", {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify(user)
                })
            }
            else {
                onError("Пароли не совпадают");
            }

        }
        else {
            onError("Минимальная длина пароля - 8 символов");
        }

    }
    else {
        onError("Минимальная длина ника - 4 символа");
    }


}
const loginon = () => {
    let login = document.getElementById('logNick').value;
    let password = document.getElementById('logPass').value;
    if (login != "" && password != "") {
        socket.emit('login', {nickname: login, pass: password})
    } else {
        onError("Вы не ввели данные")
    }
}
const addElements = (data) => {
    let mask = document.getElementById('mask');
    let messageBox = document.createElement('div');
        messageBox.className = 'messageBox';
    let nickBox = document.createElement('div');
        nickBox.className = 'nick';
        nickBox.innerHTML = data.nick;
    let avatarBox = document.createElement('div');
        avatarBox.className = 'avatar';
        $(avatarBox).css({
            background: `url("${data.avatar}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundColor: "rgba(0,0,0,.5)"
        })
    let message = document.createElement('div');
        message.className = 'mess';
        message.innerHTML = data.message;
    let timeBox = document.createElement('div');
        timeBox.className = 'time';
    let date = new Date();
        timeBox.innerHTML = date.getHours() +":"+ date.getMinutes();

    messageBox.appendChild(nickBox);
    messageBox.appendChild(avatarBox);
    messageBox.appendChild(message);
    messageBox.appendChild(timeBox);
    mask.appendChild(messageBox);
}


const sendMessage = () => {
    let inWrite = document.getElementById('inWrite');

    let text = inWrite.value;
    if (text != "") {
        socket.emit('newMessage', {message: text, nick: nickname, avatar: avatar});
    }
}
socket.on('FailedAuth', (data) => {
    console.log("err");
    onError(data.error);
})
socket.on('Authed', (data) => {
    console.log("AUTHED");
    if (data.isAuth) {

        nickname = data.nickname;
        $('.box').css({display: "block"});
        $('.logoBox, .regBox, .overlay').animate({opacity: "0"}, 300)
        $('.box').animate({opacity: "1"}, 300);
        setTimeout(() => {
            $('.overlay').css({display: "none"});
        }, 1000);
        avatar = data.avatar;

    } else {
        onError("Пожалуйста, проверьте введенные данные");
    }
})
socket.on('connect', () => {
    console.log("You are connected");
})
socket.on('disconnect', () => {
    console.log("You are disconnected");
})
socket.on('message', (data) => {
    addElements(data);
})
let box = document.getElementById('box')
document.onkeyup = () => {
    if (event.key == "Enter") {
        sendMessage();
    }
}
