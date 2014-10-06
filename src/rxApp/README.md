[![unstable](http://badges.github.io/stability-badges/dist/unstable.svg)](http://github.com/badges/stability-badges)

# Description

This component is responsible for creating the HTML necessary for a common Encore layout. It builds out the main navigation, plus breadcrumbs and page titles.

# Usage

For apps that want to use the default Encore navigation, usage is pretty simple. In your index.html file, add the `rx-app` directive inside your app:

    <body ng-app="myApp">
        <rx-app>
            <ng-view></ng-view>
        </rx-app>
    </body>

By including `ng-view`, your view content will be added inside the directive. This makes setting up views for each page much simpler, since you don't have to include `rx-app` in each view.

Inside your view, you'll likely want to use `rx-page` to wrap your content. See the `rx-page` docs for more information on this.

# rxApp Navigation

Left-hand navigation is included as part of the app template. There are many options to control the navigation from an app level, as outlined with the following.

Note: With the current set up, some app-specific menu items are defined in Encore-UI. While it's preferred to keep app-specific details outside of Encore-UI, because some top-level navigation is accessible from any app, it's important to store that information in a common location inside Encore-UI.

## Accessing route information

Sometimes it's helpful to have the current route information available for menu items. For example, re-using the current params for path building.

To help with this, $route is exposed on the scope of all menu items. [`$route` provides many details on the current view](http://devdocs.io/angular/ngroute.$route), including the ability to access the current controller and scope for the view.

To see this in action, check out the 'childVisibility' property for Account-level Tool in `encoreNav`.

## Accessing properties on $rootScope

If you have a property available on the `$rootScope` of your app that the menu data needs to access, [you can reference `$rootScope` via `$root`](http://stackoverflow.com/questions/22216441/what-is-the-difference-between-scope-root-and-rootscope-angular-js). See the demo for an example of this.

## Dynamically updating the menu

By default, rxApp will create the navigation menu based on the routes defined in the 'encoreNav' value. This menu is built using the rxAppRoutes service.

To update a route, use the `setRouteByKey` function on the rxAppRoutes service:

    rxAppRoutes.setRouteByKey('myKey', {
        linkText: 'myUpdatedRoute'
    })

You would normally either set this in your app's `.run` function, or in a specific controller.

## Custom Menus

If you'd like to create an entirely custom menu, you can pass that data in to the `rx-app` directive via the `menu` attribute. View the demo for an example of this.

# Sub-directives

## rx-page

You'll likely want to use `rx-page` inside your template view. For example, inside a 'myView.html' file:

    <rx-page title="'Example Page'">
        Here is my content
    </rx-page>

`rx-page` is used to create a common wrapper for specific page views. It automatically adds the breadcrumbs and page title/subtitle (if specified), along with the correct styling.

Both the `title` and `subtitle` attributes accept an Angular expression, which can be a string (shown in the previous example) or a scope property. This string/property can accept other expressions, enabling you to build custom titles. The demo has an example of this usage.

### .page-actions

A `page-actions` class is provided by rx-app to easily add custom page actions to the top right of a page. For example:

    <rx-page title="'Servers Overview'">
        <div class="page-actions">
            <a href="/create" class="link-action msg-action">Create New Server</a>
        </div>
        <img src="http://cdn.memegenerator.net/instances/500x/48669250.jpg" alt="Look at all these servers there are so many"
    </rx-page>

## rx-app-nav and rx-app-nav-item

These two directives are responsible for creating the menu in the left sidebar. They're not intended for use outside of the rx-app template code.

# Common Styling

The rxApp common.less file defines many base CSS rules and classes for app use. Included in this is [normalize.css](http://necolas.github.io/normalize.css/). This helps create a consistent starting point for styles across all browsers.

As mentioned, several classes are included for utility use in common.less. The [Encore-UI styleguide](http://rackerlabs.github.io/encore-ui/styleguide/rxApp-common.html) is the best place to read documentation on these classes.

## Fonts

The Encore-UI default font is Roboto. This is used for all text on the page and is loaded via Google Fonts. Be sure you app includes the following line:

```
<link href="https://fonts.googleapis.com/css?family=Roboto:400,100,100italic,300,300italic,400italic,700,700italic" rel="stylesheet" type="text/css" />
```
