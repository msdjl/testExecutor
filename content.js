chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
	window[request.msg](request, sender, sendResponse);
});

function drawButtons1 (request, sender, sendResponse) {
	$('tbody tr').find('td:first').append('<div class="testexecutorcontext">'
	+ '<button class="btn btn-success" onclick="$(this.parentNode).hide(); this.parentNode.parentNode.parentNode.className=\'bg-success\'"><span class="glyphicon glyphicon-thumbs-up" aria-hidden="true"></span></button>'
	+ '<button class="btn btn-danger" onclick="$(this.parentNode).hide(); this.parentNode.parentNode.parentNode.className=\'bg-danger\'"><span class="glyphicon glyphicon-thumbs-down" aria-hidden="true"></span></button>'
	+ '<button class="btn btn-info" onclick="$(this.parentNode).hide()"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button></div>');
	sendResponse(getPageInfo());
}

function drawButtons (request, sender, sendResponse) {
	$('tbody tr').attr('testId', function (n) {
		return n + 1;
	}).find('td:first').append('');
}

function sendMessage (data, cb) {
	chrome.runtime.sendMessage(data, cb);
}

function testService (r) {
	console.log(r.response);
}

function urlParse (url) {
	var i, tmp, url, arr, obj = {};
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