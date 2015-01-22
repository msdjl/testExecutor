chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
	var result = window[request.method](request.data);
	if (result) {
		sendResponse(result);
	}
});

function sendMessage (data, cb) {
	chrome.runtime.sendMessage(data, cb);
}

function drawButtons () {
	$('tbody tr').attr('testId', function (n) {
		return n + 1;
	}).find('td:first').append('');
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
	obj.context = $('#content').data('context');
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
	$('#content').data('context', context);
}