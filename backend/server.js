const app = require('./src/app')
const connectToDB = require('./src/db/db')


connectToDB();





const PORT = process.env.PORT || 3000;

app.listen(PORT, (err) => {
    if (err) {
        return console.log('Server connection error', err);
    }
    console.log(`Server is running on port ${PORT}`);
});
