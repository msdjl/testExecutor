function drawButtons (tests) {
	$.get(chrome.extension.getURL('/html/buttons.html'), function(template) {
		$('tbody tr').find('td:first').each(function (n, el) {
			$(template).data({testId: n, testStatus: tests[n]||''}).addClass(tests[n] || '').appendTo(el);
		});
		$('.testExecutorContainer').data(getPageInfo())
			.find('.btn').click(clickButtonHandler);
		$('tr:has(.testExecutorContainer.Passed)').addClass('Passed');
		$('tr:has(.testExecutorContainer.Failed)').addClass('Failed');
	});
}

function removeButtons () {
	$('.testExecutorContainer').remove();
	$('.Passed, .Failed').removeClass('Passed Failed');
}

function clickButtonHandler () {
	var newStatus,
		buttonEl = $(this),
		testEl = buttonEl.parent(),
		trEl = testEl.parent().parent();
	newStatus = buttonEl.data('newStatus');
	testEl.data('testStatus', newStatus);
	trEl.removeClass('Passed Failed').addClass(newStatus);
	backgroundMethod('saveTest', testEl.data());
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

	obj.amountOfTests = obj.notCheckedYet = testsEls.length;
	obj.passed = obj.failed = 0;
	testsEls.each(function (n, el) {
		var status = $(el).data('testStatus');
		if (status) {
			obj.notCheckedYet--;
			status == 'Passed' ? obj.passed++ : obj.failed++;
		}
	});

	if (pageHistory) {
		obj.pageId = pageHistory.pageId;
		obj.pageVersion = pageHistory['originalVersion'];
	}
	else {
		obj.pageId = lastModified.pageId;
		obj.pageVersion = lastModified['selectedPageVersions'] ? lastModified['selectedPageVersions'][1] : '1';
	}
	return cb ? cb(obj) : obj;
}

function screenshot (params, cb) {
	backgroundMethod('getTests', getPageInfo(), function (tests) {
		var frame = $('<iframe>')
			.attr('src', window.location.href)
			.appendTo('body')
			.on('load', function () {
				var body = frame[0].contentDocument.body;
				$.get(chrome.extension.getURL('/css/content.css'), function(template) {
					$(body).parent().find('head').append($('<style>' + template + '</style>'));
					fixWikiPage(tests, body);
					html2canvas(body, {
						onrendered: function(canvas) {
							frame.remove();
							cb(canvas.toDataURL());
						}
					});
				});
			});
	});
}

function fixWikiPage (tests, body) {
	tests = tests || {};
	body = $(body || window.document.body);
	body.html(body.find('#main').html());
	body.addClass('forScreenshot');
	body.find('tbody tr').find('td:first').each(function (n, el) {
		$(el).parent().addClass(tests[n] || '');
	});
}

function setContext (context, cb) {
	$('#content').data('issueKey', context ? context.issueKey : '');
	context ? drawButtons(context.tests) : removeButtons();
	cb(true);
}