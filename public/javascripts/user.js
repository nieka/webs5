/**
 * Created by niek on 21-3-2016.
 */
var selectedUser;
var socket = io.connect();

$(document).ready(setUsers);
$(document).on('click','#delete',deleteUser);
$(document).on('click','#showdetial',showDetails);
$(document).on('click','#edit',editUser);
$(document).on('click','#editUser',saveEditUser);

function setUsers(){
    console.log("set users");
    $("#userlistTbody").empty();
    var tableContent = "";
    $.each(users, function(){
        tableContent += '<tr>';
        tableContent += '<td><a href="#" id="showdetial" rel="' + this._id + '">' + this.fullname + '</a></td>';
        tableContent += '<td>' +
            '<span id="edit" class="glyphicon glyphicon-pencil" rel="' + this._id + '"></span> ' +
            '<span id="delete" class="glyphicon glyphicon-trash" rel="' + this._id + '"></span>' +
            '</td>';
        tableContent += '</tr>';
    });

    // Inject the whole content string into our existing HTML roomtable
    $('#userslist tbody').append(tableContent);
}

function loadUsers(){

    console.log("load users");
    // jQuery AJAX call for JSON
    $.getJSON( '/users', function( data ) {
        // For each item in our JSON, add a roomtable row and cells to the content string
        users = data;
        setUsers();
    });
}

function showDetails(){
    var id = $(this).attr('rel');

    // Get Index of object based on id value
    var arrayPosition = users.map(function (arrayItem) {
        return arrayItem._id;
    }).indexOf(id);

    // Get our User Object
    var thisUserObject = users[arrayPosition];
    selectedUser = thisUserObject;
    //Populate Info Box
    $('#userInfoName').text(thisUserObject.fullname);
    $('#userInfoEmail').text(thisUserObject.local.email);
}

function editUser(){
    var id = $(this).attr('rel');

    // Get Index of object based on id value
    var arrayPosition = users.map(function (arrayItem) {
        return arrayItem._id;
    }).indexOf(id);

    // Get our User Object
    var user = users[arrayPosition];
    selectedUser = user;
    $("#inputeditFirstname").val(user.local.voornaam);
    $("#inputeditLastname").val(user.local.achternaam);
    $("#inputeditEmail").val(user.local.email);
}

function saveEditUser(event){
    event.preventDefault();
    // If it is, compile all user info into one object
    var newUser = {
        "voornaam": $("#inputeditFirstname").val(),
        "achternaam": $("#inputeditLastname").val(),
        "email" : $("#inputeditEmail").val()
    };

    // Use AJAX to post the object to our adduser service
    $.ajax({
        type: 'PUT',
        data: newUser,
        url: '/users/' + selectedUser._id,
        dataType: 'JSON'
    }).done(function( response ) {
        $("#inputeditFirstname").val("");
        $("#inputeditLastname").val("");
        $("#inputeditWoonplaats").val("");
        $("#inputeditEmail").val("");
        console.log("user edited");
        loadUsers();
    });
}

function deleteUser(){
    var id = $(this).attr('rel');
    console.log("userid= " + id);
// Pop up a confirmation dialog
    var confirmation = confirm('Are you sure you want to delete this user?');

    // Check and make sure the user confirmed
    if (confirmation === true) {

        // If they did, do our delete
        $.ajax({
            type: 'DELETE',
            url: '/users/' + id
        }).done(function( response ) {
            console.log("done");
            // Update the roomtable
            loadUsers();
        });
    }
    else {
        // If they said no to the confirm, do nothing
        return false;
    }
}

/*socket methodes*/
socket.on('userUpdate', function(msg){
    console.log("userUpdate socket");
    loadUsers();
});