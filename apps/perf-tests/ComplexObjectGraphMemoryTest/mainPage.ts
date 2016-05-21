import pagesModule = require("ui/page");
import stackLayoutModule = require("ui/layouts/stack-layout");
import buttonModule = require("ui/button");
import labelModule = require("ui/label");
import trace = require("trace");
import enums = require("ui/enums");
import fps = require("fps-meter");

export function createPage() {
    fps.addCallback(function (fps, minFps) {
        if (trace.enabled) {
            trace.write("fps=" + fps + " minFps=" + minFps, trace.categories.Test, trace.messageType.info);
        }
    });
    fps.start();

    var count = 1000;
    var buttonsPerRow = 10;

    var mainStackLayout = new stackLayoutModule.StackLayout();
    mainStackLayout.orientation = enums.Orientation.vertical;

    var label = new labelModule.Label();
    mainStackLayout.addChild(label);
    if (label.ios) {// Hack for an iOS Arrange problem
        label.height = 80;
    }

    var button;
    var childStackLayout;
    var childStackLayoutCount = count / buttonsPerRow;
    if (trace.enabled) {
        trace.write("Creating " + count + " buttons.", trace.categories.Test, trace.messageType.info);
    }
    console.time("creatingButtons");
    for (var i = 0; i < childStackLayoutCount; i++) {
        childStackLayout = new stackLayoutModule.StackLayout();
        childStackLayout.orientation = enums.Orientation.horizontal;
        mainStackLayout.addChild(childStackLayout);
        for (var j = 0; j < buttonsPerRow; j++) {
            button = new buttonModule.Button();
            button.on(buttonModule.Button.tapEvent, function (data) {
                if (trace.enabled) {
                    trace.write("eventName=" + data.eventName + " object=" + data.object, trace.categories.Test, trace.messageType.info);
                }
            });
            button.text = "" + i + j;
            childStackLayout.addChild(button);
        }
    }
    console.timeEnd("creatingButtons");
    var message = "Created " + count + " buttons";
    if (trace.enabled) {
        trace.write(message, trace.categories.Test, trace.messageType.info);
    }
    label.text = message;

    var page = new pagesModule.Page();
    page.content = mainStackLayout;
    return page;
}