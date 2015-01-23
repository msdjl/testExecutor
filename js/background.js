$(function () {
	$('#logout').click(logout);

	$('#loginButton').click(login);
	$('#password, #username').keypress(login);

	$('#drawbuttons, #changecontext').click(applyContext);
	$('#context').keypress(applyContext);

	$('#sendtojira').click(sendResultsToJira);

	isAuthorized(function(authorized) {
		if (!authorized) {
			showPage('.loginForm');
		}
		else {
			contentMethod('getPageInfo', null, function (pageInfo) {
				if (pageInfo.context) {
					showPage('.statusForm');
				}
				else {
					showPage('.mainForm');
				}
			});
		}
	});
});

function showPage(page) {
	$('.loginForm, .mainForm, .statusForm').hide();
	$(page).show();
	if (page == '.statusForm') {
		contentMethod('getPageInfo', null, function (pageInfo) {
			$('#sfIssueId').text(pageInfo.context);
			$('#sfPageVersion').text(pageInfo.pageVersion);
			$('#sfPageId').text(pageInfo.pageId);
			$('#sfAmountOfTests').text('0');
			$('#sfPassed').text('0');
			$('#sfFailed').text('0');
		});
	}
}

function applyContext (e) {
	if ( e.type == 'click' || (e.type == 'keypress' && e.which == 13) ) {
		var changeContext = e.target.id == 'changecontext';
		var contextEl = $('#context');
		var newContextVal = contextEl.val();
		if (!changeContext && newContextVal) {
			contentMethod('setContext', newContextVal);
			showPage('.statusForm');
		}
		else if (changeContext) {
			contextEl.val('');
			contentMethod('setContext', null);
			showPage('.mainForm');
		}
	}
}

function isAuthorized (cb) {
	requestToService('/isAuthorized', 'GET', null, cb);
}

function login (e) {
	if ( e.type == 'click' || (e.type == 'keypress' && e.which == 13) ) {
		var u = $('#username').val();
		var p = $('#password').val();
		requestToService('/login', 'POST', { username: u, password: p }, function (ok) {
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

function sendResultsToJira () {
	//requestToService
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

function contentMethod (method, params, cb) {
	sendMessage({ method: method, params: params }, cb);
}

function sendMessage (data, cb) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, data, cb);
	});
}