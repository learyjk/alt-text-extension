(() => {
  console.log("loaded content script");
  var c = setInterval(function () {
      let e = document.querySelectorAll('[data-automation-id="overlay"]');
      console.log("checking for designer..."),
        e.length >= 2 &&
          (console.log("designer ready"), i(e[1].parentNode), clearInterval(c));
    }, 250),
    i = (e) => {
      let o = {
          attributes: !0,
          childList: !0,
          subtree: !0,
          attributeFilter: ["popover-asset"],
        },
        d = (s, g) => {
          for (let t of s)
            if (t.type === "childList") {
              let p = t.addedNodes[0];
              if (t.addedNodes.length > 0) {
                let n = t.addedNodes[0];
                if (
                  n.attributes.getNamedItem("data-automation-id") &&
                  n.querySelector(
                    '[data-automation-id="asset-details-popover"]'
                  )
                ) {
                  console.log("mutation for added node: ", t),
                    console.log("added node: ", t.addedNodes[0]);
                  let l = n.querySelector(
                      '[data-automation-id="asset-details-popover"]'
                    ),
                    a = l?.querySelector(
                      '[data-automation-id="panel_asset_alt"]'
                    );
                  if (!a) {
                    console.log("no alt text box found");
                    return;
                  }
                  console.log({ altTextBox: a }),
                    console.log("cloning button...");
                  let r = u(l);
                  a.append(r), console.log("append complete");
                }
              }
            }
        };
      new MutationObserver(d).observe(e, o);
    },
    u = (e) => {
      let o = e?.querySelector(".delete-asset")?.cloneNode(!0);
      if (!o) {
        console.log("clone failed!");
        return;
      }
      o.querySelector("span").innerText = "Get Alt Text";
    };
})();
