import { CaptionData } from "./types";

// use setInterval to check if a div exists and cancel the interval when complete
var interval = setInterval(function () {
  const overlays = document.querySelectorAll('[data-automation-id="overlay"]');
  if (overlays.length >= 2) {
    altText(overlays[1].parentNode);
    clearInterval(interval);
  }
}, 250);

const altText = (overlayParent) => {
  // Options for the observer (which mutations to observe)
  const config = {
    attributes: true,
    childList: true,
    subtree: true,
    attributeFilter: ["popover-asset"],
  };

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
            // get the popover
            const assetDetailsPopover = addedNode.querySelector(
              '[data-automation-id="asset-details-popover"]'
            ) as HTMLDivElement;

            // get the wrapper div for the alt text section
            const altTextBox = assetDetailsPopover?.querySelector(
              '[data-automation-id="panel_asset_alt"]'
            );
            if (!altTextBox) {
              console.info("no alt text box found");
              return;
            }
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
                    data: JSON.stringify({ urls: [imgSrc] }),
                    url: `https://alt-text-generator-api-kcffb7uzra-uc.a.run.app/describe`,
                  },
                  (response: { captions: CaptionData[] }) => {
                    clearInterval(loadingInterval);
                    altTextArea.value = "";
                    if (response != undefined) {
                      console.log("response: ", response);

                      const captions = response.captions;
                      if (captions[0].error) {
                        altTextArea.value = captions[0].error.message;
                        return;
                      }
                      // get the caption data that we want
                      const caption = captions[0].description.captions[0].text;
                      // set the alt text in the textarea
                      if (caption.length < 1) {
                        console.info("No caption found :(");
                        altTextArea.value = "No caption found :(";
                      } else {
                        altTextArea.value = caption;
                      }
                    } else {
                      console.info(
                        "No response. Please wait 60 seconds and try again."
                      );
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
          }
        }
      }
    }
  };

  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(callback);

  // Start observing the target node for configured mutations
  observer.observe(overlayParent, config);

  // for when the UI doesn't work...
  // const assetButton = document.querySelector(".assets");
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
  textSpan.innerHTML = "AI Alt";
  textSpan.style.marginLeft = "4px";

  let icon = buttonClone.querySelector("i");
  if (!icon) {
    console.log("error gettig icon");
    return;
  }
  icon.style.backgroundPositionY = "-600px";
  icon.style.backgroundPositionX = "0px";
  //   buttonClone.style.marginLeft = "2px";
  buttonClone.style.position = "absolute";
  buttonClone.style.left = "0px";
  buttonClone.style.bottom = "0px";

  return buttonClone;
};
