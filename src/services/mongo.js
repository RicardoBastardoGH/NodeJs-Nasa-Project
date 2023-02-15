const mongoose = require('mongoose');

const MONGO_URL = "mongodb+srv://nasa-user:liza123@cluster0.yijzr.mongodb.net/nasa?retryWrites=true&w=majority"

mongoose.connection.once('open', () => {
    console.log('MongoDB connection ready!');
})

mongoose.connection.on('error', (error) => {
    console.error(error)
})

async function mongoConnect() {
    await mongoose.connect(MONGO_URL
        //     , {
        //     useNewUrlParser: true, 
        //     useFindAndModify: false,
        //     useCreateIndex: true,
        //     useUnifiedTopology: true, 
        //     serverApi: ServerApiVersion.v1,
        //     strictQuery: true
        // }
        )
} 

async function mongoDisconnect() {
    await mongoose.disconnect();
}

module.exports = {
    mongoConnect,
    mongoDisconnect
}