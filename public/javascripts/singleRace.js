/**
 * Created by niek on 25-3-2016.
 */
var waypoints;
var users;
var socket = io.connect();

$(document).ready(loadRaceInfo);
$(document).on('click','#deletewp',deleteWayPoint);
$(document).on('click','#deleteUs',deleteUser);
$(document).on('click','#showDetailwp',showWayPoint);
$(document).on('click','#addwp',addWaypoint);
$(document).on('click','#aanmeldenRace',addUser);

//loads race information and waypoints
function loadRaceInfo(){
    $("#raceView").append("<b>Naam</b>: " + race.naam + " <b>Plaats</b>: " + race.plaats + " <b>Status</b>: " + race.status );
    loadWaypoints();
    loadUsers();
    loadCafes();
    if(race.status != "Niet Gestart"){
        $("#addwaypoint").empty();
    }
}

function loadCafes(){
    var pyrmont = new google.maps.LatLng(race.lat, race.lon);

    var map = new google.maps.Map(document.getElementById('map'), {
        center: pyrmont,
        zoom: 15,
        scrollwheel: false
    });

    // Specify location, radius and place types for your Places API search.
    var request = {
        location: pyrmont,
        radius: '5000',
        types: ['cafe']
    };

    // Create the PlaceService and send the request.
    // Handle the callback with an anonymous function.
    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, function(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            var optionsContent= "";
            for (var i = 0; i < results.length; i++) {
                optionsContent += '<option value="' + results[i].place_id +'">' + results[i].name +'</option>';
            }
            $("#kroegen").append(optionsContent);
        }
    });
}

function loadWaypoints(){
    //load wayPoints
    // jQuery AJAX call for JSON
    $.getJSON( '/races/'+ race._id + '/waypoint', function( data ) {

        $("#waypointTbody").empty();
        // For each item in our JSON, add a roomtable row and cells to the content string
        waypoints = data.wayPoints;
        var tableContent = "";
        $.each(waypoints, function(){
            tableContent += '<tr>';
            tableContent += '<td>' + this.naam + '</td>';
            tableContent += '<td><span id="showDetailwp" class="glyphicon glyphicon-eye-open" rel="' + this._id + '"></span>';
            if(race.status != "Gestart"){
                tableContent += '<span id="deletewp" class="glyphicon glyphicon-trash" rel="' + this._id + '"></span>'
            }
            tableContent +='</td>';
            tableContent += '</tr>';
        });

        // Inject the whole content string into our existing HTML roomtable
        $('#waypointlist tbody').append(tableContent);
    });
}

function loadUsers(){
    //load users
    // jQuery AJAX call for JSON
    $.getJSON( '/races/'+ race._id + '/user', function( data ) {

        $("#userlistTbody").empty();
        // For each item in our JSON, add a roomtable row and cells to the content string
        var tableContent = "";
        var islid= false;
        users = data.deelnemers;
        $.each(data.deelnemers, function(){
            tableContent += '<tr>';
            tableContent += '<td>' + this.fullname + '</td>';
            if(race.status != "Gestart"){
                tableContent += '<td><span id="deleteUs" class="glyphicon glyphicon-trash" rel="' + this._id + '"></span></td>'
            }
            tableContent += '</tr>';

            if(this._id === userid){
                islid = true;
            }
        });

        // Inject the whole content string into our existing HTML roomtable
        $('#userlist tbody').append(tableContent);

        if(islid){
            $("#aanmelden").empty();
        }else {
            $("#aanmelden").empty();
            $("#aanmelden").append('<button id="aanmeldenRace">Aanmelden bij race</button>');
        }
    });
}

function showWayPoint(){
    var id = $(this).attr('rel');
    $.getJSON( '/waypoints/'+ id , function( data ) {
        var wp = data[0];
        var kroeg = JSON.parse(data[1]);
        $("#kroegnaam").empty().append("<b>Naam</b>: " + wp.naam);
        //openingstijden tonen
        $("#openingstijdenTbody").empty();
        var openingtijden = "";
        var openstijdenlijst =  kroeg.result.opening_hours.weekday_text
        for(var i=0; i< openstijdenlijst.length; i++){
            openingtijden += "<tr>";
            openingtijden += "<td>" + openstijdenlijst[i] + "</td>";
            openingtijden += "</tr>";
        }
        $("#openingstijdenTbody").append(openingtijden);


        //vul lijst met getagde gebruikers
        $("#lijstgemeldeUsers").empty();
        var userlijst = "";
        $.each(wp.gemeldeUsers, function(){
            userlijst += "<li>" + this.fullname + "</li>";
        });
        $("#lijstgemeldeUsers").append(userlijst);

        console.log(kroeg);
    });
}

function addUser(){
    var user = {
        _id : userid
    };
    $.ajax({
        type: 'POST',
        data: user,
        url: '/races/' + race._id + '/user',
        dataType: 'JSON'
    }).done(function( response ) {
        loadUsers();
    });
}

function addWaypoint(event){
    event.preventDefault();
    var newWp = {
        "place_id": $('#kroegen').find(":selected").val(),
        "naam": $('#kroegen').find(":selected").text()
    };

    var bestaat= false;
    for(var i=0; i< waypoints.length; i++){
        if(waypoints[i].place_id === newWp.place_id){
            bestaat = true;
            break;
        }
    }
    if(bestaat){
        $("#error").append("Kroeg is al onderdeel van de wedstrijd");
    }else {
        $("#error").empty();
        $.ajax({
            type: 'POST',
            data: newWp,
            url: '/races/' + race._id + '/waypoint',
            dataType: 'JSON'
        }).done(function( response ) {
            $("#inputNaam").val("");
            $("#inputPlaats").val("");
            loadWaypoints();
        });
    }

}

function deleteWayPoint(){
    var id = $(this).attr('rel');
// Pop up a confirmation dialog
    var confirmation = confirm('Are you sure you want to delete this wayPoint?');

    // Check and make sure the user confirmed
    if (confirmation === true) {

        // If they did, do our delete
        $.ajax({
            type: 'DELETE',
            url: '/races/' + race._id + '/waypoint/' + id
        }).done(function( response ) {
            console.log("done");
            // Update the roomtable
            loadWaypoints();
        });
    }
    else {
        // If they said no to the confirm, do nothing
        return false;
    }
}
function deleteUser(){
    var id = $(this).attr('rel');
// Pop up a confirmation dialog
    var confirmation = confirm('Are you sure you want to delete this wayPoint?');

    // Check and make sure the user confirmed
    if (confirmation === true) {

        // If they did, do our delete
        $.ajax({
            type: 'DELETE',
            url: '/races/' + race._id + '/user/' + id
        }).done(function( response ) {
            console.log("done");
            // Update the roomtable
            loadWaypoints();
        });
    }
    else {
        // If they said no to the confirm, do nothing
        return false;
    }
}
/*socket methodes*/
socket.on('wpUpdate', function(msg){
    console.log("userUpdate socket");
    if(msg.message === race._id){
        loadWaypoints();
    }
});
socket.on('usUpdate', function(msg){
    console.log("userUpdate socket");
    if(msg.message === race._id){
        loadUsers();
    }
});