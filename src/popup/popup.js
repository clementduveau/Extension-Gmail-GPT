document.addEventListener('DOMContentLoaded', function () {
    // https://stackoverflow.com/a/25612056/6371582
    var objects = document.getElementsByTagName('html');
    for (var j = 0; j < objects.length; j++)
    {
        var obj = objects[j];

        var valStrH = obj.innerHTML.toString();
        var valNewH = valStrH.replace(/__MSG_(\w+)__/g, function(match, v1)
        {
            return v1 ? chrome.i18n.getMessage(v1) : "";
        });

        if(valNewH != valStrH)
        {
            obj.innerHTML = valNewH;
        }
    }
    
    var links = document.getElementsByTagName("a");
    for (var i = 0; i < links.length; i++) {
        (function () {
            var ln = links[i];
            var location = ln.href;
            ln.onclick = function () {
                chrome.tabs.create({ active: true, url: location });
            };
        })();
    }
});

document.getElementById('updater').addEventListener('submit', async function (event) {
    event.preventDefault();
    let button = document.getElementById('submit');
    let apiKey = document.getElementById('apiKey').value;

    button.setAttribute('aria-busy', 'true');

    let result;
    try {
        result = await fetch('https://api.openai.com/v1/models/text-davinci-003', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + apiKey,
            }
        });
    } catch (error) {
        console.log("Invalid key");
        console.log(error);
    }

    if (result?.ok) {
        chrome.storage.sync.set({
            apiKey: apiKey
        }, function () {
            button.classList.add('secondary');
            button.removeAttribute('aria-busy');
            button.innerText = chrome.i18n.getMessage('popupUpdateSuccess');
            setTimeout(() => {
                button.classList.remove('secondary');
                button.innerText = chrome.i18n.getMessage('popupUpdate');
            }, 2000);
        });
    } else {
        console.log(result);
        button.classList.add('secondary');
        button.removeAttribute('aria-busy');
        button.setAttribute('style', 'background-color: #f4511e');
        button.innerText = chrome.i18n.getMessage('popupUpdateFail');
        setTimeout(() => {
            button.classList.remove('secondary');
            button.removeAttribute('style');
            button.removeAttribute('style');
            button.innerText = chrome.i18n.getMessage('popupUpdate');
        }, 2000);
    }
})