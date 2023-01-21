import { buttonHtmlString } from "./button";
import { CaptionData } from "./types";

let iFrame: HTMLIFrameElement | null;
let lastImageClicked;

// use setInterval to check if a div exists and cancel the interval when complete
var interval = setInterval(function () {
  const overlays = document.querySelectorAll('[data-automation-id="overlay"]');
  const miniSettingsTarget = document.querySelector(".site-canvas")
    ?.firstElementChild?.firstElementChild?.childNodes[1] as HTMLDivElement;
  if (overlays.length >= 2 && miniSettingsTarget) {
    iFrame = document.querySelector<HTMLIFrameElement>("#site-iframe-next");
    // iFrame?.addEventListener("keydown", function (event) {
    //   if (event.keyCode === 13) {
    //     console.log(event.target);
    //     console.log("enter pressed");
    //   }
    // });
    addGlobalEventListener("click", "img", saveLastImageClicked);
    altTextMediaPane(overlays[1].parentNode);
    //altTextMiniSettings(miniSettingsTarget);
    clearInterval(interval);
  }
}, 250);

const altTextMiniSettings = (miniSettingsTarget: HTMLDivElement) => {
  const callback = (mutationList: MutationRecord[], observer) => {
    for (const mutation of mutationList) {
      // use mutation.target to get the element that has mutated.
      // e.g. mutation.target.style.opacity = 0.5
      console.log({ mutation });
      if (mutation.type === "childList") {
        if (mutation.addedNodes.length > 0) {
          const addedNode = mutation.addedNodes[0] as HTMLDivElement;
          if (
            addedNode?.attributes?.getNamedItem("data-automation-id") &&
            addedNode?.classList.contains("image-mini-settings")
          ) {
            injectButtonToMiniSettings(addedNode);
          }
        }
      }
    }
  };

  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(callback);

  // const target = miniSettingsTarget.firstChild?.firstChild?.childNodes[1];
  // if (!target) {
  //   console.info("no parent container for mini settings container found");
  //   return;
  // }
  // Start observing the target node for configured mutations
  observer.observe(miniSettingsTarget, { childList: true, subtree: true });
};

const altTextMediaPane = (overlayParent) => {
  // Callback function to execute when mutations are observed
  const callback = (mutationList: MutationRecord[], observer) => {
    for (const mutation of mutationList) {
      // use mutation.target to get the element that has mutated.
      // e.g. mutation.target.style.opacity = 0.5

      if (mutation.type === "childList") {
        // A child node has been added or removed.
        if (mutation.addedNodes.length > 0) {
          const addedNode = mutation.addedNodes[0] as HTMLDivElement;
          if (
            addedNode?.attributes?.getNamedItem("data-automation-id") &&
            addedNode?.querySelector(
              '[data-automation-id="asset-details-popover"]'
            )
          ) {
            injectButtonToAssetDetailpopover(addedNode);
          }
        }
      }
    }
  };

  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(callback);

  // Start observing the target node for configured mutations
  observer.observe(overlayParent, { childList: true });

  // for when the UI doesn't work...
  // const assetButton = document.querySelector(".assets");
};

const injectButtonToMiniSettings = (addedNode: HTMLDivElement) => {
  const button = createButton();
  if (!button) return;
  const altTextArea = addedNode.querySelector<HTMLInputElement>(
    '[data-automation-id="image-settings-alt-input"]'
  );
  if (!altTextArea) return;

  // add the button to mini settings
  altTextArea?.parentNode?.append(button);

  // add listener for button click
  button.addEventListener("click", async () => {
    try {
      const response: CaptionData = await fetchAltText(lastImageClicked.src);
      const caption = response.description.captions[0].text;
      //insertCaptionToTextArea(caption, addedNode);

      //toggleInputFocus(altTextArea);
      //toggleFocusOnMiniSettingsInput(altTextArea);
      // var evt = new Event("focus", {
      //   bubbles: true,
      //   cancelable: false,
      // });
      // altTextArea.dispatchEvent(evt);
      console.log({ caption });
      //altTextArea.value = caption;
      altTextArea.value = "";
      console.log(altTextArea.value);
      //altTextArea.dispatchEvent(new KeyboardEvent("keydown", { keyCode: 13 }));
      let i = 0;
      let myInterval = setInterval(() => {
        if (i === caption.length - 1) {
          clearInterval(myInterval);
        }
        altTextArea.value += caption[i];
        i++;
      }, 100);
      // setTimeout(() => {
      //   addedNode
      //     .querySelector<HTMLLabelElement>(".kit-checkbox.hi-dpi")
      //     ?.click();
      // }, 100);
      // setTimeout(() => {
      //   iFrame?.dispatchEvent(new KeyboardEvent("keydown", { keyCode: 13 }));
      //   altTextArea.dispatchEvent(
      //     new KeyboardEvent("keydown", { keyCode: 13 })
      //   );
      //   altTextArea.parentNode?.dispatchEvent(
      //     new KeyboardEvent("keydown", { keyCode: 13 })
      //   );
      // }, 1);
      // setTimeout(() => {
      //   altTextArea.select();
      //   altTextArea.focus();
      // altTextArea.dispatchEvent(
      //   new KeyboardEvent("keydown", { keyCode: 13 })
      // );
      // }, 1);
    } catch (error) {
      console.error(error);
    }
  });
};

