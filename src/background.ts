import { CaptionData } from "./types";

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.contentScriptQuery == "postData") {
    fetch(request.url, {
      method: "POST",
      headers: {
        Accept: "application/json, application/xml, text/plain, text/html, *.*",
        "Content-Type": "application/json",
      },
      body: request.data,
    })
      .then((response) => response.json())
      .then((response: CaptionData[]) => {
        sendResponse(response);
      })
      .catch((error) => console.log("Error:", error));
    return true;
  }
});
