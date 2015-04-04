import $ from 'jquery';
global.$ = $;
import Backbone from 'backbone';
global.Backbone = Backbone;
import _ from 'underscore';
global._ = _;
Backbone.$ = $;
import Router from './Router';

$(document).ready(() => {
	let router = new Router();
});