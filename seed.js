/**
 * Created by enahum on 10/15/15.
 */
var db = require('./models');

db.models.Client.remove({}).exec();
db.models.ServiceVersion.remove({}).exec();

var cl = new db.models.Client({
    name: 'ZBox Chat',
    clientId: 'YKk-3wF-UDb-3As',
    clientSecret: 'RZqS6sS4Wv3X7Sex',
    isTrusted: true
});

cl.save(function(err, client) {
    console.log(client); // eslint-disable-line no-console
});

var chat = new db.models.ServiceVersion({
    name: 'chatDesktop',
    min: '1.0.1',
    current: '1.0.1',
    link: 'http://www.zboxapp.com/chat'
});

chat.save(function(err, service) {
    console.log(service); // eslint-disable-line no-console
});

setTimeout(function () {
    db.mongoose.disconnect();
    process.exit(0);
}, 3000);