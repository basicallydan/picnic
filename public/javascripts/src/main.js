import $ from 'jquery';
global.$ = $;
import Backbone from 'backbone';
global.Backbone = Backbone;
import _ from 'underscore';
global._ = _;
Backbone.$ = $;
import Router from './Router';
import handlebarHelpers from '../../../lib/helpers';
import Handlebars from 'hbsfy/runtime';
handlebarHelpers.register(Handlebars);


$(document).ready(() => {
	let router = new Router();
	GLOBAL.router = router;
});