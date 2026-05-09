const app = require('./src/app')
const connectToDB = require('./src/db/db')


connectToDB();





app.listen(3000,(err)=>{
    if(err){
        return console.log('Server connection error');
        }
    console.log('Server is running on http://localhost:3000')
    
})
