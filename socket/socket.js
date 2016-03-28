var io;

function init(){
    io.sockets.on('connection', function(socket){
        console.log('a user connected');
    });
}

function sendmsg(naam, msg){
    if(io){
        io.emit(naam, { message: msg });
    }
}

module.exports = function(http){
    console.log("socket.js file aangeroepen");
    if(!io && http ){
        console.log("create socket");
        io =  require('socket.io').listen(http);
        init();
    }

    /*Geef methodes terug die later gebruikt kunnen worden omdat io na app.js en routes word aangemaakt en io
     * dus nog niet bestaat. Daarom kan je io ook alleen gebruiken in callbacks en bijvoorbeeld niet onconnect gebruiken
     * in app.js maar zoals hier is gedaan in een functie zetten en die aanroepen als io gezet word.*/
    return {
        "sendmsg" : sendmsg
    };
};