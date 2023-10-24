# Browser plugin for metadata

This is a chrome extension to upload url's to edu-sharing


## Web crawling

The plugin contains a form to get metadata from the generic crawler. The button GET METADATA fetches the current tab url and then send a POST request to the generic crawler in a local environment. The following is an example to get metadata:

![Form to get metadata - URL to crawl](https://github.com/openeduhub/metadata-browser-plugin/blob/add_metadata_form/docs/Fig3.png)

![Form to get metadata - URL to crawl](https://github.com/openeduhub/metadata-browser-plugin/blob/add_metadata_form/docs/Fig2.png)

## How to load and debug the web extension
In Google Chrome: open the Extensions tab, then turn "Developer mode" (1.) and "Load unpacked" (2.) as shown in ![Load extension - Chrome](https://github.com/openeduhub/metadata-browser-plugin/blob/add_metadata_form/docs/Fig4.png)

Then to debug the extension, click on the details button of the extension and select "Inspect popup". This will load the default popup html file of the extension and an inspection as a developer mode of Chrome will be open and allow you to debug the current popup as shown here:

![Debug extension - Chrome](https://github.com/openeduhub/metadata-browser-plugin/blob/add_metadata_form/docs/Fig5.png)


init
