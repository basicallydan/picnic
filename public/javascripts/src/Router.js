import AlbumModel from './models/AlbumModel';
import UserModel from './models/UserModel';
import AlbumCollection from './collections/AlbumCollection';
import AlbumListView from './views/AlbumListView';
import SignInView from './views/SignInView';
import SignUpView from './views/SignUpView';
import ContainerView from './views/ContainerView';
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
        'a/:albumShortName/images/:imageShortName':'image',
        'a/:albumShortName':'album',
        'sign-in':'signIn',
        'profile':'profile'
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
                user: new UserModel(model.user),
                album: new AlbumModel(model.album, { parse : true }),
                file: new Backbone.Model(model.file)
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

    image: function (albumShortName, imageShortName) {
        log('Route: Image');
        this.containerView.showImageView(albumShortName, imageShortName);
    },

    signIn: function () {
        log('Route: Sign in');
        this.containerView.showSignInView();
    },

    profile: function () {
        log('Route: Profile');
        this.containerView.showProfileView();
    }
});

Backbone.history.start({
    pushState: true
});

export default Router;