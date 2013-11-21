/**
 * @fileoverview Very small jsonp implementation.
 */

function req(url, callback) {
    var rand = '_lfcallback_' + (new Date()).getTime(),
        script = document.createElement('script'),
        sep = url.indexOf('?') > 0 ? '&' : '?';

    function clean() {
        if (script.parentNode) {
            script.parentNode.removeChild(script);
        }
        delete window[rand];
    }

    window[rand] = function(data) {
        callback(null, data);
        clean();
    }

    script.type = 'text/javascript';
    script.async = true;

    script.onerror = function() {
        callback('error');
        clean();
    };

    script.src = url + sep + 'callback=' + rand;
    document.getElementsByTagName('head')[0].appendChild(script);
}

module.exports = {
    req: req
};
