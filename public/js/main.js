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

    // Make sure that we can actually determine which items/elements are selected
    $("#generateButton").click(function () {
        $("#generatedResults").hide();
        $("#generatedResults div div.well").html("");
        $("#generatedResults").slideDown("slow");
        $("#selectedElements div.ui-widget-content div").each(function (index, value) {
            var id = $(value).attr("id");
            if (id === "exactWord" || id === "synonyms") {
                id += ":" + $(value).find("input").val().replace(/ /g, '');
            }
            $("#generatedResults div div.well").append(id + "<br/>");
        });
    });
});
