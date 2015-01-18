var Album = require('../../models/Album.js');
var User = require('../../models/User.js');
var assert = require('assert');

describe('Album', function () {
	var album;

	beforeEach(function () {
		album = new Album({
			ownershipCode: 'eggs'
		});
	});

	describe('#authorizeOwnershipCode', function () {
		it('should verify the ownership code of an album', function () {
			assert.equal(album.authorizeOwnershipCode('eggs'), true);
		});
	});

	describe('#transferOwnership', function () {
		it('should transfer ownership of an album to the specified user if the correct ownership code is supplied', function () {
			var user = new User({
				email: 'test@test.com'
			});
			album.transferOwnership(user, 'eggs');
			assert.equal(album.ownedBy(user), true);
		});
	});
});