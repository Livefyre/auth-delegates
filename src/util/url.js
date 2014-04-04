/** @type {Object} */
var util = {};

/**
 * Get the base authentication url for the provided serverUrl/domain. This will
 * ensure that the domain is correct and use the correct protocol. If no
 * protocol is provided, it will use the page's protocol.
 * @param {string} serverUrl The server url to adapt.
 * @param {string=} opt_protocol Optional protocol string.
 * @return {string} The base authentication url.
 */
util.getBaseUrl = function (serverUrl, opt_protocol) {
  var domain = serverUrl.replace(/^https?:\/\//, '').replace(/^admin\./, '');
  // If this is not a livefyre or local network, then convert to the new
  // custom network format for domains.
  if (!/livefyre|localhost|fyre$/.test(domain)) {
    domain = domain.split('.')[0] + '.admin.fyre.co';
  }
  return [opt_protocol || window.location.protocol, '//', domain].join('');
};

module.exports = util;
