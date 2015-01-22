var serviceUrl = 'https://msdjl.ru';
$(function () {
	$('#logout').click(function () {
		$('#overlap').show();
		$.ajax({
			type: 'POST',
			url: serviceUrl + '/logout',
			data: {},
			complete: function (resp) {
				$('#overlap').hide();
				$('.mainForm').hide();
				$('.loginForm').show();
				console.log(resp);
			},
			dataType: 'json',
			xhrFields: {
				withCredentials: true
			}
		});
	});
	$('#drawbuttons').click(function () {
		if ($('#context').val()) {
			sendMessage({method: 'drawButtons'});
			$('.mainForm').hide();
			$('.statusForm').show();
		}
	});
	$('#changecontext').click(function () {
		localStorage.context = '';
		$('#context').val('');
		$('.statusForm').hide();
		$('.mainForm').show();
	});
	$('#loginButton').click(function () {
		var u = $('#username').val();
		var p = $('#password').val();
		$('#overlap').show();
		$.ajax({
			type: 'POST',
			url: serviceUrl + '/login',
			data: {username: u, password: p},
			complete: function (resp) {
				$('#password').val('');
				$('#overlap').hide();
				if (resp.status == 200) {
					$('.loginForm').hide();
					$('.mainForm').show();
					console.log(resp);
				}
			},
			dataType: 'json',
			xhrFields: {
				withCredentials: true
			}
		});
	});
	$('#password, #username').keypress(function (e) {
		if (e.which == 13) {
			$('#loginButton').click();
		}
	});
	isAuthorized(function(authorized) {
		$('#overlap').hide();
		if (!authorized) {
			$('.loginForm').show();
		}
		else {
			if (localStorage.context) {
				$('.statusForm').show();
			}
			else {
				$('.mainForm').show();
			}
		}
	});
});

function isAuthorized (cb) {
	var authorized;
	$.ajax({
		type: 'GET',
		url: serviceUrl + '/isAuthorized',
		complete: function (resp) {
			authorized = resp.status == 200;
			cb(authorized);
		},
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