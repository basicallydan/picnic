import Backbone from 'backbone';
import $ from 'jquery';
import Dropzone from 'dropzone';
import SignInView from './SignInView';

var HomepageView = Backbone.View.extend({
	homepageTemplate: require('../../../../views/index.handlebars'),
	initialize: function () {
        this.signInView = new SignInView({
            el: this.$('.signInView')[0]
        });
	},
	delegateEvents: function () {
		this.signInView.delegateEvents();
		return Backbone.View.prototype.delegateEvents.apply(this, arguments);
	},
	render: function () {
		let homepageRendered = this.homepageTemplate();
		this.$el.html(homepageRendered);
	}
});

export default HomepageView;