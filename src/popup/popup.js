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

chrome.storage.sync.get({ model: 'text-davinci-003' }, function(keys) {
    document.getElementById('model').value = keys.model;
});

document.getElementById('apiUpdater').addEventListener('submit', async function (event) {
    event.preventDefault();
    let button = document.getElementById('submit');
    let apiKeyInput = document.getElementById('apiKey');
    let apiKey = apiKeyInput.value;
    
    button.setAttribute('aria-busy', 'true');

    let result;
    try {
        result = await fetch('https://api.openai.com/v1/models', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + apiKey,
            }
        });
    } catch (error) {
        console.log(error);
    }
    
    if (result?.ok) {
        chrome.storage.sync.set({
            apiKey: apiKey
        }, function () {
            apiKeyInput.setAttribute('aria-invalid','false');
            button.classList.add('secondary');
            button.removeAttribute('aria-busy');
            button.innerText = chrome.i18n.getMessage('popupUpdateSuccess');
            setTimeout(() => {
                button.classList.remove('secondary');
                apiKeyInput.removeAttribute('aria-invalid');
                button.innerText = chrome.i18n.getMessage('popupUpdate');
            }, 2000);
        });
    } else {
        console.log(result);
        apiKeyInput.setAttribute('aria-invalid','true');
        button.classList.add('secondary');
        button.removeAttribute('aria-busy');
        button.setAttribute('style', 'background-color: #f4511e');
        button.innerText = chrome.i18n.getMessage('popupUpdateFail');
        setTimeout(() => {
            apiKeyInput.removeAttribute('aria-invalid');
            button.classList.remove('secondary');
            button.removeAttribute('style');
            button.innerText = chrome.i18n.getMessage('popupUpdate');
        }, 2000);
    }
});

document.getElementById('model').addEventListener('change', function (event) {
    let selectedModelInput = document.getElementById('model');
    let selectedModel = selectedModelInput.value;

    chrome.storage.sync.set({
        model: selectedModel
    }, function() {
        selectedModelInput.setAttribute('aria-invalid', 'false');
        setTimeout(() => {
            selectedModelInput.removeAttribute('aria-invalid');
        }, 2000);
    });
})