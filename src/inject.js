const SELECTOR_ACTION_BUTTONS_LINE = '.amn';
const SELECTOR_REPLY_BUTTON = '.ams.bkH';
const SELECTOR_REPLY_ALL = '.ams.bkI';
const SELECTOR_PAGE = '.BltHke.nH.oy8Mbf';
const SELECTOR_MAIN = '[role="main"]';
const SELECTOR_PREV_EMAIL_CONTENT = '.a3s.aiL > div:first-of-type';
const SELECTOR_MAIN_EDITABLE = '.Am.aO9.Al.editable';

const RETRY_TIMEOUT_MS = 500;

const MODEL_TEMPERATURE = 0.3;
const MODEL_MAX_TOKENS = 500; // As a variable ? 35 tokens are like a sentence, maybe something like "how many sentences max ? Around 14 sentences cost 0,01 $"
// WARNING, prompt AND completions are billed. Reading a long email is expensive.
// Models are limited in tokens: Davinci accepts 4096, and the others accept 2048

let apiKey = null;
let model = 'text-davinci-003';

chrome.storage.sync.get({
	apiKey: null,
	model: 'text-davinci-003'
}, function (keys) {
	apiKey = keys.apiKey;
	model = keys.model;
});

chrome.storage.onChanged.addListener(function (changes, namespace) {
	apiKey = changes.apiKey.newValue;
	model = changes.model.newValue;
	//chrome.tabs.reload(); // Maybe just refresh buttons in future version ?
});

let actionLineObserver = new MutationObserver(mutations => {
	if (document.querySelector(SELECTOR_ACTION_BUTTONS_LINE)) {
		addActionButton(document.querySelector(SELECTOR_ACTION_BUTTONS_LINE));
	}
});


if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', handleContentLoaded);
}
else {
	handleContentLoaded();
}

function handleContentLoaded() {
	if (!document.body.contains(document.querySelector(SELECTOR_MAIN))) {
		setTimeout(() => handleContentLoaded(), RETRY_TIMEOUT_MS);
		return;
	}

	let actionLine = document.querySelector(SELECTOR_ACTION_BUTTONS_LINE);
	if (actionLine) {
		addActionButton(actionLine);
	}
	actionLineObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeOldValue: true, characterDataOldValue: true, characterData: true });
}

function addActionButton(node) {
	if (node.querySelector('.ams.gpt-button')) {
		return;
	}

	let button = document.createElement('span');

	button.className = (apiKey === null ? 'ams gpt-button disabled' : 'ams gpt-button normal');
	button.innerText = (apiKey === null ? chrome.i18n.getMessage('notConfigured') : chrome.i18n.getMessage('answerWithGPT'));

	node.prepend(button);

	button.onclick = function () { buttonClick(button); }
}

async function buttonClick(button) {
	if (apiKey === null) { // Make a background script to open popup https://stackoverflow.com/questions/5544256/how-to-programmatically-open-a-chrome-extension-popup-window-from-background-htm
		return;
	}
	button.onclick = null;

	// <div class="lds-ring"><div></div><div></div><div></div><div></div></div> is the loading circle.
	let loader = document.createElement('div');
	loader.className = 'lds-ring';
	loader.innerHTML = '<div></div><div></div><div></div><div></div>';
	button.classList.replace('normal', 'loading');
	button.prepend(loader)

  let emailContent = htmlToPlainText(document.querySelector(SELECTOR_PREV_EMAIL_CONTENT).innerHTML);

  // Ask for a summary from the user
  let replySummary = window.prompt(chrome.i18n.getMessage('replySummaryPrompt'));

  let prompt;
  if (replySummary) { // User provided a summary for the reply.
    prompt = chrome.i18n.getMessage('instructionsWithSummary', [emailContent, replySummary])
  } else { // User did NOT provide a summary for the reply.
    prompt = chrome.i18n.getMessage('instructions', [emailContent])
  }

	let result;
	try {
		result = await (await fetch('https://api.openai.com/v1/completions', { // Streaming would be smooth too but more difficult to handle
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + apiKey,
			},
			body: JSON.stringify({
				model: model,
				prompt: prompt,
				temperature: MODEL_TEMPERATURE,
				max_tokens: MODEL_MAX_TOKENS // OpenAI API check current tokens + max tokens and if it is greater than the accepted max for models, it just throw an error. A tokenizer would be great to just check that it is not too much
			})

		})).json();
	} catch (error) {
		console.log(error);
	}

	if (result?.choices) {
		let answer = result.choices[0].text;

		let replyButton = (document.querySelector(SELECTOR_REPLY_ALL) ? document.querySelector(SELECTOR_REPLY_ALL) : document.querySelector(SELECTOR_REPLY_BUTTON));
		replyButton.click();

		function waitForElm(selector) {
			return new Promise(resolve => {
				if (document.querySelector(selector)) {
					return resolve(document.querySelector(selector));
				}

				const observer = new MutationObserver(mutations => {
					if (document.querySelector(selector)) {
						resolve(document.querySelector(selector));
						observer.disconnect();
					}
				});

				observer.observe(document.body, {
					childList: true,
					subtree: true
				});
			});
		}
		waitForElm(SELECTOR_MAIN_EDITABLE).then(() => {
			// refactorGPTAnswer
			answer = answer.substring(1); // GPT starts with at least one escapes
			answer = answer.replace(new RegExp('\r?\n', 'g'), '<br />');
			document.querySelector(SELECTOR_MAIN_EDITABLE).insertAdjacentHTML('afterbegin', answer);
		})
	} else {
		// display error
		document.querySelector('div.lds-ring').remove(); // Not tested
		button.classList.replace('loading', 'disabled');
		button.innerText = (result.error.code === null ? "Error in completion" : result.error.code);
		button.onclick = function () { buttonClick(button); }

	}
}

