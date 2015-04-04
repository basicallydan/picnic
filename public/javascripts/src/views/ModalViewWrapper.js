import _ from 'underscore';
import $ from 'jquery';

var ModalViewWrapper = function(View) {
	return View.extend({
		events: _.extend(View.prototype.events || {}, {
			'click .show': 'showModal',
			'click .close': 'hideModal',
			'click': 'closeFromBehind'
		}),

		render: function () {
			let $originalEl = this.$el;
			this.$el = this.$('.modal-body');
			View.prototype.render.apply(this, arguments);
			this.$el = $originalEl;
			return this;
		},

		initialize: function () {
			this.$el = $('#modal-container');
		},

		showModal: function() {
			this.$el.removeClass('hidden');
		},

		hideModal: function() {
			this.$el.addClass('hidden');
			this.undelegateEvents();
		},

		closeFromBehind: function(e) {
			if (e.target === this.$el[0]) {
				this.hideModal();
			}
		}
	});
};

export default ModalViewWrapper;