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
			var comment = 'Tested on version ' + pageInfo.pageVersion
				+ ' of the [checklist|' + pageUrl + ']'
				+ '\n\nAmount of tests: ' + pageInfo.amountOfTests
				+ '\nPassed: ' + pageInfo.passed
				+ '\nFailed: ' + pageInfo.failed
				+ '\nNot checked: ' + pageInfo.notCheckedYet;
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
				showPage(pageInfo.issueKey ? '.statusForm' : '.mainForm');
			});
		}
		$('#overlap').hide();
	});
});

function login (e) {
	if ( e.type == 'click' || (e.type == 'keypress' && e.which == 13) ) {
			var password = $('#password'),
			credential = {
				username: $('#username').val(),
				password: password.val()
			};
		$('#overlap').show();
		backgroundMethod('login', credential, function (resp) {
			(resp.status == 200) && showPage('.mainForm');
			password.val('');
			$('#overlap').hide();
		});
	}
}

function showPage(page) {
	$('.loginForm, .mainForm, .statusForm').hide();
	$(page).show();
	switch (page) {
		case '.statusForm': contentMethod('getPageInfo', null, updateStatusPage); break;
		case '.mainForm': $('#context').focus(); break;
		case '.loginForm': $('#username').focus(); break;
	}
}

function updateStatusPage (pageInfo) {
	$('#sfIssueId').text(pageInfo.issueKey);
	$('#sfPageVersion').text(pageInfo.pageVersion);
	$('#sfPageId').text(pageInfo.pageId);
	$('#sfAmountOfTests').text(pageInfo.amountOfTests);
	$('#sfPassed').text(pageInfo.passed);
	$('#sfFailed').text(pageInfo.failed);
	$('#sfNotCheckedYet').text(pageInfo.notCheckedYet);
}

function applyContext (e) {
	if ( e.type == 'click' || (e.type == 'keypress' && e.which == 13) ) {
		var changeContext = e.target.id == 'changecontext',
			contextEl = $('#context'),
			newContextVal = contextEl.val();
		if (!changeContext && newContextVal) {
			contentMethod('getPageInfo', null, function (pageInfo) {
				pageInfo.issueKey = newContextVal;
				backgroundMethod('getTests', pageInfo, function (tests) {
					contentMethod('setContext', {issueKey: newContextVal, tests: tests}, function () {
						showPage('.statusForm');
					});
				});
			});
		} else if (changeContext) {
			contextEl.val('');
			contentMethod('setContext', null);
			showPage('.mainForm');
		}
	}
}