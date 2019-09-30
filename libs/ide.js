/*
var dragPos = {
    X:0,
    Y:0
};

class ComponentData {
    constructor () {
        this.id = "";
        this.template = "";
        this.isContainer = false;
        this.isAdded = false;
        this.currentParent = null;
        this.el = null;

    };

    reset() {
        this.id = "";
        this.template = "";
        this.isContainer = false;
        this.isAdded = false;
        this.currentParent = null;
        this.el = null;

    };

    beginDrag(id, template) {
        this.id = id;
        this.template = template;
    }

    removeDragged() {
        if (this.currentParent) {
            this.currentParent.removeChild(document.getElementById(this.id));
        };
        this.currentParent = null;
        this.isAdded = false;
        this.el = null;
    };

    addDragged(target) {
        target.insertAdjacentHTML("beforeend", this.template);
        this.isAdded = true;
        this.currentParent = target;
        this.el = document.getElementById(this.id);

    };

    dropped() {
        if (!this.el) {
            this.el = document.getElementById(this.id);
        }

        if (this.el) {
            this.el.classList.add("placed");
            this.el.classList.add("draggable");

            this.el.classList.remove("hoverComponent");
            this.el.addEventListener('dragenter', handleDragEnter, false);
            this.el.addEventListener('dragover', handleDragOver, false);
            this.el.addEventListener('dragleave', handleDragLeave, false);

            this.el.addEventListener('dragstart', handleDragStart, false);
            this.el.addEventListener('dragend', handleDragEnd, false);

            this.el.parentNode.classList.remove("over");
        }

    }
}

let componentData = new ComponentData();

var comps = document.querySelectorAll('#widgetTabContent .component');
[].forEach.call(comps, function (comp) {
    comp.addEventListener('dragstart', handleDragStart, false);
    comp.addEventListener('dragend', handleDragEnd, false);
    //comp.addEventListener('drop', handleDrop, false);
});

var targets = document.querySelectorAll("#form-area .drop-target");
[].forEach.call(targets, function (target) {
    target.addEventListener('dragenter', handleDragEnter, false);
    target.addEventListener('dragover', handleDragOver, false);
    target.addEventListener('dragleave', handleDragLeave, false);

    target.addEventListener('drop', handleDrop, false);
});

function handleDragStart(e) {

    if (e.target.classList.contains("component")) {
        idCount = idCount + 1;
        var renderData = {
            id: "comp" + idCount.toString(),
            idControl: "control" + idCount.toString(),
            idControlHelp: "controlHelp" + idCount.toString()
        };
        var tempx = Mustache.render(
            document.getElementById("t-textbox").innerHTML,
            renderData
        )

        componentData.beginDrag("comp" + idCount.toString(), tempx);

    } else {
        componentData.id = e.target.id;
        componentData.template = e.target.outerHTML;
        componentData.isAdded = true;
        componentData.el = e.target;
        componentData.currentParent = e.target.parentNode;
    }

    e.dataTransfer.dropEffect = "move";
}


function handleDragEnter(e) {
    if (componentData.id != "") {
        if (e.target.classList.contains("drop-target")) {

            if (!componentData.isAdded) {
                componentData.addDragged(e.target);
            } else {
                if (componentData.currentParent != e.target) {
                    componentData.el.parentElement = e.target;
                    componentData.currentParent = e.target;
                    
                    //componentData.removeDragged();
                    //componentData.addDragged(e.target);
                }
            }
            
            e.target.classList.add('over');
            e.preventDefault();

            return false;
        }
    }
}

function handleDragLeave(e) {
    if (e.target.classList.contains("drop-target")) {
        e.target.classList.remove('over');
    }

    //componentData.removeDragged();
}

function handleDrop(e) {
    console.log("dropped");

    // this / e.target is current target element.
    if (e.stopPropagation) {
        e.stopPropagation(); // stops the browser from redirecting.

    }
    //componentData.reset();

    // See the section on the DataTransfer object.
    return false;
}

function handleDragEnd(e) {
    // this/e.target is the source node.
    if (e.dataTransfer.dropEffect === "move") {
        componentData.dropped();
    } else {
        componentData.removeDragged();
    }

    componentData.reset();
}

function handleDragOver(e) {
    if (e.target.classList.contains("drop-target")) {

        //Drop'a izin verelim
        e.preventDefault();

        //e = e || window.event;
        dragPos.X = e.pageX;
        dragPos.Y = e.pageY;

        return false;
    }
}
*/

var idCount = 0;
var componentData = {
    id: "",
    html: "",
    dropTarget: false,

    reset: function () {
        this.id = "";
        this.html = "";
        this.dropTarget = false;
    },

    init: function(id, html) {
        this.id = id;
        this.html = html;
    },

    initFromComponent: function(el) {
        idCount = idCount + 1;
        this.id = "comp" + idCount.toString();

        var templateId = el.id.replace("c-", "t-")

        var renderData = {
            id: this.id,
            idControl: "control" + idCount.toString(),
            idControlHelp: "controlHelp" + idCount.toString()
        };

        this.html = Mustache.render(
            document.getElementById(templateId).innerHTML, renderData
        );

        if (el.classList.contains("c-container")) {
            this.dropTarget = true;
        }

    },

    drop: function(parent) {
        if (this.id != "") {
            $(parent).append(this.html);
            var el = document.getElementById(this.id);
            el.classList.remove("w-75");

            if (this.dropTarget) {
                makeDropable(this.id);
                //makeDraggableTarget(this.id);

                el.classList.add("c-dropped");
            } else {
                el.classList.add("dropped");
                makeDraggable(this.id);
            }

            this.reset;
        }
    },

}

function makeDropable(targetID) {
    $("#" + targetID + " .drop-target").droppable({
        accept: ".c-container, .component, .dropped, .c-dropped",
        greedy: true,
        classes: {
            "ui-droppable-hover": "over"
        },

        drop: function (event, ui) {
            componentData.drop(this);
        },

        deactivate: function (event, ui) {
            //console.log(event);
        }

    });

    $("#" + targetID + " .drop-target").sortable({

    });

}

function makeDraggable(targetID) {
    $("#" + targetID).draggable({
        //helper: "clone",
        appendTo: "body",
        connectToSortable: ".drop-target, #form-area",
        //handle: ".handle",
        //cancel: "input,textarea,button,select,option,label,small, div",
        //cursorAt: {top: 0, bottom:0},
        //refreshPositions: true
        stop: function (event, ui) {
            $(".drop-target, #form-area").removeClass("over");
            this.removeAttribute("style");
        },
    });
}


$(document).ready(function(){
    $("#form-area").droppable({
        accept: ".c-container, .c-dropped, .component",
        greedy: true,
        classes: {
            "ui-droppable-hover": "over"
        },
        drop: function (event, ui) {
            componentData.drop(this);
        },

        /*
        deactivate: function(event, ui) {
            componentData.reset();
        }
        */
    });

    $("#form-area").sortable({

    });

    $(".component").draggable({
        appendTo: "main",
        start: function(event, ui) {
            if (componentData.id == "") {
                componentData.initFromComponent(this);
            }
        },

        stop: function(event, ui) {
            componentData.reset();
        },

        helper: function (event) {
            if (componentData.id == "") {
                componentData.initFromComponent(this);
            }

            return $(componentData.html);
        }
        

    });



});