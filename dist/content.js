(() => {
  var m = setInterval(function () {
      let o = document.querySelectorAll('[data-automation-id="overlay"]');
      o.length >= 2 && (x(o[1].parentNode), clearInterval(m));
    }, 250),
    x = (o) => {
      let t = {
          attributes: !0,
          childList: !0,
          subtree: !0,
          attributeFilter: ["popover-asset"],
        },
        a = (g, T) => {
          for (let l of g)
            if (l.type === "childList" && l.addedNodes.length > 0) {
              let i = l.addedNodes[0];
              if (
                i?.attributes?.getNamedItem("data-automation-id") &&
                i?.querySelector('[data-automation-id="asset-details-popover"]')
              ) {
                let c = i.querySelector(
                    '[data-automation-id="asset-details-popover"]'
                  ),
                  u = c?.querySelector(
                    '[data-automation-id="panel_asset_alt"]'
                  );
                if (!u) {
                  console.info("no alt text box found");
                  return;
                }
                let n = S(c);
                if (!n || !n.querySelector("span")) return;
                u.querySelector("textarea")?.parentNode?.append(n),
                  n?.addEventListener("click", (N) => {
                    let e = u.querySelector("textarea");
                    if (!e) return;
                    let d = c.querySelector("a")?.href;
                    if (!d) return;
                    let y = d.toLowerCase().split(".").pop();
                    try {
                      if (y === "svg") {
                        console.info("SVG not supported :("),
                          (e.value = "SVG not supported :(");
                        return;
                      }
                      e.value = "Please wait";
                      let s = setInterval(() => {
                        e.value.length >= 14
                          ? (e.value = "Please wait")
                          : (e.value += ".");
                      }, 250);
                      chrome.runtime.sendMessage(
                        {
                          contentScriptQuery: "postData",
                          data: JSON.stringify({ urls: [d] }),
                          url: "https://alt-text-generator-api-kcffb7uzra-uc.a.run.app/describe",
                        },
                        (p) => {
                          if ((clearInterval(s), (e.value = ""), p != null)) {
                            console.log("response: ", p);
                            let v = p.captions;
                            if (v[0].error) {
                              e.value = v[0].error.message;
                              return;
                            }
                            let f = v[0].description.captions[0].text;
                            f.length < 1
                              ? (console.info("No caption found :("),
                                (e.value = "No caption found :("))
                              : (e.value = f);
                          } else
                            console.info(
                              "No response. Please wait 60 seconds and try again."
                            ),
                              (e.value =
                                "No response. Please wait 60 seconds and try again.");
                          e.focus();
                          var b = new Event("change", {
                            bubbles: !0,
                            cancelable: !1,
                          });
                          e.dispatchEvent(b);
                        }
                      );
                    } catch (s) {
                      console.error("error: ", s), (e.value = s.message);
                    }
                  });
              }
            }
        };
      new MutationObserver(a).observe(o, t);
    },
    S = (o) => {
      let t = o?.querySelector(".delete-asset")?.cloneNode(!0);
      if (!t) {
        console.log("error getting delete asset");
        return;
      }
      let a = t.querySelector("span");
      if (!a) {
        console.log("error getting text");
        return;
      }
      (a.innerHTML = "AI Alt"), (a.style.marginLeft = "4px");
      let r = t.querySelector("i");
      if (!r) {
        console.log("error gettig icon");
        return;
      }
      return (
        (r.style.backgroundPositionY = "-600px"),
        (r.style.backgroundPositionX = "0px"),
        (t.style.position = "absolute"),
        (t.style.left = "0px"),
        (t.style.bottom = "0px"),
        t
      );
    };
})();
