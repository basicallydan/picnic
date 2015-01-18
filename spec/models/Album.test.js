var Album = require('../../models/Album.js');
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
	});

	describe('#viewModel', function() {
		it('should transform the object into a useful, restful-like resource', function() {
			var album = new Album({
				shortName: 'blah',
				ownershipCode: 'bleep',
				files: [{
					"buffer": null,
					"truncated": false,
					"size": 1234469,
					"extension": "jpg",
					"path": "uploads/4dd049f5a347638ad5566de16a5418a5.jpg",
					"mimetype": "image/jpeg",
					"encoding": "7bit",
					"name": "4dd049f5a347638ad5566de16a5418a5.jpg",
					"originalname": "IMG_20140625_133245.jpg",
					"fieldname": "fileUpload"
				}, {
					"buffer": null,
					"truncated": false,
					"size": 1260809,
					"extension": "jpg",
					"path": "uploads/6575ef767a6bc48c5f9c4c48ebe1f91d.jpg",
					"mimetype": "image/jpeg",
					"encoding": "7bit",
					"name": "6575ef767a6bc48c5f9c4c48ebe1f91d.jpg",
					"originalname": "IMG_20140625_133308.jpg",
					"fieldname": "fileUpload"
				}]
			});

			assert.deepEqual(album.viewModel(), {
				shortName: 'blah',
				ownershipCode: 'bleep',
				links: {
					self: '/api/albums/blah',
					web: 'http://localhost:3000/a/blah'
				},
				files: [{
					"size": 1234469,
					"mimeType": "image/jpeg",
					"originalName": "IMG_20140625_133245.jpg",
					links: {
						image: '/uploads/4dd049f5a347638ad5566de16a5418a5.jpg'
					}
				}, {
					"size": 1260809,
					"mimeType": "image/jpeg",
					"originalName": "IMG_20140625_133308.jpg",
					links: {
						image: '/uploads/6575ef767a6bc48c5f9c4c48ebe1f91d.jpg'
					}
				}]
			});
		});

		it('should override any properties specified', function() {
			var album = new Album({
				shortName: 'blah',
				ownershipCode: 'bleep'
			});

			assert.deepEqual(album.viewModel({
				owner: {
					email: 'test@test.com',
					name: 'Test Test'
				}
			}), {
				shortName: 'blah',
				ownershipCode: 'bleep',
				links: {
					self: '/api/albums/blah',
					web: 'http://localhost:3000/a/blah'
				},
				files: [{
					"size": 1234469,
					"mimeType": "image/jpeg",
					"originalName": "IMG_20140625_133245.jpg",
					links: {
						image: '/uploads/4dd049f5a347638ad5566de16a5418a5.jpg'
					}
				}, {
					"size": 1260809,
					"mimeType": "image/jpeg",
					"originalName": "IMG_20140625_133308.jpg",
					links: {
						image: '/uploads/6575ef767a6bc48c5f9c4c48ebe1f91d.jpg'
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