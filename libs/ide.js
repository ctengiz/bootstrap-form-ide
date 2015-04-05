/**
 * Created by cagataytengiz on 23.03.15.
 */

/* todo : show / hide cell markers */

var active_row;
var side_bar_visible = true;

var set_droppbable = function(elm) {
    $(elm).droppable({
        accept: ".draggable",
        helper: "clone",
        hoverClass: "droppable-active",
        drop: function( event, ui ) {

            /* todo
            //Make dropped row as active row
            $(".form-row").removeClass("active-row");
            active_row = $(this).parent();
            $(active_row).addClass("active-row");
            */


            /* todo :
            widget-container class should accept widgets as children
             */

            /* todo :
            set id for collapsible and tab panel
             */

            /* todo :
            move button group and toolbar to containers
             */

            var $orig = $(ui.draggable);
            var clsbtn = '<button type="button" class="close remove-widget-btn">&times;</button>';

            var dropped_css = {"position": "static", "left": null, "right": null, "width":"100%", "height":null};
            if ($orig.hasClass("no-width")) {
                dropped_css.width = "";
                dropped_css.display = "inline-block";

            }

            if(!$(ui.draggable).hasClass("dropped")) {
                var $el = $orig
                    .clone()
                    .addClass("dropped")
                    .css(dropped_css)
                    .appendTo(this);

                $(clsbtn).prependTo($el);

                // update id
                var id = $orig.find(":input").attr("id");

                if(id) {
                    id = id.split("-").slice(0,-1).join("-") + "-"
                    + (parseInt(id.split("-").slice(-1)[0]) + 1)

                    $orig.find(":input").attr("id", id);
                    $orig.find("label").attr("for", id);
                }
            } else {
                if($(this)[0]!=$orig.parent()[0]) {
                    var $el = $orig
                        .clone()
                        .css(dropped_css)
                        .appendTo(this);
                    $orig.remove();
                }
            }
        }
    });

    $(elm).sortable();
};

var set_draggable = function() {
    $( ".draggable" ).draggable({
        appendTo: "body",
        helper: "clone"
        //cancel: ""
    });
};


var add_row = function(col_nr) {
    var tmp_row = $("#tmp-row").html();
    var tmp_cell = $("#tmp-cell").html();

    var col_wd = 12 / col_nr;

    var class_text = 'col-md-' + col_wd;

    var new_row = $(tmp_row).appendTo($("#form-area"));
    for (var i = 1; i <= col_nr; i++) {
        var cell = $(tmp_cell).appendTo(new_row);
        $(cell).addClass(class_text);
        $(cell).data("col-no", i);
        $(cell).data("col-wd", col_wd);

        set_droppbable(cell); //for widgets to be sorted
    }

    $(new_row).sortable({
        axis: "x",
        containment: "parent",
        tolerance: "pointer"
    }); //for cells to be sorted

};

var get_form_html = function() {
    var $copy = $("#form-area").clone(); //.appendTo(document.body);

    //remove helper items
    $copy.find(".tools, .remove-widget-btn, .cell-actions, .row-actions").remove();

    //remove css needed for design time positioning
    $copy.find('.dropped, .col-md-1, .col-md-2, .col-md-3, .col-md-4,' +
    '.col-md-5, .col-md-6, .col-md-7, .col-md-8, .col-md-9,' +
    '.col-md-10, .col-md-11, .col-md-12, .row').css({
        "position": "",
        "left": "",
        "right": "",
        "width": "",
        "height": "",
        "z-index": "",
        "top": "",
        "float": ""
    });

    //unwrap wrapped elements
    $copy.find(".unwrap .dropped").children().unwrap();


    //remove design time classes
    $.each(["draggable", "droppable", "sortable", "dropped",
        "ui-sortable", "ui-draggable", "ui-droppable", "form-body",
        "cell", "form-row", "ui-sortable-handle", "ui-sortable-handle",
        "ui-draggable-handle", "ui-sortable-helper", "dropped-pos-full",
        "no-width"
    ], function(i, c) {
        $copy.find("." + c).removeClass(c);
    });

    //remove empty style & class atributes
    $copy.find('*[class=""]').removeAttr('class');
    $copy.find('*[style=""]').removeAttr('style');

    return $copy;
};



