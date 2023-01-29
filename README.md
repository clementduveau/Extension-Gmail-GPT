# Gmail GPT Extension

GMail GPT extension is a simple Chrome extension that enable Gmail to prepare reply to any email.
It is available in French :fr: and in English :uk:

* Use your own API Key
* Simple button to start answering automatically

The extension add a button before the *Reply* / *Reply all* / *Forward* buttons. By clicking it, you Gmail will:

* Read the previous email
* Instruct OpenAI GPT to create an answer
* Open a reply all draft
* Paste the content from GPT

## Contributions welcomed !

Some of the cool stuff that could be added:

* Simpler onboarding: for muggles, onboarding is not documented ("Where to find your API Key ?") and therefore difficult to follow.
* Display popup on click: When no API key is provided, the extension display a disabled button that does nothing. Would be nice to open the popup on click
* i18n translation: any new translation is welcomed
* Error handling: in case of an error, nothing happens. The loader keeps spinning forever. Would be nice to have a red button showing the error at least.
* Variables for Max Tokens: OpenAI charges the number of tokens (word or part of a word). A sentence is around 30-35 tokens. The hard-coded limit is at 500 right now (0,01$/email with Davinci 3). **Maybe** people would like to change this limit.
* Use simpler models: The extension uses Davinci 3, the most expensive one. [Curie is 10 times cheaper](https://openai.com/api/pricing/#faq-token:~:text=%C2%A0/%E2%80%8A1K%20tokens-,Curie,%C2%A0/%E2%80%8A1K%20tokens,-Multiple%20models%2C%20each), and could do the trick for simple tasks.
