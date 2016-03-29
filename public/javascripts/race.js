/**
 * Created by niek on 23-3-2016.
 */
var selectedRace;
var socket = io.connect();

$(document).ready(setRace);
$(document).on('click','#delete',deleteRace);
$(document).on('click','#addRace',addRace);
$(document).on('click','#edit',editRace);
$(document).on('click','#EditRace',saveEditRace);

function setRace(){
    $("#racelistTbody").empty();
    var tableContent = "";
    $.each(races, function(){
        tableContent += '<tr>';
        tableContent += '<td>' + this.naam + '</td>';
        tableContent += '<td>' + this.plaats + '</td>';
        tableContent += '<td>' + this.status + '</td>';
        tableContent += '<td>' +
            '<a href="/races/' + this._id + ' "><span id="showDetail" class="glyphicon glyphicon-eye-open" rel="' + this._id + '"></span></a> ' +
            '<span id="edit" class="glyphicon glyphicon-pencil" rel="' + this._id + '"></span> ' +
            '<span id="delete" class="glyphicon glyphicon-trash" rel="' + this._id + '"></span>' +
            '</td>';
        tableContent += '</tr>';
    });

    // Inject the whole content string into our existing HTML roomtable
    $('#racelist tbody').append(tableContent);
}

function loadRaces(){
    console.log("load races");
    // jQuery AJAX call for JSON
    $.getJSON( '/races', function( data ) {
        // For each item in our JSON, add a roomtable row and cells to the content string
        races = data;
        setRace();
    });
}

function addRace(event){
    event.preventDefault();
    var newRace = {
        "naam": $("#inputNaam").val(),
        "plaats": $("#inputPlaats").val(),
        "status" : "Niet Gestart"
    };

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            var i;
            var xmlDoc = xhttp.responseXML;
            newRace.lat = xmlDoc.getElementsByTagName("place")[0].getAttribute("lat");
            newRace.lon = xmlDoc.getElementsByTagName("place")[0].getAttribute("lon");
            $.ajax({
                type: 'POST',
                data: newRace,
                url: '/races/',
                dataType: 'JSON'
            }).done(function( response ) {
                $("#inputNaam").val("");
                $("#inputPlaats").val("");
                loadRaces();
            });
        }
    };
    xhttp.open("GET", "https://nominatim.openstreetmap.org/search?q="+ newRace.plaats +"&format=xml&polygon=1&addressdetails=1", true);
    xhttp.send();
}

function editRace(){
    var id = $(this).attr('rel');

    // Get Index of object based on id value
    var arrayPosition = races.map(function (arrayItem) {
        return arrayItem._id;
    }).indexOf(id);

    // Get our User Object
    selectedRace = races[arrayPosition];
    $("#inputeditNaam").val(selectedRace.naam);
    $("#inputeditPlaats").val(selectedRace.plaats);
    var statusOptions = "";
    if(selectedRace.status === "Niet Gestart"){
        statusOptions += '<option value="Niet Gestart">Niet gestart</option>';
        statusOptions += '<option value="gestart">Start</option>';
    } else {
        statusOptions += '<option value="gestart">Start</option>';
        statusOptions += '<option value="gestopt">stop</option>'
    }
    $("#raceStatus").empty().append(statusOptions);
}

function saveEditRace(event){
    event.preventDefault();
    // If it is, compile all user info into one object
    var editRace = {
        "naam": $("#inputeditNaam").val(),
        "plaats": $("#inputeditPlaats").val(),
        "status" : $('#raceStatus').find(":selected").val()
    };

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            var i;
            var xmlDoc = xhttp.responseXML;
            editRace.lat = xmlDoc.getElementsByTagName("place")[0].getAttribute("lat");
            editRace.lon = xmlDoc.getElementsByTagName("place")[0].getAttribute("lon");
            $.ajax({
                type: 'PUT',
                data: editRace,
                url: '/races/' + selectedRace._id,
                dataType: 'JSON'
            }).done(function( response ) {
                $("#inputeditNaam").val("");
                $("#inputeditPlaats").val("");
                loadRaces();
            });
        }
    };
    xhttp.open("GET", "https://nominatim.openstreetmap.org/search?q="+ editRace.plaats +"&format=xml&polygon=1&addressdetails=1", true);
    xhttp.send();
}

function deleteRace(){
    var id = $(this).attr('rel');
// Pop up a confirmation dialog
    var confirmation = confirm('Are you sure you want to delete this race?');

    // Check and make sure the user confirmed
    if (confirmation === true) {

        // If they did, do our delete
        $.ajax({
            type: 'DELETE',
            url: '/races/' + id
        }).done(function( response ) {
            console.log("done");
            // Update the roomtable
            loadRaces();
        });
    }
    else {
        // If they said no to the confirm, do nothing
        return false;
    }
}


/*socket methodes*/
socket.on('raceUpdate', function(msg){
    console.log("raceUpdate socket");
    loadRaces();
});
