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

chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
	if (request.method) {
		window[request.method](request.params, sendResponse);
		return true;
	}
});

function contentMethod (method, params, cb) {
	sendMessageToTab({ method: method, params: params }, cb);
}

function sendMessageToTab (data, cb) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, data, cb);
	});
}

function screenshot (data, cb) {
	contentMethod('screenshot', null, function (img) {
		data.img = img.substring(22);
		sendResultsToJira(data, cb);
	});
}