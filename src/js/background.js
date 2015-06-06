// When the extension is installed or upgraded ...
chrome.runtime.onInstalled.addListener(function() {
	// Replace all rules ...
	chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
		// With a new rule ...
		chrome.declarativeContent.onPageChanged.addRules([
			{
				// That fires when a page's URL contains a 'wiki.returnonintelligence.com' ...
				conditions: [
					new chrome.declarativeContent.PageStateMatcher({
						pageUrl: { urlContains: 'https://wiki.returnonintelligence.com/' }
					})
				],
				// And shows the extension's page action.
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