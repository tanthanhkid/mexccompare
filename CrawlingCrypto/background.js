chrome.browserAction.setBadgeText({text: "click"});

chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
	if (changeInfo.status == 'complete' && tab.active) {
  
	  // do your things
	//   alert(1)
	}
  })