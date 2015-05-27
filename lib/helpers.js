var _ = require('underscore');
var register = function(Handlebars) {
    /************* BEGIN HELPERS *************/
    var helpers = {
        // All helpers should go in here
        jsonifyViewModel: function (object){
            if (!object) {
                return JSON.stringify({});
            }
            var viewModel = _.omit(object, 'settings', 'cache', '_locals', 'body');
            return JSON.stringify(viewModel);
        },
        albumNameOrDefault: function (state){
            var index = state.data.index;
            var album = state.data.root.albums[index];
            return album.nam || 'Album #' + (index + 1);
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

module.exports = {
    register: register,
    helpers: register(null)
};