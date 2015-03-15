import Backbone from 'backbone';
import AlbumModel from './models/AlbumModel';
import AlbumCollection from './collections/AlbumCollection';
import AlbumView from './views/AlbumView';
import AlbumsView from './views/AlbumsView';
import SignInView from './views/SignInView';
import SignUpView from './views/SignUpView';
import HomepageView from './views/HomepageView';
import $ from 'jquery';
import log from './utils/log';

var Router = Backbone.Router.extend({
    routes: {
        '':'homepage',
        'a':'albums',
        'a/:albumShortName':'album',
        'sign-in':'signIn'
    },

    homepage: function () {
        log('Route: Homepage');

        new HomepageView({
            el: $('#page-container')[0]
        }).delegateEvents();
    },

    albums: function () {
        log('Route: Albums');
        var albumCollection = new AlbumCollection(GLOBAL.viewModel.albums);

        new AlbumsView({
            el: $('#page-container')[0],
            collection: {
                albums: albumCollection
            }
        }).delegateEvents();

        albumCollection.fetch();
    },

    album: function (albumShortName) {
        log('Route: Album');
        var albumModel = new AlbumModel({
            shortName:albumShortName
        });

        albumModel.set(GLOBAL.viewModel.album);

        var albumView = new AlbumView({
            el: $('#page-container')[0],
            model: {
                album: albumModel
            }
        });

        albumView.initializeDropzone();

        albumModel.fetch();
    },

    signIn: function () {
        log('Route: Sign in');
        new SignInView({
            el: $('#page-container')[0]
        });
    }
});

Backbone.history.start({
    pushState: true
});

export default Router;