var proxyquire = require('proxyquire');
var config = {
	webHost: 'https://picnic.co'
};
var Album = proxyquire('../../models/Album.js', {
	'../config/config.js' : config,
	'./schema/FileSchema': proxyquire('../../models/schema/FileSchema.js', {
		'../../config/config.js' : config,
		'cloudinary' : {
			config: function (options) {

			},
			url: function (fileName, options) {
				var cropType = options.crop || 'nocrop';
				return '/test-url-' + options.width + 'x' + options.height + '-' + cropType + '.jpg';
			}
		}
	})
});
var User = require('../../models/User.js');
var assert = require('assert');

describe('Album', function() {
	var album;

	beforeEach(function() {
		album = new Album({
			ownershipCode: 'eggs',
			files: [{
				name: 'ownerfile1',
				bytes: 100000,
				cloudinary: {
					id: 1
				}
			},{
				name: 'ownerfile2',
				ownershipCode: 'eggs',
				bytes: 100000,
				cloudinary: {
					id: 2
				}
			},{
				name: 'otherpersonfile1',
				bytes: 100000,
				ownershipCode: 'peas',
				cloudinary: {
					id: 3
				}
			}]
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
		var user;
		beforeEach(function () {
			user = new User({
				email: 'test@test.com'
			});
			album.transferOwnership(user, 'eggs');
		});

		it('should transfer ownership of an album to the specified user if the correct ownership code is supplied', function() {
			assert.equal(album.ownedBy(user), true);
		});

		it('should transfer ownership of the files which the owner uploaded (which may not have ', function () {
			assert.equal(album.get('files')[0].ownedBy(user), true);
			assert.equal(album.get('files')[1].ownedBy(user), true);
			assert.equal(album.get('files')[0].ownershipCode, undefined);
			assert.equal(album.get('files')[1].ownershipCode, undefined);
		});

		it('should not transfer ownership of the files which the owner did not upload', function () {
			assert.equal(album.get('files')[2].ownedBy(user), false);
			assert.equal(album.get('files')[2].ownershipCode, 'peas');
		});

		it('should undefine the ownership code for the transferred album', function() {
			assert.equal(album.get('ownershipCode'), undefined);
			assert.equal(album.authorizeOwnershipCode('eggs'), false);
		});
	});

	describe('#isDeleted', function () {
		var user;
		beforeEach(function () {
			user = new User();
			album = new Album({
				owner: user,
				files: [{
					name: 'ownerfile1',
					bytes: 100000,
					cloudinary: {
						id: 1
					}
				},{
					name: 'ownerfile2',
					ownershipCode: 'eggs',
					bytes: 100000,
					cloudinary: {
						id: 2
					}
				},{
					name: 'otherpersonfile1',
					bytes: 100000,
					ownershipCode: 'peas',
					cloudinary: {
						id: 3
					}
				}]
			});
		});
		it('should return false', function () {
			assert.equal(album.isDeleted(), false);
		});

		describe('#softDelete', function () {
			beforeEach(function () {
				album.softDelete();
			});

			describe('#isDeleted', function () {
				it('should return true', function () {
					assert.equal(album.isDeleted(), true);
				});
			});

			describe('#viewModel where the user owns it', function() {
				var albumViewModel;
				beforeEach(function () {
					albumViewModel = album.viewModel(undefined, { user : user });
				});
				it('should report that it is in fact deleted', function () {
					assert.equal(albumViewModel.deleted, true);
				});

				it('should no longer advertise a files URL', function () {
					assert.equal(albumViewModel.links.files, undefined);
				});

				it('should no longer advertise a delete URL even if the user owns it', function () {
					assert.equal(albumViewModel.links.delete, undefined);
				});
			});
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
				deleted: false,
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
						self: '/api/files/firstOne',
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
						self: '/api/files/secondOne',
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
				deleted: false,
				shortName: 'blah',
				ownershipCode: 'bleep',
				files: [{
					shortName: 'firstOne',
					bytes: 1234469,
					width:500,
					height:500,
					links: {
						self: '/api/files/firstOne',
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
						self: '/api/files/secondOne',
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

		it('should produce a delete link if the user provided in the options owns the album', function() {
			var user = new User({
				email: 'test@test.com'
			});
			var album = new Album({
				shortName: 'blah',
				owner: user,
				files: [{
					bytes: 1234469,
					owner: user,
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
					ownershipCode: 'ham',
					format: "jpg",
					name: "IMG_20140625_133308.jpg",
					width: 500,
					height: 500,
					shortName: 'secondOne',
					cloudinary: {
						id: 2
					}
				}],
				ownershipCode: undefined
			});

			assert.deepEqual(album.viewModel(null, { user : user }), {
				links: {
					self: '/api/albums/blah',
					delete: '/api/albums/blah',
					files: '/api/albums/blah/files/',
					web: 'https://picnic.co/a/blah'
				},
				deleted: false,
				owner: {
					links: {
						self: '/api/users/' + user.id,
						password: '/api/users/' + user.id + '/password',
						web: '/u/' + user.id
					},
					email: 'test@test.com'
				},
				shortName: 'blah',
				files: [{
					shortName: 'firstOne',
					bytes: 1234469,
					width:500,
					height:500,
					links: {
						self: '/api/files/firstOne',
						delete: '/api/files/firstOne',
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
						self: '/api/files/secondOne',
						web: 'https://picnic.co/a/blah/images/secondOne',
						image: '/test-url-500x500-nocrop.jpg',
						imageW144: '/test-url-144x144-fill.jpg',
						imageW288: '/test-url-288x288-fill.jpg',
						imageW1136: '/test-url-1136xundefined-scale.jpg'
					}
				}]
			});
		});
	});
});
