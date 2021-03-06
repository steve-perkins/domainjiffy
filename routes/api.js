"use strict";

var dns = require("dns"),
    natural = require("natural"),
    Q = require("q");

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
    // Sanitize input, allowing only letters, numbers, and dashes (plus commas and colons as token separators)
    var elementsArray = req.params.elements.toLowerCase().replace(/[^-:,a-z0-9]/g, "").split(",");

    // Generate options for the first element (i.e. "prefix")
    return generateForElement(elementsArray[0])
        .then(function (prefixes) {
            // Generate options for the second element (i.e. "suffix").  Resulting array will be empty if there was no second element selected.
            return generateForElement(elementsArray.length > 1 ? elementsArray[1] : null)
                .then(function (suffixes) {
                    var deferred = Q.defer();
                    var responseObject = {};
                    responseObject.results = [];
                    var convertBasenamesToResults = function (basenames) {
                        var results = basenames.map(function (basename) {
                            var result = {};
                            result.basename = basename;
                            return result;
                        });
                        return results;
                    };
                    if ((prefixes && prefixes.length > 0) && (!suffixes || suffixes.length === 0)) {
                        // Build results using only the first element
                        responseObject.results = responseObject.results.concat(convertBasenamesToResults(prefixes));

                    } else if ((!prefixes || prefixes.length <= 0) && (suffixes && suffixes.length > 0)) {
                        // Build results using only the second element (this should be an unreachable use case)
                        responseObject.results = responseObject.results.concat(convertBasenamesToResults(suffixes));

                    } else if (prefixes && prefixes.length > 0 && suffixes && suffixes.length > 0) {
                        // Build combinations from the pools of possible prefixes *and* suffixes
                        var combinations = [];
                        for (var prefixIndex = 0; prefixIndex < prefixes.length; prefixIndex++) {
                            for (var suffixIndex = 0; suffixIndex < suffixes.length; suffixIndex++) {
                                combinations.push(prefixes[prefixIndex] + suffixes[suffixIndex]);
                            }
                        }
                        responseObject.results = responseObject.results.concat(convertBasenamesToResults(combinations));
                    }
                    // Shuffle the results, and limit them to 50 before sending them with the HTTP response.
                    responseObject.results.sort(function () {
                        return 0.5 - Math.random();
                    });
                    if (responseObject.results.length > 50) {
                        responseObject.results.length = 50;
                    }
                    deferred.resolve(responseObject);
                    return deferred.promise;
                }).then(function (responseObject) {
                    // Check DNS for the ".com" version of each name as a loose test of whether it's in use.
                    var promises = responseObject.results.map(function (result) {
                        var deferred = Q.defer();
                        dns.resolve4(result.basename + ".com", function(err, lookup) {
                            result.dotComInUse = (!err && lookup && lookup.length > 0) ? true : false;
                            deferred.resolve(result);
                        });
                        return deferred.promise;
                    });
                    // Return the results via the HTTP response.
                    return Q.all(promises).then(function (results) {
                        responseObject.results = results;
                        res.send(responseObject);
                    });
                });
        }); // end of "function(prefixes)" block
};

/**
 * Private function called by 'generate' to generate possibilities for one particular element.
 *
 * @param element
 * @returns {Q.promise}
 */
