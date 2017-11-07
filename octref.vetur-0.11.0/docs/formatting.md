# Formatting

Vetur has support for formatting embedded `html/css/scss/less/postcss/stylus/js/ts`.  

## Settings

`tabSize` and `insertSpaces` are read from VS Code config `editor.tabSize` and `editor.insertSpaces` for formatting.

Two space soft-tab is recommended for all languages.

## Formatters

Choose each language's default formatter in `vetur.format.defaultFormatter`.  
**Setting a language's formatter to `none` disables formatter for thata language.**

Current default: 

```json
"vetur.format.defaultFormatter": {
  "html": "none",
  "css": "prettier",
  "postcss": "prettier",
  "scss": "prettier",
  "less": "prettier",
  "js": "prettier",
  "ts": "prettier",
  "stylus": "stylus-supremacy"
}
```

#### prettier

Settings are read from `prettier.*`. You can install [Prettier extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) to get IntelliSense for settings, but Vetur will work without it.

**ESLint integration**: Planned, see: https://github.com/vuejs/vetur/issues/478

#### vscode-typescript

VS Code's js/ts formatter built on TypeScript language service.

Settings are read from `javascript.format.*` and `typescript.format.*`.

**Known issue**: `<script lang="ts">` are not correctly recognized as TypeScript and will use the JS formatter with JS formatter settings. See https://github.com/vuejs/vetur/issues/476

#### js-beautify-html

Alternative html formatter. Deprecated, turned off by default and will be removed soon.

Default settings are [here](https://github.com/vuejs/vetur/blob/master/server/src/modes/template/services/htmlFormat.ts). You can override them by setting `vetur.format.defaultFormatterOptions.js-beautify-html`.

```json
"vetur.format.defaultFormatterOptions": {
  "js-beautify-html": {
    // js-beautify-html settings here
  }
}
```

#### stylus-supremacy

Settings are read from `stylusSupremacy.*`. You can install [Stylus Supremacy extension](https://marketplace.visualstudio.com/items?itemName=thisismanta.stylus-supremacy) to get IntelliSense for settings, but Vetur will work without it. A useful default:

```json
{
  "stylusSupremacy.insertBraces": false,
  "stylusSupremacy.insertColons": false,
  "stylusSupremacy.insertSemicolons": false
}
```

## Plan

I plan to contribute to [reshape](https://github.com/reshape/reshape) formatter and drop js-beautify eventually.
