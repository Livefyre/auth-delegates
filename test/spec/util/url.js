var urlUtil = require('auth-delegates/util/url');


describe('auth-delegates/util/url', function() {
  describe('getBaseUrl', function () {
    it('should add admin to livefyre urls', function () {
      var url = urlUtil.getBaseUrl('livefyre.com');
      chai.expect(url).to.equal('http://admin.livefyre.com');
    });

    it('does nothing with localhost urls', function () {
      var url = urlUtil.getBaseUrl('http://localhost:8080');
      chai.expect(url).to.equal('http://localhost:8080');
    });

    it('works on ^<network>.fyre.co strings', function () {
      var url = urlUtil.getBaseUrl('testnetwork.fyre.co');
      chai.expect(url).to.equal('http://testnetwork.admin.fyre.co');
    });

    it('works on ^admin.<network>.fyre.co strings', function () {
      var url = urlUtil.getBaseUrl('admin.testnetwork.fyre.co');
      chai.expect(url).to.equal('http://testnetwork.admin.fyre.co');
    });

    it('works on ^http://<network>.fyre.co strings', function () {
      var url = urlUtil.getBaseUrl('http://testnetwork.fyre.co');
      chai.expect(url).to.equal('http://testnetwork.admin.fyre.co');
    });

    it('works on ^http://admin.<network>.fyre.co strings', function () {
      var url = urlUtil.getBaseUrl('http://admin.testnetwork.fyre.co');
      chai.expect(url).to.equal('http://testnetwork.admin.fyre.co');
    });

    it('uses the current protocol', function () {
      var url = urlUtil.getBaseUrl('testnetwork.fyre.co', 'https:');
      chai.expect(url).to.equal('https://testnetwork.admin.fyre.co');
    });
  });
});
