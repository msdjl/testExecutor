chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
	var result;
	if (request.method && !sender.tab) {
		result = window[request.method](request.params);
		if (result) {
			sendResponse(result);
		}
	}
});

function sendMessage (data, cb) {
	chrome.runtime.sendMessage(data, cb);
}

function drawButtons (tests) {
	var pageInfo = getPageInfo(), testsObj = {};
	if (tests) {
		for (var i in tests) {
			testsObj[tests[i].testId] = tests[i].testStatus;
		}
	}
	$.get(chrome.extension.getURL('/html/buttons.html'), function(template) {
		var t = $(template);
		t.find('.btn').click(clickButtonHandler);

		$('tbody tr').find('td:first').each(function (n, el) {
			var data = $.extend( {}, pageInfo, { testId: n, testStatus: testsObj[n] || '' } );
			var container = t.clone(true, true).data(data);
			$(el).append(container);
		});

		updateTrBackground();
	});
}

function removeButtons () {
	$('.testExecutorContainer').remove();
	updateTrBackground();
}

function clickButtonHandler (e) {
	var newStatus,
		buttonEl = $(this),
		testEl = buttonEl.parent(),
		trEl = testEl.parent().parent();

	newStatus = buttonEl.data('newStatus');
	testEl.data('testStatus', newStatus);
	updateTrBackground(trEl);

	testEl.find('.btn').prop('disabled', true);
	saveTest(testEl.data(), function () {
		testEl.find('.btn').prop('disabled', false);
	});
}

function updateTrBackground (tr) {
	var target = tr || $('tbody tr');
	target.removeClass('bg-success bg-danger');
	target.each(function (n, el) {
		var status = $(el).find('.testExecutorContainer').data('testStatus');
		if (status == 'Passed') {
			$(el).addClass('bg-success');
		}
		else if (status == 'Failed') {
			$(el).addClass('bg-danger');
		}
	});
}

function urlParse (url) {
	var i, tmp, arr, obj = {};
	if (url) {
		arr = url.match(/\w+=\d+/g);
		for (i in arr) {
			tmp = arr[i].split('=');
			if (obj[tmp[0]]) {
				if (!Array.isArray(obj[tmp[0]])) {
					obj[tmp[0]] = [obj[tmp[0]]];
				}
				obj[tmp[0]].push(tmp[1]);
			}
			else {
				obj[tmp[0]] = tmp[1];
			}
		}
		return obj;
	}
}

function getPageInfo () {
	var obj = {},
		pageHistory = urlParse($('.page-history-view a:first').attr('href')),
		lastModified = urlParse($('.last-modified').attr('href')),
		testsEls = $('.testExecutorContainer');
	obj.issueKey = $('#content').data('issueKey');

	obj.amountOfTests = testsEls.length;
	obj.passed = 0;
	obj.failed = 0;
	obj.notCheckedYet = obj.amountOfTests;
	testsEls.each(function (n, el) {
		var status = $(el).data('testStatus');
		if (status == 'Passed') {
			obj.passed++;
			obj.notCheckedYet--;
		}
		else if (status == 'Failed') {
			obj.failed++;
			obj.notCheckedYet--;
		}
	});

	if (pageHistory) {
		obj.pageId = pageHistory.pageId;
		obj.pageVersion = pageHistory.originalVersion;
	}
	else {
		obj.pageId = lastModified.pageId;
		obj.pageVersion = lastModified.selectedPageVersions[1];
	}
	return obj;
}

function setContext (context) {
	if (context) {
		$('#content').data('issueKey', context.issueKey);
		drawButtons(context.tests.tests);
	}
	else {
		$('#content').data('issueKey', '');
		removeButtons();
	}
	return true;
}
/*
function screenshot () {
	var frame = $('<iframe>')
		.attr('width', 1500)
		.attr('height', 1000)
		.attr('src', window.location.href)
		.appendTo('body');
	var body = frame[0].contentDocument.body;
	$(body).onload(function (){console.log('done')});
	html2canvas(document.body, {
		onrendered: function(canvas) {
			document.body.appendChild(canvas);
		}
	});
}*/