function refactorGPTAnswer(text) {
	// Delete firsts escape lines with regex, sometimes one, sometimes two lines
	// Remove [Votre nom] / [Your name] if found at the end
	// Replace \n with <br />. See Regex already used
}

/*
FROM https://github.com/EDMdesigner/textversionjs
Convert HTML to plain text natively
*/

var populateChar = function (ch, amount) {
	var result = "";
	for (var i = 0; i < amount; i += 1) {
		result += ch;
	}
	return result;
};

function htmlToPlainText(htmlText, styleConfig) {

	// define default styleConfig
	var linkProcess = null;
	var imgProcess = null;
	var headingStyle = "underline"; // hashify, breakline
	var listStyle = "indention"; // indention, linebreak
	var uIndentionChar = "-";
	var listIndentionTabs = 3;
	var oIndentionChar = "-";
	var keepNbsps = false;

	// or accept user defined config
	if (!!styleConfig) {
		if (typeof styleConfig.linkProcess === "function") {
			linkProcess = styleConfig.linkProcess;
		}
		if (typeof styleConfig.imgProcess === "function") {
			imgProcess = styleConfig.imgProcess;
		}
		if (!!styleConfig.headingStyle) {
			headingStyle = styleConfig.headingStyle;
		}
		if (!!styleConfig.listStyle) {
			listStyle = styleConfig.listStyle;
		}
		if (!!styleConfig.uIndentionChar) {
			uIndentionChar = styleConfig.uIndentionChar;
		}
		if (!!styleConfig.listIndentionTabs) {
			listIndentionTabs = styleConfig.listIndentionTabs;
		}
		if (!!styleConfig.oIndentionChar) {
			oIndentionChar = styleConfig.oIndentionChar;
		}
		if (!!styleConfig.keepNbsps) {
			keepNbsps = styleConfig.keepNbsps;
		}
	}

	var uIndention = populateChar(uIndentionChar, listIndentionTabs);

	// removel all \n linebreaks
	var tmp = String(htmlText).replace(/\n|\r/g, " ");

	// remove everything before and after <body> tags including the tag itself
	const bodyEndMatch = tmp.match(/<\/body>/i);
	if (bodyEndMatch) {
		tmp = tmp.substring(0, bodyEndMatch.index);
	}
	const bodyStartMatch = tmp.match(/<body[^>]*>/i);
	if (bodyStartMatch) {
		tmp = tmp.substring(bodyStartMatch.index + bodyStartMatch[0].length, tmp.length);
	}

	// remove inbody scripts and styles
	tmp = tmp.replace(/<(script|style)( [^>]*)*>((?!<\/\1( [^>]*)*>).)*<\/\1>/gi, "");

	// remove all tags except that are being handled separately
	tmp = tmp.replace(/<(\/)?((?!h[1-6]( [^>]*)*>)(?!img( [^>]*)*>)(?!a( [^>]*)*>)(?!ul( [^>]*)*>)(?!ol( [^>]*)*>)(?!li( [^>]*)*>)(?!p( [^>]*)*>)(?!div( [^>]*)*>)(?!td( [^>]*)*>)(?!br( [^>]*)*>)[^>\/])[^<>]*>/gi, "");

	// remove or replace images - replacement texts with <> tags will be removed also, if not intentional, try to use other notation
	tmp = tmp.replace(/<img([^>]*)>/gi, function (str, imAttrs) {
		var imSrc = "";
		var imAlt = "";
		var imSrcResult = (/src="([^"]*)"/i).exec(imAttrs);
		var imAltResult = (/alt="([^"]*)"/i).exec(imAttrs);
		if (imSrcResult !== null) {
			imSrc = imSrcResult[1];
		}
		if (imAltResult !== null) {
			imAlt = imAltResult[1];
		}
		if (typeof (imgProcess) === "function") {
			return imgProcess(imSrc, imAlt);
		}
		if (imAlt === "") {
			return "![image] (" + imSrc + ")";
		}
		return "![" + imAlt + "] (" + imSrc + ")";
	});


	function createListReplaceCb() {
		return function (match, listType, listAttributes, listBody) {
			var liIndex = 0;
			if (listAttributes && /start="([0-9]+)"/i.test(listAttributes)) {
				liIndex = (/start="([0-9]+)"/i.exec(listAttributes)[1]) - 1;
			}
			var plainListItem = "<p>" + listBody.replace(/<li[^>]*>(((?!<li[^>]*>)(?!<\/li>).)*)<\/li>/gi, function (str, listItem) {
				var actSubIndex = 0;
				var plainListLine = listItem.replace(/(^|(<br \/>))(?!<p>)/gi, function () {
					if (listType === "o" && actSubIndex === 0) {
						liIndex += 1;
						actSubIndex += 1;
						return "<br />" + liIndex + populateChar(oIndentionChar, listIndentionTabs - (String(liIndex).length));
					}
					return "<br />" + uIndention;
				});
				return plainListLine;
			}) + "</p>";
			return plainListItem;
		};
	}

	// handle lists
	if (listStyle === "linebreak") {
		tmp = tmp.replace(/<\/?ul[^>]*>|<\/?ol[^>]*>|<\/?li[^>]*>/gi, "\n");
	}
	else if (listStyle === "indention") {
		while (/<(o|u)l[^>]*>(.*)<\/\1l>/gi.test(tmp)) {
			tmp = tmp.replace(/<(o|u)l([^>]*)>(((?!<(o|u)l[^>]*>)(?!<\/(o|u)l>).)*)<\/\1l>/gi, createListReplaceCb());
		}
	}

	// handle headings
	if (headingStyle === "linebreak") {
		tmp = tmp.replace(/<h([1-6])[^>]*>([^<]*)<\/h\1>/gi, "\n$2\n");
	}
	else if (headingStyle === "underline") {
		tmp = tmp.replace(/<h1[^>]*>(((?!<\/h1>).)*)<\/h1>/gi, function (str, p1) {
			return "\n&nbsp;\n" + p1 + "\n" + populateChar("=", p1.length) + "\n&nbsp;\n";
		});
		tmp = tmp.replace(/<h2[^>]*>(((?!<\/h2>).)*)<\/h2>/gi, function (str, p1) {
			return "\n&nbsp;\n" + p1 + "\n" + populateChar("-", p1.length) + "\n&nbsp;\n";
		});
		tmp = tmp.replace(/<h([3-6])[^>]*>(((?!<\/h\1>).)*)<\/h\1>/gi, function (str, p1, p2) {
			return "\n&nbsp;\n" + p2 + "\n&nbsp;\n";
		});
	}
	else if (headingStyle === "hashify") {
		tmp = tmp.replace(/<h([1-6])[^>]*>([^<]*)<\/h\1>/gi, function (str, p1, p2) {
			return "\n&nbsp;\n" + populateChar("#", p1) + " " + p2 + "\n&nbsp;\n";
		});
	}

	// replace <br>s, <td>s, <divs> and <p>s with linebreaks
	tmp = tmp.replace(/<br( [^>]*)*>|<p( [^>]*)*>|<\/p( [^>]*)*>|<div( [^>]*)*>|<\/div( [^>]*)*>|<td( [^>]*)*>|<\/td( [^>]*)*>/gi, "\n");

	// replace <a href>b<a> links with b (href) or as described in the linkProcess function
	tmp = tmp.replace(/<a[^>]*href="([^"]*)"[^>]*>([^<]+)<\/a[^>]*>/gi, function (str, href, linkText) {
		if (typeof linkProcess === "function") {
			return linkProcess(href, linkText);
		}
		return " [" + linkText + "] (" + href + ") ";
	});

	// remove whitespace from empty lines excluding nbsp
	tmp = tmp.replace(/\n[ \t\f]*/gi, "\n");

	// remove duplicated empty lines
	tmp = tmp.replace(/\n\n+/gi, "\n");

	if (keepNbsps) {
		// remove duplicated spaces including non braking spaces
		tmp = tmp.replace(/( |\t)+/gi, " ");
		tmp = tmp.replace(/&nbsp;/gi, " ");
	} else {
		// remove duplicated spaces including non braking spaces
		tmp = tmp.replace(/( |&nbsp;|\t)+/gi, " ");
	}

	// remove line starter spaces
	tmp = tmp.replace(/\n +/gi, "\n");

	// remove content starter spaces
	tmp = tmp.replace(/^ +/gi, "");

	// remove first empty line
	while (tmp.indexOf("\n") === 0) {
		tmp = tmp.substring(1);
	}

	// put a new line at the end
	if (tmp.length === 0 || tmp.lastIndexOf("\n") !== tmp.length - 1) {
		tmp += "\n";
	}

	return tmp;
}
