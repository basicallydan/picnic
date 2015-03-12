import Backbone from 'backbone';
import AlbumModel from './models/AlbumModel';
import AlbumView from './views/AlbumView';

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

        new AlbumView({
            model: {
                album: albumModel
            }
        });

        albumModel.fetch();
    }
});

Backbone.history.start({
    pushState: true
});

export default Router;