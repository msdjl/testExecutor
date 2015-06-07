var pageInfo = {}, tests = {};

function drawButtons (tests) {
	$.get(chrome.extension.getURL('/html/buttons.html'), function(template) {
		$('tbody tr').find('td:first').each(function (n, el) {
			$(template).data({testId: n}).addClass(tests[n]).appendTo(el);
		});
		$('.testExecutorContainer .btn').click(clickButtonHandler);
		$('tr:has(.testExecutorContainer.Passed)').addClass('Passed');
		$('tr:has(.testExecutorContainer.Failed)').addClass('Failed');
	});
}

function removeButtons () {
	$('.testExecutorContainer').remove();
	$('.Passed, .Failed').removeClass('Passed Failed');
}

function clickButtonHandler () {
	var buttonEl = $(this),
		testEl = buttonEl.parent(),
		trEl = testEl.parent().parent(),
		newStatus = buttonEl.data('newStatus'),
		testId = testEl.data('testId');
	trEl.removeClass('Passed Failed').addClass(newStatus);
	tests[testId] = newStatus;
	backgroundMethod('saveTest', $.extend({}, getPageInfo(), { testId: testId, testStatus: newStatus }));
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
			} else {
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
	obj.amountOfTests = obj.notCheckedYet = testsEls.length;
	obj.passed = obj.failed = 0;
	for (var i in tests) {
		if (tests[i]) {
			obj.notCheckedYet--;
			tests[i] == 'Passed' ? obj.passed++ : obj.failed++;
		}
	}
	if (pageHistory) {
		obj.pageId = pageHistory.pageId;
		obj.pageVersion = pageHistory['originalVersion'];
	} else {
		obj.pageId = lastModified.pageId;
		obj.pageVersion = lastModified['selectedPageVersions'] ? lastModified['selectedPageVersions'][1] : '1';
	}
	$.extend(pageInfo, obj);
	return cb ? cb(pageInfo) : pageInfo;
}

function screenshot (params, cb) {
	var frame = $('<iframe>').attr('src', window.location.href).appendTo('body')
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
}

function fixWikiPage (tests, body) {
	body = $(body || window.document.body);
	body.html(body.find('#main').html())
		.addClass('forScreenshot')
		.find('tbody tr').find('td:first').each(function (n, el) {
			$(el).parent().addClass(tests[n]);
		});
}

function setContext (context, cb) {
	pageInfo.issueKey = context ? context.issueKey : '';
	!context ? cb(removeButtons()) : backgroundMethod('getTests', getPageInfo(), function (newTests) {
		cb(drawButtons(tests = newTests));
	});
}