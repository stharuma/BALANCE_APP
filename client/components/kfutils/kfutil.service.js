'use strict';

angular.module('kf6App')
    .factory('$kfutil', function() {
        var obj = {};

        obj.mixIn = function(scope) {
            scope.getTimeString = function(time) {
                var d = new Date(time);
                return d.toLocaleString();
            };
        };

        // obj.isSafari = function() {
        //     // var firefox = (e.offsetX === undefined);
        //     // var safari = navigator.userAgent.indexOf('Safari') > -1 && navigator.userAgent.indexOf('Chrome') <= -1;
        //     // //var chrome = navigator.userAgent.indexOf('Safari') > -1 && navigator.userAgent.indexOf('Chrome') > -1;                    
        //     // var IE = (navigator.userAgent.indexOf('MSIE') !== -1 || document.documentMode <= 11); /*IE11*/
        // }

        //http://stackoverflow.com/questions/2400935/browser-detection-in-javascript
        function detect() {
            var ua = navigator.userAgent,
                tem,
                M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
            if (/trident/i.test(M[1])) {
                tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
                return 'IE ' + (tem[1] || '');
            }
            if (M[1] === 'Chrome') {
                tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
                if (tem !== null) {
                    return tem.slice(1).join(' ').replace('OPR', 'Opera');
                }
            }
            M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
            if ((tem = ua.match(/version\/(\d+)/i)) !== null) {
                M.splice(1, 1, tem[1]);
            }
            return M.join(' ');
        }

        obj.browser = (function() {
            var tokens = detect().split(' ');
            var browser = {};
            browser.name = tokens[0].toLowerCase();
            if (tokens.length >= 2) {
                browser.version = parseFloat(tokens[1]);
            }
            return browser;
        })();

        obj.isIE = function() {
            return obj.browser.name === 'ie' || obj.browser.name === 'msie';
        };

        return obj;
    });