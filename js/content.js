chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
	if (request.method && !sender.tab) {
		window[request.method](request.params, sendResponse);
		return true;
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

function getPageInfo (params, cb) {
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
	if (cb) cb(obj);
	return obj;
}

function getTests () {
	var tests = {};
	$('.testExecutorContainer').each(function (n, el) {
		tests[n] = $(el).data('testStatus');
	});
	return tests;
}

function screenshot (params, cb) {
	var body = null;
	var tests = getTests();
	var frame = $('<iframe>')
		.attr('width', 1500)
		.attr('height', 1000)
		.attr('src', window.location.href)
		.appendTo('body')
		.on('load', function () {
			body = frame[0].contentDocument.body;
			fixWikiPage(tests, body);
			html2canvas(body, {
				onrendered: function(canvas) {
					frame.remove();
					cb(canvas.toDataURL());
				}
			});
		});
}

function fixWikiPage (tests, body) {
	tests = tests || {};
	body = $(body || window.document.body);
	body.html(body.find('#main').html());
	body.find('#comments-section, #likes-and-labels-container, #navigation, #page-history-warning').remove();
	body.find('.table-wrap').css('overflow', 'visible');
	body.parent().css('padding', '10px').css('backgroundColor', 'white');
	body.css('overflow', 'visible').css('backgroundColor', 'white');
	body.find('tbody tr').find('td:first').each(function (n, el) {
		var status = tests[n] || '';
		var tr = $(el).parent();
		if (status == 'Passed') {
			tr.css('backgroundColor', 'rgb(223, 240, 216)');
		}
		else if (status == 'Failed') {
			tr.css('backgroundColor', 'rgb(242, 222, 222)');
		}
	});
}

function setContext (context, cb) {
	if (context) {
		$('#content').data('issueKey', context.issueKey);
		drawButtons(context.tests.tests);
	}
	else {
		$('#content').data('issueKey', '');
		removeButtons();
	}
	if (cb) cb(true);
	return true;
}