$(function () {
	$('#logout').click(logout);

	$('#loginButton').click(login);
	$('#password, #username').keypress(login);

	$('#drawbuttons, #changecontext').click(applyContext);
	$('#context').keypress(applyContext);

	$('#sendtojira').click(sendResultsToJira);

	isAuthorized(function(resp) {
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
	});
});

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
		});
	}
}

function applyContext (e) {
	if ( e.type == 'click' || (e.type == 'keypress' && e.which == 13) ) {
		var changeContext = e.target.id == 'changecontext';
		var contextEl = $('#context');
		var newContextVal = contextEl.val();
		if (!changeContext && newContextVal) {
			contentMethod('getPageInfo', null, function (pageInfo) {
				getTests(pageInfo.pageId, pageInfo.pageVersion, newContextVal, function (resp) {
					var tests = resp.responseJSON;
					contentMethod('setContext', {issueKey: newContextVal, tests: tests}, function () {
						showPage('.statusForm');
					});
				})
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
	sendMessage({ method: method, params: params }, cb);
}

function sendMessage (data, cb) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, data, cb);
	});
}