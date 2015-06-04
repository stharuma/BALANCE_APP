'use strict';

angular.module('kf6App')
    .factory('$kfutil', function() {
        var obj = {};

        obj.getTimeString = function(time) {
            var d = new Date(time);
            return d.toLocaleString();
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

        obj.isSafari = function() {
            return obj.browser.name === 'safari';
        };

        obj.isChrome = function() {
            return obj.browser.name === 'chrome';
        };

        obj.isFirefox = function() {
            return obj.browser.name === 'firefox';
        };

        obj.isIE = function() {
            return obj.browser.name === 'ie' || obj.browser.name === 'msie';
        };

        obj.isiOS = function() {
            var iOS = (navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false);
            return iOS;
        };

        obj.isAndroid = function() {
            var ua = navigator.userAgent.toLowerCase();
            var isAndroid = ua.indexOf('android') > -1;
            return isAndroid;
        };

        obj.isMobile = function() {
            return obj.isiOS() || obj.isAndroid();
        };

        obj.getOffset = function(e) {
            if (obj.isFirefox()) {
                if (e.type === 'contextmenu') {
                    return {
                        x: e.originalEvent.layerX,
                        y: e.originalEvent.layerY
                    };
                }
                return {
                    x: e.layerX,
                    y: e.layerY
                };
            }

            //other browser
            return {
                x: e.offsetX,
                y: e.offsetY
            };
        };

        obj.getTouchPos = function(touchEvent) {
            var changed = touchEvent.changedTouches[0];
            return {
                x: changed.pageX,
                y: changed.pageY
            };
        };

        obj.getTouchOffset = function(touchEvent, jElem) {
            var p = obj.getTouchPos(touchEvent);
            return {
                x: p.x + -(jElem.offset().left),
                y: p.y + -(jElem.offset().top)
            };
        };

        obj.fireContextMenuEvent = function(touchEvent, jElem) {
            var el = jElem[0];
            var evt = el.ownerDocument.createEvent("HTMLEvents")
            evt.initEvent('contextmenu', true, true) // bubbles = true, cancelable = true
            var p = obj.getTouchPos(touchEvent);
            var offset = obj.getTouchOffset(touchEvent, jElem);
            evt.pageX = p.x;
            evt.pageY = p.y;
            evt.offsetX = offset.x;
            evt.offsetY = offset.y;
            if (document.createEventObject) {
                return el.fireEvent('oncontextmenu', evt)
            } else {
                return !el.dispatchEvent(evt)
            }
        };

        obj.mixIn = function(scope) {
            scope.getTimeString = obj.getTimeString;
            scope.isIE = obj.isIE;
            scope.isiOS = obj.isiOS;
            scope.isAndroid = obj.isAndroid;
            scope.isMobile = obj.isMobile;
            scope.browser = function() {
                return obj.browser;
            };
        };

        return obj;
    });