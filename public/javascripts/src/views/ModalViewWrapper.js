import _ from 'underscore';
import $ from 'jquery';

var ModalViewWrapper = function(View) {
	return View.extend({
		events: _.extend(View.prototype.events || {}, {
			'click .show': 'showModal',
			'click .close': 'hideModal',
			'click .cell': 'closeFromBehind'
		}),

		initialize: function () {
			this.$el = $('#modal-container');
		},

		showModal: function() {
			this.$el.removeClass('hidden');
		},

		hideModal: function() {
			this.$el.addClass('hidden');
		},

		closeFromBehind: function(e) {
			if (e.target === this.$('.cell')[0]) {
				this.hideModal();
			}
		}
	});
};

export default ModalViewWrapper;