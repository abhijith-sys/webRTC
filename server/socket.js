const { Server } = require("socket.io");
let IO;

module.exports.initIO = (httpServer) => {
  IO = new Server(httpServer);

  IO.use((socket, next) => {
    if (socket.handshake.query) {
      let callerId = socket.handshake.query.callerId;
      socket.user = callerId;
      console.log(`User ${socket.user} connected.`);
      next();
    }
  });

  IO.on("connection", (socket) => {
    console.log(`User ${socket.user} connected.`);
    socket.join(socket.user);

    socket.on("call", (data) => {
      let calleeId = data.calleeId;
      let rtcMessage = data.rtcMessage;

      console.log(`User ${socket.user} is calling ${calleeId}`);
      socket.to(calleeId).emit("newCall", {
        callerId: socket.user,
        rtcMessage: rtcMessage,
      });
    });

    socket.on("answerCall", (data) => {
      let callerId = data.callerId;
      rtcMessage = data.rtcMessage;

      console.log(`User ${socket.user} is answering call from ${callerId}`);
      socket.to(callerId).emit("callAnswered", {
        callee: socket.user,
        rtcMessage: rtcMessage,
      });
    });

    socket.on("ICEcandidate", (data) => {
      console.log(`User ${socket.user} sending ICE candidate to ${data.calleeId}`);
      let rtcMessage = data.rtcMessage;

      socket.to(data.calleeId).emit("ICEcandidate", {
        sender: socket.user,
        rtcMessage: rtcMessage,
      });
    });
  });

  console.log("Socket.IO initialized.");
};

module.exports.getIO = () => {
  if (!IO) {
    console.log("Socket.IO not initialized.");
    throw Error("IO not initialized.");
  } else {
    console.log("Socket.IO retrieved.");
    return IO;
  }
};
