function isAuthorized (cb) {
	requestToService('/isAuthorized', 'GET', null, cb);
}

function login (e) {
	if ( e.type == 'click' || (e.type == 'keypress' && e.which == 13) ) {
		var u = $('#username').val();
		var p = $('#password').val();
		requestToService('/login', 'POST', { username: u, password: p }, function (resp) {
			$('#password').val('');
			if (resp.status == 200) {
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

function sendResultsToJira () {
	//requestToService
}

function getTests (pageId, pageVersion, issueKey, cb) {
	var url = '/gettests?' + $.param({
			pageId: pageId,
			pageVersion: pageVersion,
			issueKey: issueKey
		});
	requestToService(url, 'GET', null, cb);
}

function saveTest (data, cb) {
	requestToService('/savetest', 'POST', data, cb);
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
			cb(resp);
		},
		dataType: 'json',
		xhrFields: {
			withCredentials: true
		}
	});
}