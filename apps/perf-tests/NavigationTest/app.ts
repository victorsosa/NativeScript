import application = require("application");
import navPageModule = require("../nav-page");
import frame = require("ui/frame");

import trace = require("trace");
trace.enable();
trace.setCategories(trace.categories.concat(
    trace.categories.NativeLifecycle
    , trace.categories.Navigation
    , trace.categories.Animation
));

application.mainEntry = {
    create: function () {
        var page = new navPageModule.NavPage(0);
        page.on("loaded", () => {
            if (frame.topmost().android) {
                frame.topmost().android.cachePagesOnNavigate = true;
                console.log(`>>> frame.topmost().android.cachePagesOnNavigate = ${frame.topmost().android.cachePagesOnNavigate};`);
            }
            page.off("loaded");
        });
        return page;
    }
    //backstackVisible: false,
    //clearHistory: true
};
application.start();
