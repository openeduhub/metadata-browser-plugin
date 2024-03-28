# Browser plugin for metadata

This is a chrome extension to upload url's to edu-sharing


## Web crawling

The plugin contains the WLO form to get metadata from the generic crawler. The button GET METADATA fetches the current tab url and then send a POST request to the generic crawler. The following is an example to get metadata in the WLO form:

![Form to get metadata - URL to crawl](https://github.com/openeduhub/metadata-browser-plugin/blob/add_metadata_form/docs/F7_WLO.png)

And here the Intended User Role and Kewords are mapped from the generic crawler response to the WLO form.
![Form to get metadata - URL to crawl](https://github.com/openeduhub/metadata-browser-plugin/blob/add_metadata_form/docs/F4_WLO.png)

The base url is: 
[Base url](https://redaktion.openeduhub.net/edu-sharing/components/embed/mds?set=mds_oeh&group=wlo_upload_content&data=)
then following the data flag there should be appended the JSON string encoded using the metadata fields described in: 
[Base url](https://docs.google.com/spreadsheets/d/1X9aXFkWv5tjEYzf8i1Ki23sadh4ABqi8gURMbuPXpBM/edit?usp=sharing)

## How to load and debug the web extension in Chrome
In Google Chrome: open the Extensions tab, then turn "Developer mode" (1.) and "Load unpacked" (2.) as shown in ![Load extension - Chrome](https://github.com/openeduhub/metadata-browser-plugin/blob/add_metadata_form/docs/Fig4.png)

Then to debug the extension, click on the details button of the extension and select "Inspect popup". This will load the default popup html file of the extension and an inspection as a developer mode of Chrome will be open and allow you to debug the current popup as shown here:

![Debug extension - Chrome](https://github.com/openeduhub/metadata-browser-plugin/blob/add_metadata_form/docs/Fig5.png)


## How to load and debug the web extension in Firefox
First type `about:debugging#/setup` into the firefox url field as shown in the following image:
![Debug extension - Firefox](https://github.com/openeduhub/metadata-browser-plugin/blob/add_metadata_form/docs/Fig7.png)

Then click on `This Firefox` button and then click on `Load temporary add-on` button:
![Load extension - Firefox](https://github.com/openeduhub/metadata-browser-plugin/blob/add_metadata_form/docs/Fig8.png)

And select any file of this folder when you extracted into your machine. Then it should appear something like this:

![Load extension - Firefox](https://github.com/openeduhub/metadata-browser-plugin/blob/add_metadata_form/docs/Fig6.png)

Now you can use the extension and its recommended to pin the extension into the Toolbar with the option `Pin to toolbar` option of the menu of extension in Firefox.
