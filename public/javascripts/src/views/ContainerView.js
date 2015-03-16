import Backbone from 'backbone';
import $ from 'jquery';
import Dropzone from 'dropzone';
import SignInView from './SignInView';
import AlbumsView from './AlbumsView';
import HomepageView from './HomepageView';

var ContainerView = Backbone.View.extend({
	initialize: function () {
		console.log('Starting model:', this.model);
		console.log('Starting collection:', this.collection);

		this.viewState = new Backbone.Model({
			firstLoad: true
		});

		this.albumListView = new AlbumsView({
            el: $('#page-container')[0],
            collection: this.collection
        });

        this.homepageView = new HomepageView({
            el: $('#page-container')[0]
        });
	},
	shouldFetch: function () {
		return !this.viewState.get('firstLoad');
	},
	showAlbumListView: function () {
        this.albumListView.delegateEvents();

        this.collection.albums.fetch();
	},
	showHomepageView: function () {
        this.homepageView.delegateEvents();
        this.homepageView.render();
	},
	events: {
		'.internal-link' : 'handleInternalLink'
	},
	handleInternalLink: function (e) {
		var link = $(e.currentTarget);
		Backbone.history.navigate(link.attr('href'));
	}
});

export default ContainerView;
