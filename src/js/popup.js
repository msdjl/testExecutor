$(function () {
	$('#logout').click(function () {
		backgroundMethod('logout', null, function () {
			showPage('.loginForm');
		});
	});

	$('#loginButton').click(login);
	$('#password, #username').keypress(login);

	$('#drawbuttons, #changecontext').click(applyContext);
	$('#context').keypress(applyContext);

	$('#sendtojira').click(function () {
		backgroundMethod('generateReport');
	});

	backgroundMethod('isAuthorized', null, function (resp) {
		(resp.status != 200) ? showPage('.loginForm') : contentMethod('getPageInfo', null, function (pageInfo) {
			showPage(pageInfo.issueKey ? '.statusForm' : '.mainForm');
		});
	});
});

function login (e) {
	if ( e.type == 'click' || (e.type == 'keypress' && e.which == 13) ) {
		var password = $('#password'),
			credential = {
				username: $('#username').val(),
				password: password.val()
			};
		backgroundMethod('login', credential, function (resp) {
			(resp.status == 200) && showPage('.mainForm');
			password.val('');
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
			contentMethod('setContext', {issueKey: newContextVal}, function () {
				showPage('.statusForm');
			});
		} else if (changeContext) {
			contextEl.val('');
			contentMethod('setContext', null);
			showPage('.mainForm');
		}
	}
}