function generateForElement(element) {

    var deferred = Q.defer();

    if (element === "nouns") {
        // Common nouns
        deferred.resolve(["time", "year", "people", "way", "day", "man", "thing", "woman", "life", "child", "world", "school", "state", "family", "student", "group", "country", "problem", "hand", "part", "place", "case", "week", "company", "system", "program", "question", "work", "government", "number", "night", "point", "home", "water", "room", "mother", "area", "money", "story", "fact", "month", "lot", "right", "study", "book", "eye", "job", "word", "business", "issue", "side", "kind", "head", "house", "service", "friend", "father", "power", "hour", "game", "line", "end", "member", "law", "car", "city", "community", "name", "president", "team", "minute", "idea", "kid", "body", "information", "back", "parent", "face", "others", "level", "office", "door", "health", "person", "art", "war", "history", "party", "result", "change", "morning", "reason", "research", "girl", "guy", "moment", "air", "teacher", "force", "education"]);

    } else if (element === "verbs") {
        // Common verbs
        deferred.resolve(["be", "have", "do", "say", "go", "can", "get", "would", "make", "know", "will", "think", "take", "see", "come", "could", "want", "look", "use", "find", "give", "tell", "work", "may", "should", "call", "try", "ask", "need", "feel", "become", "leave", "put", "mean", "keep", "let", "begin", "seem", "help", "talk", "turn", "start", "might", "show", "hear", "play", "run", "move", "like", "live", "believe", "hold", "bring", "happen", "must", "write", "provide", "sit", "stand", "lose", "pay", "meet", "include", "continue", "set", "learn", "change", "lead", "understand", "watch", "follow", "stop", "create", "speak", "read", "allow", "add", "spend", "grow", "open", "walk", "win", "offer", "remember", "love", "consider", "appear", "buy", "wait", "serve", "die", "send", "expect", "build", "stay", "fall", "cut", "reach", "kill", "remain"]);

    } else if (element === "adjectives") {
        // Common adjectives
        deferred.resolve(["other", "new", "good", "high", "old", "great", "big", "American", "small", "large", "national", "young", "different", "black", "long", "little", "important", "political", "bad", "white", "real", "best", "right", "social", "only", "public", "sure", "low", "early", "able", "human", "local", "late", "hard", "major", "better", "economic", "strong", "possible", "whole", "free", "military", "true", "federal", "international", "full", "special", "easy", "clear", "recent", "certain", "personal", "open", "red", "difficult", "available", "likely", "short", "single", "medical", "current", "wrong", "private", "past", "foreign", "fine", "common", "poor", "natural", "significant", "similar", "hot", "dead", "central", "happy", "serious", "ready", "simple", "left", "physical", "general", "environmental", "financial", "blue", "democratic", "dark", "various", "entire", "close", "legal", "religious", "cold", "final", "main", "green", "nice", "huge", "popular", "traditional", "cultural"]);

    } else if (element === "adverbs") {
        // Common adverbs
        deferred.resolve(["up", "so", "out", "just", "now", "how", "then", "more", "also", "here", "well", "only", "very", "even", "back", "there", "down", "still", "in", "as", "to", "when", "never", "really", "most", "on", "why", "about", "over", "again", "where", "right", "off", "always", "today", "all", "far", "long", "away", "yet", "often", "ever", "however", "almost", "later", "much", "once", "least", "ago", "together", "around", "already", "enough", "both", "maybe", "actually", "probably", "home", "of course", "perhaps", "little", "else", "sometimes", "finally", "less", "better", "early", "especially", "either", "quite", "simply", "nearly", "soon", "certainly", "quickly", "no", "recently", "before", "usually", "thus", "exactly", "hard", "particularly", "pretty", "forward", "ok", "clearly", "indeed", "rather", "that", "tonight", "close", "suddenly", "best", "instead", "ahead", "fast", "alone", "eventually", "directly"]);

    } else if (element && element.indexOf("exactword") !== -1) {
        // Exact word
        if (element.split(":").length < 2) {
            throw "No text was entered in the 'Exact Word' element.  Please type a word in the text box that you would like to see included verbatim in your results.";
        } else {
            deferred.resolve([ element.split(":")[1] ]);
        }

    } else if (element && element.indexOf("similarwords") !== -1) {
        // Similar words
        if (element.split(":").length < 2) {
            throw "No text was entered in the 'Similar Words' element.  Please type a word in the text box for which you would like to see similar words included in your results.";
        } else {
            var wordnet = new natural.WordNet();
            // Find all definition entries in WordNet
            wordnet.lookup(element.split(":")[1], function (entries) {
                var synonyms = [ element.split(":")[1] ];
                // Concat all synonyms found for each definition, including the original word itself, and stripping all non-alphanumeric characters.
                entries.map(function (entry) {
                    for (var index = 0; entry.synonyms && index < entry.synonyms.length; index++) {
                        var synonym = entry.synonyms[index].toLowerCase().replace(/[^a-z0-9]/g, "");
                        if (synonyms.indexOf(synonym) === -1) {
                            synonyms.push(synonym);
                        }
                    }
                });
                deferred.resolve(synonyms);
            });
        }
    } else {
        // Unrecognized element type, or (more likely) the function was called for a suffix when no suffix element was selected.
        deferred.resolve([]);
    }

    return deferred.promise;
}
