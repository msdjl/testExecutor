var currentContext = {};
var serviceUrl = 'https://msdjl.ru';
document.addEventListener('DOMContentLoaded', function () {
	document.querySelector('#logout').addEventListener('click', function () {
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
				sendMessage({msg: 'testService', response: resp});
			},
			dataType: 'json',
			xhrFields: {
				withCredentials: true
			}
		});
	});
	document.querySelector('#drawbuttons').addEventListener('click', function () {
		sendMessage({msg: 'drawButtons'}, function (data) {
			currentContext = data;
			currentContext.issue = $('#context').attr('value');
		});
		$('.mainForm').hide();
		$('.statusForm').show();
	});
	document.querySelector('#changecontext').addEventListener('click', function () {
		localStorage.context = '';
		$('.statusForm').hide();
		$('.mainForm').show();
	});
	document.querySelector('#loginButton').addEventListener('click', function () {
		var u = document.querySelector('#username').value;
		var p = document.querySelector('#password').value;
		$('#overlap').show();
		$.ajax({
			type: 'POST',
			url: serviceUrl + '/login',
			data: {username: u, password: p},
			complete: function (resp) {
				$('#overlap').hide();
				$('.loginForm').hide();
				$('.mainForm').show();
				console.log(resp);
				sendMessage({msg: 'testService', response: resp});
			},
			dataType: 'json',
			xhrFields: {
				withCredentials: true
			}
		});
	});
	$('#context').on('input', function () {
		localStorage.context = $('#context').val();
	});
	$('#context').val(localStorage.context);
	isAuthorized(function(xhr) {
		$('#overlap').hide();
		if (xhr.status == 401) {
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
	var url = serviceUrl + '/isAuthorized';
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.withCredentials = true;
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			cb(xhr);
		}
	};
	xhr.send();
}

function sendMessage (data, cb) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, data, cb);
	});
}