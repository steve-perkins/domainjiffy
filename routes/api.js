exports.generate = function (req, res) {
    var responseObject = {};
    responseObject.results = [];
    responseObject.results += req.params.elements.split(",");
    res.send(responseObject);
}

exports.generateNothing = function (req, res) {
    var responseObject = {};
    responseObject.error = "No elements were selected.  Please drag one or more elements into the box at the top of the page.";
    res.send(responseObject);
}
