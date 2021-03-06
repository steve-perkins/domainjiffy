"use strict";
$(function () {

    // Used to determine when a selected item is being dragged out of its box for removal.
    var toBeRemoved = false;

    // Use jQuery UI buttons to style the available and selected elements.
    $("#availableElements div.ui-widget-content div, #selectedElements div.ui-widget-content div").button();

    // Setup the available elements for drag-and-drop
    $("#availableElements div.ui-widget-content div").draggable({
        appendTo: "body",
        helper: "clone",
        start: function (event, ui) {
            $(this).addClass("activatedElement");
        },
        stop: function (event, ui) {
            $(this).removeClass("activatedElement");
        }
    });

    // Setup the selected elements box for receiving drag-and-drop, and also make the selected elements sortable.
    $("#selectedElements div.ui-widget-content").droppable({
        accept: ":not(.ui-sortable-helper)",
        drop: function (event, ui) {
            // Don't allow more than 2 selected elements at once
            if ($(this).children().length < 2) {
                $(this).find(".placeholder").remove();
            } else {
                $(this).children().first().remove();
            }
            // Drag-and-drop a copy of the element, leaving the original in place.
            var clone = $(ui.draggable).clone();
            $(clone).removeClass("activatedElement");
            $(this).append(clone);
        }
    }).sortable({
            // The "over" and "out" event handlers track whether a selected element is being dragged within box (i.e. sorting)
            // or outside the box (i.e. removing).  When the mouse button or touchscreen is released, "beforeStop" removes the
            // dragged element if appropriate.
            beforeStop: function (event, ui) {
                if (toBeRemoved === true) {
                    if (ui.item.siblings().length <= 1) {
                        // No selected elements will remain, so restore the original placeholder element.
                        var newPlaceholder = $("<div></div>");
                        newPlaceholder.addClass("placeholder");
                        newPlaceholder.append("Drag 1 or 2 elements here");
                        newPlaceholder.button();
                        ui.item.parent().append(newPlaceholder);
                    }
                    ui.item.remove();
                }
            },
            out: function () {
                toBeRemoved = true;
            },
            over: function () {
                toBeRemoved = false;
            },
            sort: function () {
                $(this).removeClass("ui-state-default");
            },
            tolerance: "pointer"
        });

    // Send selected elements and inputs to the server, and display the results
    $("#generateButton").click(function () {
        $("#generatedResults").hide();
        $("#generatedResults").slideDown("slow");
        $("#generatedResults div div.well").html('<div id="progressIndicator" class="progressIndicator"><div class="bubblingG"><span id="bubblingG_1"></span><span id="bubblingG_2"></span><span id="bubblingG_3"></span></div></div>');
        $(document.body).scrollTop($("#progressIndicator").offset().top);

        var elements = $("#selectedElements div.ui-widget-content div").map(function () {
            // Parse the selected element type, and additional input if the type takes input.
            var element = $(this).attr("id");
            if (element === "exactword" || element === "similarwords") {
                // Basic input sanitize.  Strip all characters except letters, numbers, and dashes.
                var input = $(this).find("input").val().toLowerCase().replace(/[^-a-z0-9]/g, "");
                element += ":" + input;
            }
            return element;
        }).get().join(",");

        $.ajax({
            url: "api/generate/" + elements,
            type: "GET"
        }).done(function (data) {
                // Display results, or error message
                $("#generatedResults div div.well").html("");
                if (data.error) {
                    $("#generatedResults div div.well").append("<span style='color: red'>" + data.error + "</span>");
                } else if (data.results.length < 1) {
                    $("#generatedResults div div.well").append("No results could be generated");
                } else {
                    $("#generatedResults div div.well").append( $("#resultsDescription").html() + "<br/>" );
                    var deferred = $.Deferred();
                    data.results.forEach(function(result) {
                        var text = (result && result.basename) ? result.basename + ".com" : ";";
                        var style = (result && result.dotComInUse) ? "text-decoration: line-through; color: red;" : "color: green;";
                        var html = "<div style='" + style + "'>" + text + "</div>";
                        $("#generatedResults div div.well").append(html);
                    });
                }
            }).fail(function (jqXHR, textStatus) {
                $("#generatedResults div div.well").append("<span style='color: red'>" + textStatus + "</span>");
                //console.log(textStatus);
                //console.log(jqXHR);
            });
    });

});
