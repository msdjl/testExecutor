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
	var blob = b64toBlob(params.img),
		formData = new FormData(),
		commonURL = '/rest/api/2/issue/' + params.issueKey,
		comment = JSON.stringify({body: params.comment}),
		imgName = params.issueKey + '_' + params.pageId + '_' + params.pageVersion + '.png';
	formData.append('file', blob, imgName);
	requestToService(commonURL + '/comment', 'POST', comment, function () {
		requestToService(commonURL + '/attachments', 'POST', formData, cb, true);
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
	var byteCharacters = atob(b64Data),
		byteArrays = [];
	sliceSize = sliceSize || 512;
	for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
		var slice = byteCharacters.slice(offset, offset + sliceSize),
			byteNumbers = new Array(slice.length);
		for (var i = 0; i < slice.length; i++) {
			byteNumbers[i] = slice.charCodeAt(i);
		}
		byteArrays.push(new Uint8Array(byteNumbers));
	}
	return new Blob(byteArrays, {type: contentType || ''});
}