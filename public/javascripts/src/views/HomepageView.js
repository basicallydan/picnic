import AlbumModel from '../models/AlbumModel';
import NewAlbumDropzoneMixin from './mixins/NewAlbumDropzoneMixin';

var HomepageView = Backbone.View.extend({
	homepageTemplate: require('../../../../views/index.handlebars'),
	events: {
		'dragend .dz-message-empty': function (e) {
			console.log('Dragend empty done');
		},
		'dragend .dz-message-hovered': function (e) {
			console.log('Dragend hovered done');
		}
	},
	initialize: function () {
        this.viewState = new Backbone.Model({
        	currentMessageNumber: 0
        });
        this.listenTo(this.viewState, 'change:currentMessageNumber', this.updateDropzoneDragMessage);
	},
	initializeDropzone: NewAlbumDropzoneMixin.initializeDropzone,
	delegateEvents: function () {
		return Backbone.View.prototype.delegateEvents.apply(this, arguments);
	},
	render: function () {
		let homepageRendered = this.homepageTemplate();
		this.$el.html(homepageRendered);
		this.initializeDropzone();
	},
	updateDropzoneDragMessage: function () {
		let currentMessageNumber = this.viewState.get('currentMessageNumber');
		var element = $(this.$('#dropzoneMessageOptions div')[currentMessageNumber]);
		this.$('#albumDropzone .dz-message-hovered div').html(element.html());
	}
});

export default HomepageView;