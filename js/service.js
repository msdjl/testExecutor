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
	$('#sendtojira').prop('disabled', true);
	contentMethod('getPageInfo', null, function (pageInfo) {
		var pageUrl = 'https://wiki.returnonintelligence.com/pages/viewpage.action?pageId=' + pageInfo.pageId;
		var comment = 'Tested on version ' + pageInfo.pageVersion;
		comment += ' of the [checklist|' + pageUrl + ']';
		comment += '\n\nAmount of tests: ' + pageInfo.amountOfTests;
		comment += '\nPassed: ' + pageInfo.passed;
		comment += '\nFailed: ' + pageInfo.failed;
		comment += '\nNot checked: ' + pageInfo.notCheckedYet;
		var data = {pageId: pageInfo.pageId,
			pageVersion: pageInfo.pageVersion,
			issueKey: pageInfo.issueKey,
			comment: comment
		};
		requestToService('/testcomment', 'POST', data, function () {
			$('#sendtojira').prop('disabled', false);
		});
	});
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