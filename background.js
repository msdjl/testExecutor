var currentContext = {};
var serviceUrl = 'http://127.0.0.1:8080';
document.addEventListener('DOMContentLoaded', function () {
	document.querySelector('#drawbuttons').addEventListener('click', function () {
		sendMessage({msg: 'drawButtons'}, function (data) {
			currentContext = data;
			currentContext.issue = $('#context').attr('value');
		});
	});
	document.querySelector('#loginButton').addEventListener('click', function () {
		var u = document.querySelector('#username').value;
		var p = document.querySelector('#password').value;
		var url = serviceUrl + '/login';
		var xhr = new XMLHttpRequest();
		xhr.open("POST", url, true);
		xhr.withCredentials = true;
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				var resp = xhr.responseText;
				console.log(resp);
				//setCookie('connect.sid', resp)
				sendMessage({msg: 'testService', response: resp});
			}
		}
		xhr.send(JSON.stringify({username: u, password: p}));
	});
	document.querySelector('#testService').addEventListener('click', function () {
		isAuthorized(function (xhr) {
			var resp = xhr.responseText;
			sendMessage({msg: 'testService', response: resp});
		});
	});
	$('#context').on('input', function () {
		localStorage.context = $('#context').val();
	});
	$('#context').val(localStorage.context);
	isAuthorized(function(xhr) {
		if (xhr.status == 401) {
			$('.loginForm').show();
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