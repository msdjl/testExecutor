$(function () {
	$('#logout').click(function () {
		$('#overlap').show();
		backgroundMethod('logout', null, function () {
			showPage('.loginForm');
			$('#overlap').hide();
		});
	});

	$('#loginButton').click(login);
	$('#password, #username').keypress(login);

	$('#drawbuttons, #changecontext').click(applyContext);
	$('#context').keypress(applyContext);

	$('#sendtojira').click(function () {
		$('#overlap').show();
		contentMethod('getPageInfo', null, function (pageInfo) {
			var pageUrl = 'https://wiki.returnonintelligence.com/pages/viewpage.action?pageId=' + pageInfo.pageId;
			var comment = 'Tested on version ' + pageInfo.pageVersion;
			comment += ' of the [checklist|' + pageUrl + ']';
			comment += '\n\nAmount of tests: ' + pageInfo.amountOfTests;
			comment += '\nPassed: ' + pageInfo.passed;
			comment += '\nFailed: ' + pageInfo.failed;
			comment += '\nNot checked: ' + pageInfo.notCheckedYet;
			var data = {
				pageId: pageInfo.pageId,
				pageVersion: pageInfo.pageVersion,
				issueKey: pageInfo.issueKey,
				comment: comment
			};
			backgroundMethod('screenshot', data, function () {
				$('#overlap').hide();
			});
		});
	});

	backgroundMethod('isAuthorized', null, function (resp) {
		if (resp.status != 200) {
			showPage('.loginForm');
		}
		else {
			contentMethod('getPageInfo', null, function (pageInfo) {
				if (pageInfo.issueKey) {
					showPage('.statusForm');
				}
				else {
					showPage('.mainForm');
				}
			});
		}
		$('#overlap').hide();
	});
});

function login (e) {
	if ( e.type == 'click' || (e.type == 'keypress' && e.which == 13) ) {
		$('#overlap').show();
		var u = $('#username').val();
		var p = $('#password').val();
		backgroundMethod('login', { username: u, password: p }, function (resp) {
			$('#password').val('');
			if (resp.status == 200) {
				showPage('.mainForm');
			}
			$('#overlap').hide();
		});
	}
}

function showPage(page) {
	$('.loginForm, .mainForm, .statusForm').hide();
	$(page).show();
	if (page == '.statusForm') {
		contentMethod('getPageInfo', null, function (pageInfo) {
			$('#sfIssueId').text(pageInfo.issueKey);
			$('#sfPageVersion').text(pageInfo.pageVersion);
			$('#sfPageId').text(pageInfo.pageId);
			$('#sfAmountOfTests').text(pageInfo.amountOfTests);
			$('#sfPassed').text(pageInfo.passed);
			$('#sfFailed').text(pageInfo.failed);
			$('#sfNotCheckedYet').text(pageInfo.notCheckedYet);
		});
	}
	if (page == '.mainForm') {
		$('#context').focus();
	}
	if (page == '.loginForm') {
		$('#username').focus();
	}
}

function applyContext (e) {
	if ( e.type == 'click' || (e.type == 'keypress' && e.which == 13) ) {
		var changeContext = e.target.id == 'changecontext';
		var contextEl = $('#context');
		var newContextVal = contextEl.val();
		if (!changeContext && newContextVal) {
			contentMethod('getPageInfo', null, function (pageInfo) {
				backgroundMethod('getTests', {
					pageId: pageInfo.pageId,
					pageVersion: pageInfo.pageVersion,
					issueKey: newContextVal
				}, function (resp) {
					var tests = resp.responseJSON;
					contentMethod('setContext', {issueKey: newContextVal, tests: tests}, function () {
						showPage('.statusForm');
					});
				});
			});
		}
		else if (changeContext) {
			contextEl.val('');
			contentMethod('setContext', null);
			showPage('.mainForm');
		}
	}
}

function contentMethod (method, params, cb) {
	sendMessageToTab({ method: method, params: params }, cb);
}

function sendMessageToTab (data, cb) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, data, cb);
	});
}

function backgroundMethod (method, params, cb) {
	sendMessageToBackground({ method: method, params: params }, cb);
}

function sendMessageToBackground (data, cb) {
	chrome.runtime.sendMessage(data, cb);
}