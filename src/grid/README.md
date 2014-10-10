[![unstable](http://badges.github.io/stability-badges/dist/unstable.svg)](http://github.com/badges/stability-badges)

# Description

While EncoreUI was initially designed to be an AngularJS widget library, we recognize that teams will want to use a CSS layout framework. On that end, we recommend the [Grids module from Yahoo!'s Pure CSS framework](http://purecss.io/grids/) for teams to easily build out a grid or column system. We chose this lightweight framework for its emphasis on flex based layouts.

# Usage

Be sure your app includes the following line:

```
<link rel="stylesheet" href="http://yui.yahooapis.com/pure/0.5.0/grids-min.css">
```

Note that most of the grid layouts you will use will be in the context of `rxPage` inside `rxApp`. For this reason we will be using the regular grids only, and not responsive grids.

The code sample below will probably give the clearest context of how grids work. Note that the `.pure-g` also has a `clear` class attached because title containers on `rxPage` components are defaulted to float left.

You'll find that the grid components will not have borders or padding within the grid units themselves. If you need white space between grid columns, you can nest a `<div>` inside each grid unit and style the child container.