(()=>{var u,m,g=setInterval(function(){let n=document.querySelectorAll('[data-automation-id="overlay"]'),e=document.querySelector(".site-canvas")?.firstElementChild?.firstElementChild?.childNodes[1];n.length>=2&&e&&(u=document.querySelector("#site-iframe-next"),E("click","img",y),f(n[1].parentNode),clearInterval(g))},250);var f=n=>{let e=(a,d)=>{for(let r of a)if(r.type==="childList"&&r.addedNodes.length>0){let t=r.addedNodes[0];t?.attributes?.getNamedItem("data-automation-id")&&t?.querySelector('[data-automation-id="asset-details-popover"]')&&b(t)}};new MutationObserver(e).observe(n,{childList:!0})};var b=n=>{let e=n.querySelector('[data-automation-id="asset-details-popover"]'),o=e?.querySelector('[data-automation-id="panel_asset_alt"]');if(!o||!e)return;let a=x(e);!a||!a.querySelector("span")||(o.querySelector("textarea")?.parentNode?.append(a),a?.addEventListener("click",r=>{let t=o.querySelector("textarea");if(!t)return;let s=e.querySelector("a")?.href;if(!s)return;let p=s.toLowerCase().split(".").pop();try{if(p==="svg"){console.info("SVG not supported :("),t.value="SVG not supported :(";return}t.value="Please wait";let i=setInterval(()=>{t.value.length>=14?t.value="Please wait":t.value+="."},250);chrome.runtime.sendMessage({contentScriptQuery:"postData",data:JSON.stringify({imageUrl:s}),url:"https://web-bae.azurewebsites.net/api/GetDescription?code=i0uGk4397zccFQC3NesER15fkumKOVL4uCB34VZ1OnI_AzFuJiyetQ==&clientId=default"},l=>{if(clearInterval(i),t.value="",l){if(l.error){t.value=l.error.message;return}let c=l.description.captions[0].text;c.length<1?(console.info("No caption found :("),t.value="No caption found :("):t.value=c}else t.value="No response. Please wait 60 seconds and try again.";t.focus();var v=new Event("change",{bubbles:!0,cancelable:!1});t.dispatchEvent(v)})}catch(i){console.error("error: ",i),t.value=i.message}}))};var x=n=>{let e=n?.querySelector(".delete-asset")?.cloneNode(!0);if(!e){console.log("error getting delete asset");return}let o=e.querySelector("span");if(!o){console.log("error getting text");return}o.innerHTML="A.I. Bae",o.style.marginLeft="4px";let a=e.querySelector("i");if(!a){console.log("error getting icon");return}return a.remove(),e.style.background="#F17144",e.style.position="absolute",e.style.left="0px",e.style.bottom="0px",e},y=n=>{m=n.target};function E(n,e,o){u.contentDocument?.addEventListener(n,a=>{console.log("click"),a.target.matches(e)&&o(a)})}})();
