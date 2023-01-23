import { buttonHtmlString } from "./button";
import { CaptionData } from "./types";

const DATA_AUTOMATION_ID = "data-automation-id";
const OVERLAY_ATTR = `[${DATA_AUTOMATION_ID}="overlay"]`;
const IMAGE_FIELD = ".bem-ImageInput";
const MULTI_IMAGE_FIELD = `[${DATA_AUTOMATION_ID}="multi-image-field-preview"]`;
const CMS_MANAGER_CLASSNAME = "bem-Pane";
const DESIGNER_IFRAME_ID = "#site-iframe-next";
const ORANGE_COLOR = "#F17144";
const DESCRIBE_API_URL = `https://web-bae.azurewebsites.net/api/GetDescription?code=i0uGk4397zccFQC3NesER15fkumKOVL4uCB34VZ1OnI_AzFuJiyetQ==&clientId=default`;

// use setInterval to check if a div exists and cancel the interval when complete
var interval = setInterval(function () {
  const overlays = document.querySelectorAll(OVERLAY_ATTR);
  if (overlays.length >= 2) {
    observeForCMS(overlays[0].parentNode);
    observeForMediaPane(overlays[1].parentNode);
    clearInterval(interval);
  }
}, 250);

const observeForCMS = (overlayParent) => {
  const callback = async (mutationList: MutationRecord[], observer) => {
    for (const mutation of mutationList) {
      if (mutation.type === "childList") {
        if (mutation.addedNodes.length > 0) {
          const addedNode = mutation.addedNodes[0] as HTMLDivElement;
          if (
            addedNode?.attributes?.getNamedItem(DATA_AUTOMATION_ID) &&
            addedNode?.classList.contains(CMS_MANAGER_CLASSNAME)
          ) {
            const imageInputs = addedNode.querySelectorAll(
              IMAGE_FIELD
            ) as NodeListOf<HTMLDivElement>;
            imageInputs.forEach((imageInput) => {
              console.log(imageInput);
              const isMultiImageField = checkIfIsMultiImageField(imageInput);

              // create button and get imageUrl
              let button: HTMLButtonElement | undefined;
              let imageUrl: string | undefined;
              if (isMultiImageField) {
                // multi image fields not yet supported
              } else {
                // create single image field button and get url
                button = createAndAppendSingleCMSImageFieldButton(imageInput);
                imageUrl = getImageUrlForSingleCMSImageField(imageInput);
              }
              if (!button || !imageUrl) return;
              button.addEventListener("click", () => {
                button!.textContent = "Wait";
                let interval = setInterval(() => {
                  if (button!.textContent!.length < 8) {
                    button!.textContent += ".";
                  } else {
                    button!.textContent = "Wait";
                  }
                }, 250);

                chrome.runtime.sendMessage(
                  {
                    contentScriptQuery: "postData",
                    data: JSON.stringify({ imageUrl }),
                    url: DESCRIBE_API_URL,
                  },
                  (response: CaptionData) => {
                    let caption = "";
                    if (response.error) {
                      caption = response.error.message;
                    } else {
                      caption = response.description.captions[0].text;
                    }
                    console.log({ caption });
                    copyCaptionToClipboard(caption);
                    clearInterval(interval);
                    button!.textContent = "Alt Text Copied to Clipboard!";
                    setTimeout(() => {
                      button!.textContent = "A.I. Alt";
                    }, 1000);
                  }
                );
              });
            });
          }
        }
      }
    }
  };

  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(callback);
  observer.observe(overlayParent, { childList: true, subtree: true });
};

function copyCaptionToClipboard(text) {
  try {
    navigator.clipboard.writeText(text);
  } catch (error) {
    console.warn("error copying to clipboard");
  }
}

function checkIfIsMultiImageField(imageInput) {
  let firstChild = imageInput?.firstChild as HTMLDivElement;
  if (firstChild.classList.contains("bem-FileInput")) {
    return true;
  }
  return false;
}

const getImageUrlForSingleCMSImageField = (
  imageInput: HTMLDivElement
): string | undefined => {
  let img = imageInput.querySelector("img");
  if (!img) {
    console.warn("no image found");
    return;
  }
  return img.src;
};

const createAndAppendSingleCMSImageFieldButton = (
  imageInput: HTMLDivElement
) => {
  const btn = imageInput.querySelector(
    `[${DATA_AUTOMATION_ID}="variant-img-delete-button"]`
  );
  const btnClone = btn?.cloneNode(true) as HTMLButtonElement;
  if (!btnClone?.firstChild || !btnClone.firstChild?.firstChild) {
    console.warn("error building single CMS field button");
    console.log(imageInput);
    return;
  }
  btnClone.firstChild?.remove();
  btnClone.firstChild.textContent = "A.I. Alt";
  btnClone!.style.backgroundColor = ORANGE_COLOR;

  btnClone.addEventListener("click", () =>
    console.log("clicked single CMS button")
  );

  imageInput.querySelector(".bem-ImageInput_Controls")?.append(btnClone);
  return btnClone;
};

const observeForMediaPane = (overlayParent) => {
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

const injectButtonToAssetDetailpopover = (addedNode: HTMLDivElement) => {
  const assetDetailsPopover = addedNode.querySelector(
    `[${DATA_AUTOMATION_ID}="asset-details-popover"]`
  ) as HTMLDivElement;

  // get the wrapper div for the alt text section
  const altTextBox = assetDetailsPopover?.querySelector(
    `[${DATA_AUTOMATION_ID}="panel_asset_alt"]`
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
          url: DESCRIBE_API_URL,
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
