var Backbone = require('backbone');

var Router = Backbone.Router.extend({
    routes: {
        'a':'albums',
        'a/:albumShortName':'album'
    },
    albums: function () {

    },
    album: function (albumShortName) {
        var albumModel = new AlbumModel({
            shortName:albumShortName
        });

        albumModel.fetch();
    }
});

Backbone.history.start();

module.exports = Router;