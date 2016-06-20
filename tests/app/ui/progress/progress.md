---
nav-title: "progress How-To"
title: "progress"
environment: nativescript
description: "Examples for using progress"
previous_url: /ApiReference/ui/progress/HOW-TO
---
# Progress
Using the progress view requires the Progress module.
<snippet id='article-require-progress-module'/>
Binding the Progress value property to a view-model property.
``` XML
<Page loaded="pageLoaded">
  {%raw%}<Progress value="{{ someProperty }}" />{%endraw%}
</Page>
```
``` JavaScript
function pageLoaded(args) {
  var page = args.object;
  page.bindingContext = { someProperty : 42 };
}
exports.pageLoaded = pageLoaded;
```
### Creating a progress view
<snippet id='article-create-progress-view'>
### Setting up the progress view
<snippet id='article-set-value'/>
