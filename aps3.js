#!/usr/bin/env node

/*
====================================================================

 aps3 - app store scanning script

--------------------------------------------------------------------
Copyright (c) 2015 by Krogoth of
Ministry of Zombie Defense - http://www.mzd.org.uk/

This file is part of aps3.

aps3 is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
====================================================================
*/

var config = require('./config').config;
var program = require('commander');
var chalk = require('chalk');
var async = require('async');

console.log(chalk.red("Initialising aps3..."));

program
    .version('0.0.1')
    .option('-o, --outfile <file>', 'Filename to output csv to [config.file_output]', config.file_output)
    .option('-s, --searchterm <term>', 'Term to be searched in the stores [config.search_term]', config.search_term)
    .option('-c, --country <code>', 'ISO_3166-1_alpha-2 formatted country code [config.search_country]', config.search_country);

program
    .parse(process.argv);

runScan();

function runScan()
{
    if (!program.outfile || !program.country || !program.searchterm)
    {
        console.log("error: option '-o, --outfile <path>' argument missing");
        console.log("error: option '-s, --searchterm <term>' argument missing");
        console.log("error: option '-c, --country <code>' argument missing");
        return;
    }

    var converter = require('json-2-csv');

    async.series([
        scanAppleStore,
        scanGoogleStore
    ],
    // optional callback
    function(err, results){

        if(err)
        {
            console.log("Error while running scans: %s", err.message);
            return;
        }

        var lines = results[0];
        var length = results.length;
        for (var i = 1; i < length; i++)
        {
            Array.prototype.push.apply(lines, results[1]);
        }

        converter.json2csv(lines, genCsv);
    });

}

function scanAppleStore(callback)
{
    var s = require("searchitunes");

    s (
        {
            entity: 'software',
            country: program.country,
            term: program.searchterm,
            limit: 20,
            explicit: 'yes'
        },
        function (err, data) {
            if (err) {
                console.log (chalk.red('Search failed: %s', err.message));
                callback(err, null);
            } else {

                //console.log (data);

                var lines = [];

                var length = data.resultCount;
                for (var i = 0; i < length; i++)
                {
                    var item = data.results[i];

                    var artistName = item.artistName;
                    var bundleId = item.bundleId;
                    var description = item.description;
                    var sellerName = item.sellerName;
                    var trackName = item.trackName;
                    var trackViewUrl = item.trackViewUrl;

                    artistName = artistName.replace(/[,]/g, '.');
                    sellerName = sellerName.replace(/[,]/g, '.');

                    description = description.replace(/[,]/g, '.');
                    description = description.replace(/[\n\r]/g, ' ');

                    lines.push({
                        os: 'iOS',
                        artistName: artistName,
                        bundleId: bundleId,
                        description: description,
                        sellerName: sellerName,
                        trackName: trackName,
                        lookup: trackViewUrl
                    });
                }

                callback(null, lines);
            }
        }
    );
}

function scanGoogleStore(callback) {
    var gplay = require('google-play-scraper');

    gplay.search({
        term: program.searchterm,
        country: program.country,
        num: 50
    }).then(
        function (data) {

            //console.log(result); // "Stuff worked!"
            var lines = [];

            var length = data.length;
            for (var i = 0; i < length; i++) {
                var item = data[i];

                var artistName = item.developer;
                var bundleId = item.appId;
                var description = item.title;
                var sellerName = item.developer;
                var trackName = '';
                var trackViewUrl = item.url;

                artistName = artistName.replace(/[,]/g, '.');
                sellerName = sellerName.replace(/[,]/g, '.');

                description = description.replace(/[,]/g, '.');
                description = description.replace(/[\n\r]/g, ' ');

                lines.push({
                    os: 'Android',
                    artistName: artistName,
                    bundleId: bundleId,
                    description: description,
                    sellerName: sellerName,
                    trackName: trackName,
                    lookup: trackViewUrl
                });

            }

            callback(null, lines);

        }, function (err) {

            console.log (chalk.red('Search failed: %s', err.message));
            callback(err, null);
        }
    )
}

function genCsv(err, csv)
{
    if (err)
    {
        throw err;
    }

    console.log(chalk.red("Writing files"));

    var fs = require('fs');
    fs.writeFile(program.outfile, csv, 'utf8', function(err) {
        if(err) {
            console.log(chalk.red("%s"), err);
        } else {
            console.log(chalk.green("CSV file '%s' was created"), program.outfile);
        }
    });
}
