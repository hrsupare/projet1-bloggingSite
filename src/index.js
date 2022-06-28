const express = require('express');
const bodyParser = require('body-parser');
const route = require('./routes/route.js');
const { default: mongoose } = require('mongoose');
const app = express();

app.use(bodyParser.json());

mongoose.connect("mongodb+srv://hsupare:2kZE1zdHBT5kzVVm@cluster0.5drhi.mongodb.net/himanshu-DB", {
    useNewUrlParser: true
})
.then( () => console.log("Hey...MongoDb is connected"))
.catch ( err => console.log(err) )
 
app.use('/', route);

app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});