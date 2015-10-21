/**
 * Created by enahum on 10/15/15.
 */
var db = require('./models');

db.models.Client.remove({}).exec();
db.models.User.remove({}).exec();

var cl = new db.models.Client({
    name: 'zbox test',
    clientId: 'abc123',
    clientSecret: 'zboxSecret'
});

cl.save(function(err, client) {
    console.log(client);
});

var u = new db.models.User({
    email: 'elias@zboxapp.com',
    password: 'zboxadmin',
    firstname: 'Elias',
    lastname: 'Nahum',
    team: 'zbox'
});

u.save(function(err, user){
   console.log(user);
});

setTimeout(function () {
    db.mongoose.disconnect();
    process.exit(0);
}, 3000);