const mongoose = require('mongoose');

const connect = async() => {
    try {
        mongoose.connect('mongodb+srv://admin1820:admin1820@cluster0.1zqv5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        });

        console.log('MongoDB connected...');
    } catch (error) {
        console.log(error);
        process.exit();
    }
}
module.exports = { connect }