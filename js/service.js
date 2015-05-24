function isAuthorized (params, cb) {
	requestToService('/rest/auth/1/session', 'GET', null, cb);
}

function login (params, cb) {
	requestToService('/rest/auth/1/session', 'POST', JSON.stringify(params), cb);
}

function logout (params, cb) {
	requestToService('/rest/auth/1/session', 'DELETE', null, cb);
}

function sendResultsToJira (params, cb) {
	requestToService('/rest/api/2/issue/' + params.issueKey + '/comment', 'POST', JSON.stringify({body: params.comment}), function () {
		var formData = new FormData();
		var blob = b64toBlob(params.img);
		formData.append('file', blob, params.issueKey + '_' + params.pageId + '_' + params.pageVersion + '.png');
		requestToService('/rest/api/2/issue/' + params.issueKey + '/attachments', 'POST', formData, cb, true);
	});
}

function requestToService (url, type, data, cb, isFile) {
	var baseUrl = 'https://jira.returnonintelligence.com';
	$.ajax({
		headers: {
			'X-Atlassian-Token': 'nocheck'
		},
		type: type,
		url: baseUrl + url,
		data: data,
		complete: cb,
		dataType: 'json',
		contentType: isFile ? false : 'application/json',
		processData: false,
		xhrFields: {
			withCredentials: true
		}
	});
}

function b64toBlob(b64Data, contentType, sliceSize) {
	contentType = contentType || '';
	sliceSize = sliceSize || 512;
	var byteCharacters = atob(b64Data);
	var byteArrays = [];
	for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
		var slice = byteCharacters.slice(offset, offset + sliceSize);
		var byteNumbers = new Array(slice.length);
		for (var i = 0; i < slice.length; i++) {
			byteNumbers[i] = slice.charCodeAt(i);
		}
		var byteArray = new Uint8Array(byteNumbers);
		byteArrays.push(byteArray);
	}
	return new Blob(byteArrays, {type: contentType});
}