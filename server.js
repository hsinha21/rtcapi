const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);


http.listen(3000, () => {
    console.log('Listening on port : 3000');
});

let activeSockets = [];

let adminSocket;

io.on("connection", socket => {

    if (activeSockets.length == 0) adminSocket = socket.id

    const existingSocket = activeSockets.find(
        existingSocket => existingSocket === socket.id
    );

    if (!existingSocket) {
        activeSockets.push(socket.id);

        socket.emit("update-user-list", {
            users: activeSockets.filter(
                existingSocket => existingSocket !== socket.id
            )
        });

        socket.broadcast.emit("update-user-list", {
            users: activeSockets
        });
    }

    socket.on("disconnect", () => {

        console.log(socket.id, ' : has disconnected');


        activeSockets = activeSockets.filter(
            existingSocket => existingSocket !== socket.id
        );
        socket.broadcast.emit("remove-user", {
            socketId: socket.id
        });

        socket.broadcast.emit("update-user-list", {
            users: activeSockets
        });

    });


    socket.on("call-user", (data) => {
        // console.log('call-user : ', data);

        socket.broadcast.emit("call-made", { 
            offer: data.offer,
            from: data.from
        });
    });


    socket.on("make-answer", data => {
        // console.log('make-answer : ', data)
        socket.to(data.to).emit("answer-made", { answer: data.answer });
    });

})