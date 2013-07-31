"use strict";

/**
 * Called when no 'elements' parameter was passed in the URL string.  This use case results in an error.
 *
 * @param req
 * @param res
 */
exports.generateNothing = function (req, res) {
    var responseObject = {};
    responseObject.error = "No elements were selected.  Please drag one or more elements into the box at the top of the page.";
    res.send(responseObject);
};

/**
 * Generates domain name possibilities consisting of one to two user-selected elements.
 *
 * @param req
 * @param res
 */
exports.generate = function (req, res) {
    var responseObject = {};
    // Sanitize input, allowing only letters, numbers, and dashes (plus commas and colons as token separators)
    var elementsArray = req.params.elements.toLowerCase().replace(/[^-:,a-z0-9]/g, "").split(",");
    var prefixes, suffixes;
    // Get all possibilities for the first element
    try {
        prefixes = generateForElement(elementsArray[0]);
    } catch (err) {
        responseObject.error = err;
        res.send(responseObject);
    }
    // If there is a second element, then get all possibilities for it.
    if (elementsArray.length > 1) {
        try {
            suffixes = generateForElement(elementsArray[1]);
        } catch (err) {
            responseObject.error = err;
            res.send(responseObject);
        }
    }
    // Build result set using the available possibilities pools (i.e. one or two)
    responseObject.results = [];
    if ((prefixes && prefixes.length > 0) && (!suffixes || suffixes.length === 0)) {
        // Build results using only the first element
        responseObject.results = responseObject.results.concat(prefixes);
    } else if ((suffixes || suffixes.length > 0) && (!prefixes || prefixes.length === 0)) {
        // Build results using only the second element (this should be an unreachable use case)
        responseObject.results = responseObject.results.concat(suffixes);
    } else if (prefixes && prefixes.length > 0 && suffixes && suffixes.length > 0) {
        // Build combinations from the pools of possible prefixes *and* suffixes
        for (var prefixIndex = 0; prefixIndex < prefixes.length; prefixIndex++) {
            for (var suffixIndex = 0; suffixIndex < suffixes.length; suffixIndex++) {
                responseObject.results.push(prefixes[prefixIndex] + suffixes[suffixIndex]);
            }
        }
        // Shuffle the results, and limit them to 100
        responseObject.results.sort(function () {
            return 0.5 - Math.random();
        });
        if(responseObject.results.length > 100) { responseObject.results.length = 100; }
    }
    res.send(responseObject);
};

/**
 * Private function called by 'generate' to generate possibilities for one particular element.
 *
 * @param element
 * @returns {Array}
 */
function generateForElement(element) {
    var results = [];
    // TODO: For elements without inputs, switch to static arrays declared outside of this function.
    // TODO: For elements that do take inputs, switch to external helper functions.
    // TODO: Add elements for 'Catchy Words', 'Random Words', more?
    if (element === "nouns") {
        results = ["mother", "father", "sister", "brother"];
    } else if (element === "verbs") {
        results = ["run", "walk", "crawl", "fly"];
    } else if (element === "adjectives") {
        results = ["big", "small", "fast", "slow"];
    } else if (element === "adverbs") {
        results = ["quickly", "poorly", "strongly", "weakly"];
    } else if (element.indexOf("exactword") !== -1) {
        if (element.split(":").length < 2) {
            throw "No text was entered in the 'Exact Word' element.  Please type a word in the text box that you would like to see included verbatim in your results.";
        } else {
            results = [ element.split(":")[1] ];
        }
    } else if (element.indexOf("similarwords") !== -1) {
        if (element.split(":").length < 2) {
            throw "No text was entered in the 'Similar Words' element.  Please type a word in the text box for which you would like to see similar words included in your results.";
        } else {
            results = [ element.split(":")[1].toUpperCase() ];
        }
    }
    return results;
}