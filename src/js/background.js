chrome.runtime.onInstalled.addListener(function() {
	chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
		chrome.declarativeContent.onPageChanged.addRules([
			{
				conditions: [
					new chrome.declarativeContent.PageStateMatcher({
						pageUrl: { urlContains: 'https://wiki.returnonintelligence.com/' }
					})
				],
				actions: [ new chrome.declarativeContent.ShowPageAction() ]
			}
		]);
	});
});

function screenshot (data, cb) {
	contentMethod('screenshot', null, function (img) {
		data.img = img.substring(22);
		sendResultsToJira(data, cb);
	});
}

function getTests (data, cb) {
	var key = data.issueKey + ',' + data.pageId + ',' + data.pageVersion;
	var obj = localStorage[key] ? JSON.parse(localStorage[key]) : {};
	if (cb) cb(obj);
	return {key: key, obj: obj};
}

function saveTest (data, cb) {
	var tests = getTests(data);
	tests.obj[data.testId] = data.testStatus;
	localStorage[tests.key] = JSON.stringify(tests.obj);
	cb();
}