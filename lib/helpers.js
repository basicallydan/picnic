var _ = require('underscore');

(function() {
    var register = function(Handlebars) {

        /************* BEGIN HELPERS *************/
        var helpers = {
            // put all of your helpers inside this object
            jsonifyViewModel: function (object){
                var viewModel = _.omit(object, 'settings', 'cache', '_locals', 'body');
                return JSON.stringify(viewModel);
            },          
        };
        /************* END HELPERS *************/

        if (Handlebars && typeof Handlebars.registerHelper === "function") {
            // register helpers
            for (var prop in helpers) {
                Handlebars.registerHelper(prop, helpers[prop]);
            }
        } else {
            // just return helpers object if we can't register helpers here            
            return helpers;
        }
    };

    // client
    if (typeof window !== "undefined") {
        register(Handlebars);
    }
    // server
    else {
        module.exports.register = register;
        module.exports.helpers = register(null);
    }
})();