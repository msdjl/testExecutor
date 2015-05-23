function isAuthorized (params, cb) {
	requestToService('/isAuthorized', 'GET', null, cb);
}

function login (params, cb) {
	requestToService('/login', 'POST', { username: params.username, password: params.password }, cb);
}

function logout (params, cb) {
	requestToService('/logout', 'POST', null, cb);
}

function sendResultsToJira (params, cb) {
	requestToService('/generatereport', 'POST', params, cb);
}

function getTests (params, cb) {
	var url = '/gettests?' + $.param({
			pageId: params.pageId,
			pageVersion: params.pageVersion,
			issueKey: params.issueKey
		});
	requestToService(url, 'GET', null, cb);
}

function saveTest (data, cb) {
	requestToService('/savetest', 'POST', data, cb);
}

function requestToService (url, type, data, cb) {
	var baseUrl = 'https://msdjl.ru';
	$.ajax({
		type: type,
		url: baseUrl + url,
		data: data,
		complete: cb,
		dataType: 'json',
		xhrFields: {
			withCredentials: true
		}
	});
}