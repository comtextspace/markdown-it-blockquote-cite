# markdown-it-blockquote-cite

Плагин для markdown-it добавляет тег cite.

Копия плагина [bitcrowd/markdown-it-blockquote-cite](https://github.com/bitcrowd/markdown-it-blockquote-cite).

Из

```
> Quoted text here. Lorem ipsom etc
> More quoted text here. Lorem ipsom etc
> --- Ms. Cited Name-Here
```

делает

```
<blockquote>
  <p>Quoted text here. Lorem ipsum etc</p>
  <p>More quoted text here. Lorem ipsum etc</p>
  <cite>Ms. Cited Name-Here</cite>
</blockquote>
```

## Installation

With [Yarn](https://yarnpkg.com/):

```
yarn add -D @comtext/markdown-it-blockquote-cite
```

With npm

```
npm i @comtext/markdown-it-blockquote-cite
```

## Using

```js
const md = require("markdown-it")();
const mk = require("@comtext/markdown-it-blockquote-cite");

md.use(mk);

var result = md.render("> Текст цитаты");
```