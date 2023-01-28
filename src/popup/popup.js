document.addEventListener('DOMContentLoaded', function () {
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

// check content validity

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
            button.innerText = "Mis à jour !";
            setTimeout(() => {
                button.classList.remove('secondary');
                button.innerText = "Mettre à jour";
            }, 2000);
        });
    } else {
        console.log(result);
        button.classList.add('secondary');
        button.removeAttribute('aria-busy');
        button.setAttribute('style', 'background-color: #f4511e');
        button.innerText = "Clé invalide !";
        setTimeout(() => {
            button.classList.remove('secondary');
            button.removeAttribute('style');
            button.removeAttribute('style');
            button.innerText = "Mettre à jour";
        }, 2000);
    }
})