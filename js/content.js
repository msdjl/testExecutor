chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
	var result;
	if (request.method) {
		result = window[request.method](request.params);
		if (result) {
			sendResponse(result);
		}
	}
});

function sendMessage (data, cb) {
	chrome.runtime.sendMessage(data, cb);
}

function drawButtons () {
	var pageInfo = getPageInfo();
	var template = $('.testExecutorContainerTemplate').clone();
	template.removeClass('testExecutorContainerTemplate');
	template.addClass('testExecutorContainer');
	template.find('.btn-success').click(function () {
		alert('success');
	}).find('.btn-dander').click(function () {
		alert('danger' + $(this).data('testId'));
	});
	$('tbody tr').find('td:first').each(function (n, el) {
		var data = $.extend( {}, pageInfo, { testId: n, testStatus: '' } );
		var container = template.clone().data(data);
		$(el).append(container);
	});
}

function removeButtons () {
	$('.testExecutorContainer').remove();
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
	lastModified = urlParse($('.last-modified').attr('href'));
	obj.issueKey = $('#content').data('issueKey');
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
	$('#content').data('issueKey', context);
	if (context) {
		drawButtons();
	}
	else {
		removeButtons();
	}
}