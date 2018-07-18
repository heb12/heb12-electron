# Contributing
This file gives some information about contributing code to this software. Reading this file will help you a lot while writing your contribution.

## Will Not Accept
There are some things which we will not accept. You should be aware of these because if your code falls into one of these categories, it will not be accepted. However, this does not stop you from making your own project with your own changes.

### Other books
The only books (of the Bible) that will be included in this software is the ones already in the program. No new books will be added since they did not make it into the canon (i.e. the apocrypha), or are heretic books that were written uninspired later (e.g. the book of Mormon).

2 Timothy 3:16-17
> All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness:
That the man of God may be perfect, throughly furnished unto all good works.

Galatians 1:8

>  But though we, or an angel from heaven, preach any other gospel unto you than that which we have preached unto you, let him be accursed.

### Extra Content
There are certain content which this software will provide that is not scripture. This includes commentaries, dictionaries, bible teachings, and more. The content in those must be sound Christian beliefs, in accordance to the [Heb12 belief statement](https://heb12.github.io/beliefs). Anything that defies foundational Christian teaching is not allowed into the program.

### Translations
There are a few translations that we will not include, due to them being purposely translated according to heretic beliefs. Those will not be listed here, and you must ask the lead developer whether the translations is allowable (most will).

## Things to Remember
These are some things you need to remember while you work on the code.

### Code
We do not have a set coding style, but here are some recommendations:

- All tab spacing should be 4 spaces
- Credits should not be applied to code itself (those belong in the credits file)

### JavaScript
- Variables should be lowercase, and multiple words are combined by camelCase
- Comment your code to state what it does (not how it does it, that should be obvious). Clearly state what it does, but keep it clear and concise
- `let` is preferred to `var`

Comments in JavaScript should be simple one-line comments, except for headings, which are marked the following way:

```

// -----
// This is a heading
// -----
```

### HTML
- Tab indentation should be 4 spaces
- Lowecase tags (e.g. not `<HTML>`, but `<html>`)
- All tags need to be closed
- One tag tags are closed like this: `<img src='test.png' />`

## Online Policy
This explains what content is allowed to be fetched from the Internet, and what has to be built into the program.

### Translations
Translation must be built into some kind of public API, and not hosted on one of your own servers for Heb12 exclusively. If it needs to be built into a server privately, we will need to host it ourselves.

Translations should be offline (and come with the program) when allowed. If the copyright does not permit this, then you may use a public API (as stated above).

### Commentaries
Commentaries are allowed to be accessed from a public API, as with translations. Commentaries should not be put into the program without more consideration (due to file size and copyright issues).

### Themes
Themes should be brought up in issues before they are implemented. Themes are trivial to make and should be of the highest quality. 

## Issues
Before you even work on your contribution, you should open an issue and discuss it. That way you can brainstorm with the team and other contributors about how it should be manifested.

## Credits
Credits should not be applied to the code itself, but to the credits file.

Write your credit in the `CREDITS.md` file under the "Other Contributors" heading. Put it in alphabetical order. For example, if these are the contributors:

```
## Other Contributors
- NiceLady542 (added John McArthur's commentary)
- SuperCoolGuy6719 (green theme, bookmarking feature)
- Zookeeper4 (added original Greek text)
```

And you want to add your name "OctopusArm589" for example, and you added a purple theme, then put it in like this:

```
### Other Contributors
- NiceLady542 (added John McArthur's commentary)
- OctopusArm589 (purple theme)
- SuperCoolGuy6719 (green theme, bookmarking feature)
- Zookeeper4 (added original Greek text)
```

The headings "Active Contributors" and "Significant Contributors", are not to be modified by any contributor exept for the lead developer.

You should use your GitHub username. If you would like to also include your name you may include it like this:

```
### Other Contributors
- NiceLady542 (added John McArthur's commentary)
- John Smith | OctopusArm589 (purple theme)
- SuperCoolGuy6719 (green theme, bookmarking feature)
- Zookeeper4 (added original Greek text)
```
