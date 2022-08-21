// Can use
// chrome.devtools.*
// chrome.extension.*

// Create a tab in the devtools area
chrome.devtools.panels.create("Event Tracker", "icon.png", "panel.html", function (panel) { });