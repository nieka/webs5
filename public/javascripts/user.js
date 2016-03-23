/**
 * Created by niek on 21-3-2016.
 */
var userListData;
var selectedUser;
var socket = io.connect();

$(document).ready(loadUsers);
$(document).on('click','#delete',deleteUser);
$(document).on('click','#showdetial',showDetails);
$(document).on('click','#submitUser',addUser);
$(document).on('click','#edit',editUser);
$(document).on('click','#editUser',saveEditUser);

function loadUsers(){
    console.log("load users");
    // jQuery AJAX call for JSON
    $.getJSON( '/users', function( data ) {

        $("#userlistTbody").empty();
        // For each item in our JSON, add a roomtable row and cells to the content string
        userListData = data;
        var tableContent = "";
        $.each(data, function(){
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
    });
}

function showDetails(){
    var id = $(this).attr('rel');

    // Get Index of object based on id value
    var arrayPosition = userListData.map(function (arrayItem) {
        return arrayItem._id;
    }).indexOf(id);

    // Get our User Object
    var thisUserObject = userListData[arrayPosition];
    selectedUser = thisUserObject;
    //Populate Info Box
    $('#userInfoName').text(thisUserObject.fullname);
    $('#userInfoWoonplaats').text(thisUserObject.woonplaats);
    $('#userInfoEmail').text(thisUserObject.email);
}

function addUser(){
    // If it is, compile all user info into one object
    var newUser = {
        "firstname": $("#inputFirstname").val(),
        "lastname": $("#inputLastname").val(),
        "woonplaats" : $("#inputWoonplaats").val(),
        "email" : $("#inputEmail").val()
    };

    // Use AJAX to post the object to our adduser service
    $.ajax({
        type: 'POST',
        data: newUser,
        url: '/users',
        dataType: 'JSON'
    }).done(function( response ) {

        $("#inputFirstname").val("");
        $("#inputLastname").val("");
        $("#inputWoonplaats").val("");
        $("#inputEmail").val("");
        loadUsers();
    });
}

function editUser(){
    var id = $(this).attr('rel');

    // Get Index of object based on id value
    var arrayPosition = userListData.map(function (arrayItem) {
        return arrayItem._id;
    }).indexOf(id);

    // Get our User Object
    var user = userListData[arrayPosition];
    selectedUser = user;
    $("#inputeditFirstname").val(user.firstname);
    $("#inputeditLastname").val(user.lastname);
    $("#inputeditWoonplaats").val(user.woonplaats);
    $("#inputeditEmail").val(user.email);
}

function saveEditUser(){
    // If it is, compile all user info into one object
    var newUser = {
        "firstname": $("#inputeditFirstname").val(),
        "lastname": $("#inputeditLastname").val(),
        "woonplaats" : $("#inputeditWoonplaats").val(),
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