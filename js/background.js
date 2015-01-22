$(function () {
	$('#logout').click(logout);

	$('#loginButton').click(login);
	$('#password, #username').keypress(login);

	$('#drawbuttons').click(function () {
		if ($('#context').val()) {
			sendMessage({method: 'drawButtons'});
			showPage('.statusForm');
		}
	});

	$('#changecontext').click(function () {
		$('#context').val('');
		showPage('.mainForm');
	});

	isAuthorized(function(authorized) {
		if (!authorized) {
			showPage('.loginForm');
		}
		else {
			if (false) {
				showPage('.statusForm');
			}
			else {
				showPage('.mainForm');
			}
		}
	});
});

function showPage(page) {
	$('.loginForm').hide();
	$('.mainForm').hide();
	$('.statusForm').hide();
	$(page).show();
}

function isAuthorized (cb) {
	requestToService('/isAuthorized', 'GET', null, cb);
}

function login (e) {
	if ( e.type == 'click' || (e.type == 'keypress' && e.which == 13) ) {
		var u = $('#username').val();
		var p = $('#password').val();
		requestToService('/login', 'POST', {username: u, password: p}, function (ok) {
			$('#password').val('');
			if (ok) {
				showPage('.mainForm');
			}
		});
	}
}

function logout () {
	requestToService('/logout', 'POST', null, function () {
		showPage('.loginForm');
	});
}

function requestToService (url, type, data, cb) {
	var baseUrl = 'https://msdjl.ru';
	$('#overlap').show();
	$.ajax({
		type: type,
		url: baseUrl + url,
		data: data,
		complete: function (resp) {
			$('#overlap').hide();
			cb(resp.status == 200);
		},
		dataType: 'json',
		xhrFields: {
			withCredentials: true
		}
	});
}

function sendMessage (data, cb) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, data, cb);
	});
}