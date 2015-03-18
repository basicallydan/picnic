import Backbone from 'backbone';
import AlbumModel from './models/AlbumModel';
import AlbumCollection from './collections/AlbumCollection';
import AlbumsView from './views/AlbumsView';
import SignInView from './views/SignInView';
import SignUpView from './views/SignUpView';
import ContainerView from './views/ContainerView';
import $ from 'jquery';
import _ from 'underscore';
import log from './utils/log';

function getAndWipeInjectedViewModel() {
    if (!GLOBAL.viewModel) {
        return {};
    }
    let cloned = _.clone(GLOBAL.viewModel);
    delete GLOBAL.viewModel;
    return cloned;
}

var Router = Backbone.Router.extend({
    routes: {
        '':'homepage',
        'a':'albums',
        'a/:albumShortName':'album',
        'sign-in':'signIn'
    },

    initialize: function () {
        log('Initializing router.');
        let pathName = Backbone.history.location.pathname.replace(/^\//g, '');
        let model = getAndWipeInjectedViewModel();

        this.containerView = new ContainerView({
            el: 'body',
            collection: {
                albums: new AlbumCollection(model.albums)
            },
            model: {
                user: model.user,
                album: new AlbumModel(model.album)
            }
        });

        this.containerView.delegateEvents();

        Backbone.history.loadUrl(pathName);
    },

    homepage: function () {
        log('Route: Homepage');
        this.containerView.showHomepageView();
    },

    albums: function () {
        log('Route: Albums');
        this.containerView.showAlbumListView();
    },

    album: function (albumShortName) {
        log('Route: Album');

        this.containerView.showAlbumView(albumShortName);
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