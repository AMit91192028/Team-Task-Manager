require('dotenv').config();
const app = require('./src/app')
const connectToDB = require('./src/db/db')


connectToDB();





const PORT =3000;

app.listen(PORT, (err) => {
    if (err) {
        return console.log('Server connection error', err);
    }
    console.log(`Server is running on port ${PORT}`);
});
