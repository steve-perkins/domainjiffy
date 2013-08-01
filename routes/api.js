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

    // TODO: Return the 'whois' status of each result's '.com' version.

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

    // Common nouns
    if (element === "nouns") {
        results = ["time", "year", "people", "way", "day", "man", "thing", "woman", "life", "child", "world", "school", "state", "family", "student", "group", "country", "problem", "hand", "part", "place", "case", "week", "company", "system", "program", "question", "work", "government", "number", "night", "point", "home", "water", "room", "mother", "area", "money", "story", "fact", "month", "lot", "right", "study", "book", "eye", "job", "word", "business", "issue", "side", "kind", "head", "house", "service", "friend", "father", "power", "hour", "game", "line", "end", "member", "law", "car", "city", "community", "name", "president", "team", "minute", "idea", "kid", "body", "information", "back", "parent", "face", "others", "level", "office", "door", "health", "person", "art", "war", "history", "party", "result", "change", "morning", "reason", "research", "girl", "guy", "moment", "air", "teacher", "force", "education"];

    // Common verbs
    } else if (element === "verbs") {
        results = ["be", "have", "do", "say", "go", "can", "get", "would", "make", "know", "will", "think", "take", "see", "come", "could", "want", "look", "use", "find", "give", "tell", "work", "may", "should", "call", "try", "ask", "need", "feel", "become", "leave", "put", "mean", "keep", "let", "begin", "seem", "help", "talk", "turn", "start", "might", "show", "hear", "play", "run", "move", "like", "live", "believe", "hold", "bring", "happen", "must", "write", "provide", "sit", "stand", "lose", "pay", "meet", "include", "continue", "set", "learn", "change", "lead", "understand", "watch", "follow", "stop", "create", "speak", "read", "allow", "add", "spend", "grow", "open", "walk", "win", "offer", "remember", "love", "consider", "appear", "buy", "wait", "serve", "die", "send", "expect", "build", "stay", "fall", "cut", "reach", "kill", "remain"];

    // Common adjectives
    } else if (element === "adjectives") {
        results = ["other", "new", "good", "high", "old", "great", "big", "American", "small", "large", "national", "young", "different", "black", "long", "little", "important", "political", "bad", "white", "real", "best", "right", "social", "only", "public", "sure", "low", "early", "able", "human", "local", "late", "hard", "major", "better", "economic", "strong", "possible", "whole", "free", "military", "true", "federal", "international", "full", "special", "easy", "clear", "recent", "certain", "personal", "open", "red", "difficult", "available", "likely", "short", "single", "medical", "current", "wrong", "private", "past", "foreign", "fine", "common", "poor", "natural", "significant", "similar", "hot", "dead", "central", "happy", "serious", "ready", "simple", "left", "physical", "general", "environmental", "financial", "blue", "democratic", "dark", "various", "entire", "close", "legal", "religious", "cold", "final", "main", "green", "nice", "huge", "popular", "traditional", "cultural"];

    // Common adverbs
    } else if (element === "adverbs") {
        results = ["up", "so", "out", "just", "now", "how", "then", "more", "also", "here", "well", "only", "very", "even", "back", "there", "down", "still", "in", "as", "to", "when", "never", "really", "most", "on", "why", "about", "over", "again", "where", "right", "off", "always", "today", "all", "far", "long", "away", "yet", "often", "ever", "however", "almost", "later", "much", "once", "least", "ago", "together", "around", "already", "enough", "both", "maybe", "actually", "probably", "home", "of course", "perhaps", "little", "else", "sometimes", "finally", "less", "better", "early", "especially", "either", "quite", "simply", "nearly", "soon", "certainly", "quickly", "no", "recently", "before", "usually", "thus", "exactly", "hard", "particularly", "pretty", "forward", "ok", "clearly", "indeed", "rather", "that", "tonight", "close", "suddenly", "best", "instead", "ahead", "fast", "alone", "eventually", "directly"];

    // Exact word
    } else if (element.indexOf("exactword") !== -1) {
        if (element.split(":").length < 2) {
            throw "No text was entered in the 'Exact Word' element.  Please type a word in the text box that you would like to see included verbatim in your results.";
        } else {
            results = [ element.split(":")[1] ];
        }

    // Similar words
    } else if (element.indexOf("similarwords") !== -1) {
        if (element.split(":").length < 2) {
            throw "No text was entered in the 'Similar Words' element.  Please type a word in the text box for which you would like to see similar words included in your results.";
        } else {
            results = [ element.split(":")[1].toUpperCase() ];
        }
    }

    // TODO: Add elements for 'Catchy Words', 'Random Words', more?

    return results;
}