const injectButtonToAssetDetailpopover = (addedNode: HTMLDivElement) => {
  const assetDetailsPopover = addedNode.querySelector(
    '[data-automation-id="asset-details-popover"]'
  ) as HTMLDivElement;

  // get the wrapper div for the alt text section
  const altTextBox = assetDetailsPopover?.querySelector(
    '[data-automation-id="panel_asset_alt"]'
  );
  if (!altTextBox || !assetDetailsPopover) return;
  const altTextButton = createAltTextButton(assetDetailsPopover);
  if (!altTextButton) return;
  const buttonText = altTextButton.querySelector("span");
  if (!buttonText) {
    return;
  }
  altTextBox
    .querySelector("textarea")
    ?.parentNode?.append(altTextButton as HTMLDivElement);

  altTextButton?.addEventListener("click", (e) => {
    const altTextArea = altTextBox.querySelector("textarea");
    if (!altTextArea) {
      return;
    }
    const imgSrc = assetDetailsPopover.querySelector("a")?.href;
    if (!imgSrc) {
      return;
    }
    const fileType = imgSrc.toLowerCase().split(".").pop();

    try {
      if (fileType === "svg") {
        console.info("SVG not supported :(");
        altTextArea.value = "SVG not supported :(";
        return;
      }
      altTextArea.value = "Please wait";
      const loadingInterval = setInterval(() => {
        if (altTextArea.value.length >= 14) {
          altTextArea.value = "Please wait";
        } else {
          altTextArea.value += ".";
        }
      }, 250);

      chrome.runtime.sendMessage(
        {
          contentScriptQuery: "postData",
          data: JSON.stringify({ imageUrl: imgSrc }),
          url: `https://web-bae.azurewebsites.net/api/GetDescription?code=i0uGk4397zccFQC3NesER15fkumKOVL4uCB34VZ1OnI_AzFuJiyetQ==&clientId=default`,
        },
        (response: CaptionData) => {
          clearInterval(loadingInterval);
          altTextArea.value = "";
          if (response) {
            //console.log("response: ", response);
            if (response.error) {
              altTextArea.value = response.error.message;
              return;
            }

            // get the caption data that we want
            const caption = response.description.captions[0].text;
            // set the alt text in the textarea
            if (caption.length < 1) {
              console.info("No caption found :(");
              altTextArea.value = "No caption found :(";
            } else {
              altTextArea.value = caption;
            }
          } else {
            altTextArea.value =
              "No response. Please wait 60 seconds and try again.";
          }
          // triggers change event so text saves on cancel
          altTextArea.focus();
          var evt = new Event("change", {
            bubbles: true,
            cancelable: false,
          });
          altTextArea.dispatchEvent(evt);
        }
      );
    } catch (error) {
      console.error("error: ", error);
      altTextArea.value = error.message;
    }
  });
};

const fetchAltText = async (imageUrl: string) => {
  return await chrome.runtime.sendMessage({
    contentScriptQuery: "postData",
    data: JSON.stringify({ imageUrl }),
    url: `https://web-bae.azurewebsites.net/api/GetDescription?code=i0uGk4397zccFQC3NesER15fkumKOVL4uCB34VZ1OnI_AzFuJiyetQ==&clientId=default`,
  });
};

const insertCaptionToTextArea = (caption: string, node: HTMLDivElement) => {
  const altTextArea = node.querySelector<HTMLInputElement>(
    '[data-automation-id="image-settings-alt-input"]'
  );
  if (!altTextArea) return;
  console.log({ caption });
  console.log({ altTextArea });
  console.log(altTextArea.value);
  altTextArea.value = "";
  altTextArea.value = caption;
  // triggers change event so text saves on cancel
  altTextArea.focus();
  var evt = new Event("change", {
    bubbles: true,
    cancelable: false,
  });
  altTextArea.dispatchEvent(evt);
};

const toggleFocusOnMiniSettingsInput = (node: HTMLInputElement) => {
  node.parentElement?.classList.add("focused");
  node.click();
  var evt = new Event("change", {
    bubbles: true,
    cancelable: false,
  });
  node.parentElement?.dispatchEvent(evt);

  setTimeout(() => {
    node.parentElement?.click();
    node.parentElement?.classList.remove("focused");
  }, 1000);
};

const toggleInputFocus = (node: HTMLInputElement | HTMLTextAreaElement) => {
  node.focus();
  var evt = new Event("change", {
    bubbles: true,
    cancelable: false,
  });
  node.dispatchEvent(evt);
};

const createButton = (): HTMLDivElement | void => {
  var newDiv = document.createElement("div");
  newDiv.innerHTML = buttonHtmlString;
  newDiv.style.position = "absolute";
  newDiv.style.right = "2px";
  newDiv.style.bottom = "2px";
  return newDiv;
};

const createAltTextButton = (assetDetailsPopover: HTMLDivElement) => {
  const buttonClone = assetDetailsPopover
    ?.querySelector(".delete-asset")
    ?.cloneNode(true) as HTMLDivElement;
  if (!buttonClone) {
    console.log("error getting delete asset");
    return;
  }

  let textSpan = buttonClone.querySelector("span");
  if (!textSpan) {
    console.log("error getting text");
    return;
  }
  textSpan.innerHTML = "A.I. Bae";
  textSpan.style.marginLeft = "4px";

  let icon = buttonClone.querySelector("i");
  if (!icon) {
    console.log("error getting icon");
    return;
  }
  // icon.style.backgroundPositionY = "-600px";
  // icon.style.backgroundPositionX = "0px";
  //   buttonClone.style.marginLeft = "2px";
  icon.remove();

  buttonClone.style.background = "#F17144";

  buttonClone.style.position = "absolute";
  buttonClone.style.left = "0px";
  buttonClone.style.bottom = "0px";

  return buttonClone;
};

const saveLastImageClicked = (event) => {
  lastImageClicked = event.target;
};

function addGlobalEventListener(type, selector, callback) {
  iFrame!.contentDocument?.addEventListener(type, (e) => {
    console.log("click");
    if (e.target.matches(selector)) {
      callback(e);
    }
  });
}
