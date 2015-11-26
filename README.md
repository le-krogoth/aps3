aps3
====

**aps3** (c) 2015 by [Krogoth](https://twitter.com/le_krogoth) of [Ministry of Zombie Defense](http://www.mzd.org.uk/)

## Introduction ##

**aps3** consists of a script to regularly scan and report on the results based on a search on the defined search term.
You may search for your copyrights or trademarks to find pirated software, as example.

Currently **aps3** knows how to scan the Apple AppStore and the Google Play store. More stores can be easily added.

And just in case you wonder, **aps3** stands for APp Store Scanning Script.

## Prerequisites ##

No special requirements needed.

## Installation ##

The installation is quite straightforward:

* Clone this git repository to your local machine with:

```
git clone https://github.com/le-krogoth/aps3.git
```

* Run the following command in the root directory to install all dependencies.

```
npm install
```

## Configuration ##

* Change the settings in the config.js file to your liking.

## Run ##

* Run the scan process like this. If no parameter is given, the scan script takes the configuration from the config file.

```
./aps3.js

// or when using command line configurations

./aps3.js --country ES

// run scan.js with the help flag to learn more about the commandline

./scan.js --help
```

If you want to run the scan regularly, you could add these lines to your crontab file
as root. *Just don't forget to change the aps3user and your path accordingly*.

```
07 8    * * *   aps3user   cd /path/to/aps3 && aps3.js
```


## Report ##

The generated report is in CSV format (to be imported in some tool like, say, Splunk). The field names are named 
after the fieldnames in the Apple AppStore. The Google Play Store meanings are in parantheses:

* **os**: The store it was found in (currently iOS and Android as options)
* **artistName**: Who publises the app (developer)
* **bundleId**: The unique identification of the app (appId)
* **description**: What could that be... (title, since there is no description in standard search)
* **sellerName**: Who sells the app, must not be the same on Apple AppStore as artistName (developer)
* **trackName**: (Empty on Google Play Store)
* **lookup**: Link to app (url)
