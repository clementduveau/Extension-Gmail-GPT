# Gmail GPT Extension

GMail GPT extension is a simple Chrome extension that enable Gmail to prepare reply to any email.

* Use your own API Key
* Simple button to start answering automatically

The extension add a button before the *Reply* / *Reply all* / *Forward* buttons. By clicking it, you Gmail will:

* Read the previous email
* Instruct OpenAI GPT to create an answer
* Open a reply all draft
* Paste the content from GPT

## Contributions welcomed !

Some of the cool stuff that could be added:

* i18n translation: the extension is currently in french :fr: but english would be nice :uk:
* Simpler onboarding: When no API key is provided, the extension display a disabled button that does nothing. Would be nice to open the popup on click
* Error handling: in case of an error, nothing is done. The loader keeps spinning forever. Would be nice to have a red button showing the error at least.
* Variables for Max Tokens: OpenAI charges the number of tokens (words or part of a word). A sentence is around 30-35 tokens. The hard-coded limit is at 500 right now (0,01$/email with Davinci 3). **Maybe** people would like to change this limit.
* Use simpler models: The extension uses Davinci 3, the most expensive one. [Curie is 10 times cheaper](https://openai.com/api/pricing/#faq-token:~:text=%C2%A0/%E2%80%8A1K%20tokens-,Curie,%C2%A0/%E2%80%8A1K%20tokens,-Multiple%20models%2C%20each), and could do the trick for simple tasks.
