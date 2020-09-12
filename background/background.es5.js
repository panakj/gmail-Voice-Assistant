"use strict";

chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
    switch (request.cmd) {
        case "bg_read_file":
            {
                $.ajax({
                    url: chrome.extension.getURL("/page-template/mail-tangy-tmpl.html"),
                    dataType: "html",
                    success: sendResponse
                });
            }
            break;
        default:
    }
});

chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason == "install") {
        chrome.tabs.create({ url: chrome.extension.getURL("guid.html") }, function () {});
    } else if (details.reason == "update") {
        var thisVersion = chrome.runtime.getManifest().version;
        console.log("Updated from " + details.previousVersion + " to " + thisVersion + " + !");
    }
});

