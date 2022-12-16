const mongoose = require('mongoose');
const Document = require('./Document');
const mongoURI = "mongodb://localhost:27017";

mongoose.connect(mongoURI)
    .then(() => console.log('db Connected!'))
    .catch((error) => console.error("db connection failed", error))


const httpServer = require('http').createServer();

const { Server } = require("socket.io");

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    // ...
    console.log('socket connection successful');

    socket.on('get-document', async (documentId) => {
        const document = await findOrCreateDocument(documentId);
        // console.log(document);

        socket.join(documentId);
        socket.emit('load-document', document.data);

        socket.on('send-changes', delta => {
            // console.log(delta);
            socket.broadcast.to(documentId).emit('receive-changes', delta)
        })

        socket.on('save-document', async (data) => {
            // console.log(data);
            await Document.findByIdAndUpdate(documentId, { data })
        })
    })



});

httpServer.listen(3001), () => console.log('listening to port 3001');

const defaultValue = "";
async function findOrCreateDocument(id) {
    if (id == null) {return}

    const document = await Document.findById(id);
    if (document) {
        return document
    }
    else {
        return await Document.create({ _id: id, data: defaultValue });
    }

    
}
