import Backbone from 'backbone';
import $ from 'jquery';
import Dropzone from 'dropzone';
import SignInView from './SignInView';
import AlbumsView from './AlbumsView';
import AlbumView from './AlbumView';
import HomepageView from './HomepageView';

var ContainerView = Backbone.View.extend({
	events: {
		'click .internal-link' : 'handleInternalLink',
		'mousedown .autohighlight': 'highlightShortLink',
		'click .autohighlight': 'highlightShortLink',
		'keypress .no-edit': 'preventEditing',
		'keyup .no-edit': 'preventEditing',
		'keydown .no-edit': 'preventEditing'
	},
	initialize: function () {
		console.log('Starting model:', this.model);
		console.log('Starting collection:', this.collection);

		this.viewState = new Backbone.Model({
			firstLoad: true
		});

		this.albumListView = new AlbumsView({
			el: this.$('#page-container')[0],
			collection: this.collection
		});

		this.albumView = new AlbumView({
			el: this.$('#page-container')[0],
			model: this.model
		});

		this.homepageView = new HomepageView({
			el: this.$('#page-container')[0]
		});
	},
	handleInternalLink: function (e) {
		var link = $(e.currentTarget);
		e.preventDefault();
		Backbone.history.navigate(link.attr('href'), { trigger : true });
	},
	shouldFetch: function () {
		return !this.viewState.get('firstLoad');
	},
	showAlbumListView: function () {
		this.albumListView.delegateEvents();
		this.collection.albums.fetch();
	},
	showAlbumView: function (shortName) {
		this.albumView.delegateEvents();
		this.model.album.set('shortName', shortName);
		this.model.album.fetch();
	},
	showHomepageView: function () {
		this.homepageView.delegateEvents();
		this.homepageView.initializeDropzone();
	},
	/* DOM MANIPULATION */
	highlightShortLink: function (e) {
		e.preventDefault();
		let target = $(e.currentTarget);
		target.select();
	},
	preventEditing: function (e) {
		e.preventDefault();
	}
});

export default ContainerView;
