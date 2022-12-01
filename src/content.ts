console.log("loaded content script");

// use setInterval to check if a div exists and cancel the interval when complete

var interval = setInterval(function () {
  const overlays = document.querySelectorAll('[data-automation-id="overlay"]');
  console.log("checking for designer...");
  if (overlays.length >= 2) {
    console.log("designer ready");
    altText(overlays[1].parentNode);
    clearInterval(interval);
  }
}, 250);

const altText = (overlayParent) => {
  // Select the node that will be observed for mutations

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
        // console.log("A child node has been added or removed.");
        const addedNode = mutation.addedNodes[0] as HTMLDivElement;
        if (mutation.addedNodes.length > 0) {
          const addedNode = mutation.addedNodes[0] as HTMLDivElement;
          if (
            addedNode.attributes.getNamedItem("data-automation-id") &&
            addedNode.querySelector(
              '[data-automation-id="asset-details-popover"]'
            )
          ) {
            console.log("mutation for added node: ", mutation);
            console.log("added node: ", mutation.addedNodes[0]);

            // get the popover
            const assetDetailsPopover = addedNode.querySelector(
              '[data-automation-id="asset-details-popover"]'
            );

            // get the wrapper div for the alt text section
            const altTextBox = assetDetailsPopover?.querySelector(
              '[data-automation-id="panel_asset_alt"]'
            );
            if (!altTextBox) {
              console.log("no alt text box found");
              return;
            }
            console.log({ altTextBox });
            console.log("cloning button...");

            const altTextButton = createAltTextButton(assetDetailsPopover);

            altTextBox.append(altTextButton);
            console.log("append complete");
          }
        }
      }
    }
  };

  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(callback);

  // Start observing the target node for configured mutations
  observer.observe(overlayParent, config);

  //   const assetButton = document.querySelector(".assets");
  //   console.log("assetButton: ", assetButton);
  //   const overlays = document.querySelectorAll('[data-automation-id="overlay"]');
  //   console.log("overlays: ", overlays);
  //   let assetDetailOverlay;
  //   for (const overlay of overlays) {
  //     if ((overlay as HTMLDivElement).innerText.includes("Asset Detail")) {
  //       assetDetailOverlay = overlay;
  //     }
  //   }
  //   if (!assetDetailOverlay) {
  //     console.log("no asset detail overlay found");
  //   }
  //   console.log("assetDetailOverlay: ", assetDetailOverlay);
};

const createAltTextButton = (assetDetailsPopover: HTMLDivElement) => {
  const buttonClone = assetDetailsPopover
    ?.querySelector(".delete-asset")
    ?.cloneNode(true) as HTMLDivElement;
  if (!buttonClone) {
    console.log("clone failed!");
    return;
  }
  buttonClone.querySelector("span").innerText = "Get Alt Text";
};
