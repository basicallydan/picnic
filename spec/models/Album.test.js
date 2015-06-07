var proxyquire = require('proxyquire');
var config = {
	webHost: 'https://picnic.co'
};
var Album = proxyquire('../../models/Album.js', {
	'../config/config.js' : config,
	'cloudinary' : {
		config: function (options) {

		},
		url: function (fileName, options) {
			var cropType = options.crop || 'nocrop';
			return '/test-url-' + options.width + 'x' + options.height + '-' + cropType + '.jpg';
		}
	}
});
var User = require('../../models/User.js');
var assert = require('assert');

describe('Album', function() {
	var album;

	beforeEach(function() {
		album = new Album({
			ownershipCode: 'eggs'
		});
	});

	it('should generate a random ownership code and short name', function() {
		album = new Album();
		assert.ok(album.ownershipCode);
		assert.ok(album.shortName);
	});

	it('should generate two different codes for different albums in both ownership code and short name', function() {
		albumOne = new Album();
		albumTwo = new Album();
		assert.ok(albumOne.ownershipCode);
		assert.ok(albumTwo.ownershipCode);
		assert.notEqual(albumOne.ownershipCode, albumTwo.ownershipCode);
		assert.ok(albumOne.shortName);
		assert.ok(albumTwo.shortName);
		assert.notEqual(albumOne.shortName, albumTwo.shortName);
	});

	describe('#authorizeOwnershipCode', function() {
		it('should verify the ownership code of an album', function() {
			assert.equal(album.authorizeOwnershipCode('eggs'), true);
		});
	});

	describe('#transferOwnership', function() {
		it('should transfer ownership of an album to the specified user if the correct ownership code is supplied', function() {
			var user = new User({
				email: 'test@test.com'
			});
			album.transferOwnership(user, 'eggs');
			assert.equal(album.ownedBy(user), true);
		});
		it('should undefine the ownership code for the transferred album', function() {
			var user = new User({
				email: 'test@test.com'
			});
			album.transferOwnership(user, 'eggs');
			assert.equal(album.get('ownershipCode'), undefined);
			assert.equal(album.authorizeOwnershipCode('eggs'), false);
		});
	});

	describe('#viewModel', function() {
		it('should transform the object into a useful, restful-like resource', function() {
			var album = new Album({
				shortName: 'blah',
				ownershipCode: 'bleep',
				files: [{
					bytes: 1234469,
					format: "jpg",
					name: "IMG_20140625_133245.jpg",
					width: 500,
					height: 500,
					shortName: 'firstOne',
					cloudinary: {
						id: 1
					}
				}, {
					bytes: 1260809,
					format: "jpg",
					name: "IMG_20140625_133308.jpg",
					width: 500,
					height: 500,
					shortName: 'secondOne',
					cloudinary: {
						id: 2
					}
				}]
			});

			assert.deepEqual(album.viewModel(), {
				shortName: 'blah',
				ownershipCode: 'bleep',
				links: {
					self: '/api/albums/blah',
					files: '/api/albums/blah/files/',
					web: 'https://picnic.co/a/blah'
				},
				files: [{
					bytes: 1234469,
					width:500,
					height:500,
					shortName: 'firstOne',
					links: {
						web: 'https://picnic.co/a/blah/images/firstOne',
						image: '/test-url-500x500-nocrop.jpg',
						imageW144: '/test-url-144x144-fill.jpg',
						imageW288: '/test-url-288x288-fill.jpg',
						imageW1136: '/test-url-1136xundefined-scale.jpg'
					}
				}, {
					bytes: 1260809,
					width:500,
					height:500,
					shortName: 'secondOne',
					links: {
						web: 'https://picnic.co/a/blah/images/secondOne',
						image: '/test-url-500x500-nocrop.jpg',
						imageW144: '/test-url-144x144-fill.jpg',
						imageW288: '/test-url-288x288-fill.jpg',
						imageW1136: '/test-url-1136xundefined-scale.jpg'
					}
				}]
			});
		});

		it('should override any properties specified', function() {
			var album = new Album({
				shortName: 'blah',
				ownershipCode: 'bleep',
				files: [{
					bytes: 1234469,
					format: "jpg",
					name: "IMG_20140625_133245.jpg",
					width: 500,
					height: 500,
					shortName: 'firstOne',
					cloudinary: {
						id: 1
					}
				}, {
					bytes: 1260809,
					format: "jpg",
					name: "IMG_20140625_133308.jpg",
					width: 500,
					height: 500,
					shortName: 'secondOne',
					cloudinary: {
						id: 2
					}
				}]
			});

			assert.deepEqual(album.viewModel({
				owner: {
					email: 'test@test.com',
					name: 'Test Test'
				}
			}), {
				links: {
					self: '/api/albums/blah',
					files: '/api/albums/blah/files/',
					web: 'https://picnic.co/a/blah'
				},
				shortName: 'blah',
				ownershipCode: 'bleep',
				files: [{
					shortName: 'firstOne',
					bytes: 1234469,
					width:500,
					height:500,
					links: {
						web: 'https://picnic.co/a/blah/images/firstOne',
						image: '/test-url-500x500-nocrop.jpg',
						imageW144: '/test-url-144x144-fill.jpg',
						imageW288: '/test-url-288x288-fill.jpg',
						imageW1136: '/test-url-1136xundefined-scale.jpg'
					}
				}, {
					shortName: 'secondOne',
					bytes: 1260809,
					width:500,
					height:500,
					links: {
						web: 'https://picnic.co/a/blah/images/secondOne',
						image: '/test-url-500x500-nocrop.jpg',
						imageW144: '/test-url-144x144-fill.jpg',
						imageW288: '/test-url-288x288-fill.jpg',
						imageW1136: '/test-url-1136xundefined-scale.jpg'
					}
				}],
				owner: {
					email: 'test@test.com',
					name: 'Test Test'
				}
			});
		});
	});
});
