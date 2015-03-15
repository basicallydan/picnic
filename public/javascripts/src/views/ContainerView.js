import Backbone from 'backbone';
import $ from 'jquery';
import Dropzone from 'dropzone';
import SignInView from './SignInView';

var ContainerView = Backbone.View.extend({
	initialize: function () {
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