$(document).ready(function() {
    $("#form-area").sortable({
        handle: ".btn-move-row",
        cancel: "",
        axis: "y",
        containment: "parent",
        tolerance: "pointer"
    });

    set_draggable();
    add_row(3);

    $("#copy-to-clipboard").on("click", function() {
        var $copy = $("#form-area").clone().appendTo(document.body);
        $copy.find(".tools, :hidden").remove();
        $.each(["draggable", "droppable", "sortable", "dropped",
            "ui-sortable", "ui-draggable", "ui-droppable", "form-body"], function(i, c) {
            $copy.find("." + c).removeClass(c);
        });
        var html = html_beautify($copy.html());
        $copy.remove();

        $modal = get_modal(html).modal("show");
        $modal.find(".btn").remove();
        $modal.find(".modal-title").html("Copy HTML");
        $modal.find(":input:first").select().focus();

        return false;
    });

    $("#btn-add-row").click(function(){
        var col_nr = parseInt($("#edt-col-number").val());
        add_row(col_nr);
        return false;
    });

    $("#form-area").on("click", ".btn-del-row", function (ev) {
        $(this).parent().parent().remove();
        return false;
    });


    $("#form-area").on("mouseover", ".row", function(el){
        $(this).children(".row-actions").show();
    });

    $("#form-area").on("mouseout", ".row", function(el){
        $(this).children(".row-actions").hide();
    });


    $("#form-area").on("mouseover", ".cell", function(el){
        $(this).children(".cell-actions").show();
        //return false; --> Özellikle kapattım...
    });

    $("#form-area").on("mouseout", ".cell", function(el){
        $(this).children(".cell-actions").hide();
        //return false; --> Özellikle kapattım. Row mouse-out tetiklenmiyor..
    });


    //Expand or Shrink Cell
    $("#form-area").on("click", ".btn-size-cell", function (ev) {
        var size = parseInt($(this).data('size'));

        var parent_div = $(this).parent().parent();
        var parent_col_wd = parseInt($(parent_div).data("col-wd"));

        var target_div = $(parent_div).next();
        var target_col_no = $(target_div).data("col-no");
        var target_col_wd = parseInt($(target_div).data("col-wd"));

        if (!target_col_no) {
            target_div = $(parent_div).prev();
            target_col_no = $(target_div).data("col-no");
            target_col_wd = parseInt($(target_div).data("col-wd"));

            size = size * -1;
        }

        if (target_col_no) {
            if ( ((target_col_wd - size) > 0) && ((parent_col_wd + size) > 0))  {
                target_div.removeClass("col-md-" + target_col_wd);
                target_div.addClass("col-md-" + (target_col_wd - size));
                target_div.data("col-wd", (target_col_wd - size));

                parent_div.removeClass("col-md-" + parent_col_wd);
                parent_div.addClass("col-md-" + (parent_col_wd + size));
                parent_div.data("col-wd", (parent_col_wd + size));
            } else {
                alert("No more space to expand or shrink! Delete target cell explicitly!");
            }
        }
        return false;
    });


    //Split Cell
    $("#form-area").on("click", ".btn-split-cell", function (ev) {
        var parent_div = $(this).parent().parent();
        var parent_col_wd = parseInt($(parent_div).data("col-wd"));

        if (parent_col_wd < 1) {
            alert ("This cell is can not be splitted anymore.");
            return false;
        }

        if (parent_col_wd % 2 === 0) {
            var size = parent_col_wd / 2;
        } else {
            var size = 1;
        }

        var tmp_cell = $("#tmp-cell").html();

        var target_div = $(tmp_cell).insertAfter(parent_div);
        target_div.addClass("col-md-" + size);
        target_div.data("col-wd", size);
        target_div.data("col-no", 1);
        set_droppbable(target_div);

        parent_div.removeClass("col-md-" + parent_col_wd);
        parent_div.addClass("col-md-" + (parent_col_wd - size));
        parent_div.data("col-wd", (parent_col_wd - size));

        return false;
    });


    //Delete cell
    $("#form-area").on("click", ".btn-del-cell", function (ev) {

        var parent_div = $(this).parent().parent();
        var parent_col_wd = parseInt($(parent_div).data("col-wd"));

        var target_div = $(parent_div).prev();
        var target_col_no = $(target_div).data("col-no");
        var target_col_wd = parseInt($(target_div).data("col-wd"));

        if (!target_col_no) {
            target_div = $(parent_div).next();
            target_col_no = $(target_div).data("col-no");
            target_col_wd = parseInt($(target_div).data("col-wd"));
        }

        if (target_col_no) {
            target_div.removeClass("col-md-" + target_col_wd);
            target_div.addClass("col-md-" + (target_col_wd + parent_col_wd));
            target_div.data("col-wd", (target_col_wd + parent_col_wd));
        }

        $(parent_div).remove();

        return false;
    });

    /* todo !
    $("#form-area").on("click", ".cell", function(elm) {
        var row = $(this).parent();
        if (!$(row).hasClass("active-row")) {
            $(".form-row").removeClass("active-row");
            $(row).addClass("active-row");
            active_row = row;
        } else {
            $(row).removeClass("active-row");
            active_row = null;
        }
        return false;
    });
    */

    $("#toggle-sidebar").click(function(){
        if (side_bar_visible) {
            $("#widgets").hide();
            $("#form-container").removeClass("col-md-9");
            $("#form-container").addClass("col-md-12");
            side_bar_visible = false;

            $(this).children("i").addClass('fa-chevron-right');
            $(this).children("i").removeClass('fa-chevron-left');

        } else {
            $("#widgets").show();
            $("#form-container").removeClass("col-md-12");
            $("#form-container").addClass("col-md-9");
            side_bar_visible = true;

            $(this).children("i").addClass('fa-chevron-left');
            $(this).children("i").removeClass('fa-chevron-right');

        }
    });

    //Delete Widget
    $("#form-area").on("click", ".close", function (ev) {
        $(this).parent().remove();
        return false;
    });


    //Get Html
    $("#btn-get-html").click(function(){
        var $copy = get_form_html();
        var html = html_beautify($copy.html(), {
                'unformatted': [],
                'preserve_newlines': false,
                'max_preserve_newlines': 1}
        );

        $("#html-code").html(hljs.highlight("html", html).value);

        return false;
    });


    //Get Json
    $("#btn-get-json").click(function(){
        var $copy = $("#form-area").clone(true); //.appendTo(document.body);

        //remove helper items
        $copy.find(".tools, .close, .cell-actions, .row-actions").remove();

        var jsonStr = {
            widgets: [],
            layout: {
                rows: []
            }
        };

        var frmRow = $copy.children();
        var rowCount = frmRow.length;
        for (var r = 0; r < rowCount; r++) {
            var jsonRow = [];

            var frmCells = $(frmRow[r]).children();
            var cellCount = frmCells.length;
            for (var c = 0; c < cellCount; c++) {
                var jsonCell = {};

                var fc = frmCells[c];
                jsonCell.col_wd = $(fc).data("col-wd");

                var widgetCount = fc.length;
                for (var w=0; w < widgetCount; w++) {
                    var jsonWidget = {};

                }


                jsonRow.push(jsonCell);

            }

            jsonStr.layout.rows.push(jsonRow)
        }

        $("#html-code").html(hljs.highlight("json", JSON.stringify(jsonStr, null, 2)).value);


        return false;
    })


});
