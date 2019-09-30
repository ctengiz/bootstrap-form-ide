
var idCount = 0;

var dragData = {
    init: function() {
        this.id = "";
        this.html = "";
        this.clone = false;
    },

    fillFromComponent: function(el) {
        idCount = idCount + 1;
        this.id = "comp" + idCount.toString();

        var templateId = $(el).data("template");

        var renderData = {
            id: this.id,
            idControl: "control" + idCount.toString(),
            idControlHelp: "controlHelp" + idCount.toString()
        };

        this.html = Mustache.render(
            document.getElementById(templateId).innerHTML, renderData
        );

        this.clone = true;

        console.log(this);
    },

    fillFromDropped: function(el) {
        this.id = el.id;
        this.html = el.outerHTML;
        this.clone = false;

        console.log(this);
    },

    drop: function(parent) {
        if (!this.clone) {
            $("#" + this.id).remove();
        }

        $(parent).append(this.html);

        if (this.clone) {
            makeDraggable(this.id);
        }

    }
}

function makeDraggable(targetID) {
    //$("#" + targetID).draggable({
    $(".dropped").draggable({

        //helper: "clone",
        //appendTo: "body",
        //connectToSortable: ".drop-target, #form-area",
        //handle: ".handle",
        //cancel: "input,textarea,button,select,option,label,small, div",
        //cursorAt: {top: 0, bottom:0},
        //refreshPositions: true
        /*
        stop: function (event, ui) {
            $(".drop-target, #form-area").removeClass("over");
            this.removeAttribute("style");
        },
        */
       
       // connectToSortable: ".drop-target",

        start: function(event, ui) {
            dragData.fillFromDropped(this);
        }
    });

}

$(document).ready(function() {
    dragData.init();

    $(".drop-target").droppable({
        accept: ".component, .dropped",

        drop: function (event, ui) {
            dragData.drop(this);
        },


    });

    $(".drop-target").sortable({

    });

    $(".component").draggable({
        helper: "clone",
        //connectToSortable: ".drop-target",

        start: function(event, ui) {
            dragData.fillFromComponent(this);
        }

    });


});