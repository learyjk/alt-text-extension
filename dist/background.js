(()=>{chrome.runtime.onMessage.addListener(function(n,a,o){if(n.contentScriptQuery=="postData")return fetch(n.url,{method:"POST",headers:{Accept:"application/json, application/xml, text/plain, text/html, *.*","Content-Type":"application/json"},body:n.data}).then(t=>t.json()).then(t=>{o(t)}).catch(t=>console.log("Error:",t)),!0});})();
