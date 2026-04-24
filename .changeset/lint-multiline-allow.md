---
'@dryui/lint': patch
---

`hasAllowComment` now walks back through CSS continuation lines and also accepts allow markers placed inline before the violation on the same line. Previously, multi-line declarations like `box-shadow:\n\tinset 0 1px 0 ...,\n\tinset 0 -1px 0 ...;` ignored a `/* dryui-allow inset-shadow */` written above the property, because the property declarator and the matched `inset` keywords sat on different lines. Trailing CSS comments no longer mask the `;` / `{` / `}` terminator that gates which declaration an allow comment applies to.
