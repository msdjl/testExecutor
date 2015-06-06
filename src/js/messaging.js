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

function backgroundMethod (method, params, cb) {
	sendMessageToBackground({ method: method, params: params }, cb);
}

function sendMessageToBackground (data, cb) {
	chrome.runtime.sendMessage(data, cb);
}