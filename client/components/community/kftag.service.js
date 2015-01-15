'use strict';

angular.module('kf6App')
    .factory('$kftag', function($community) {
        var obj = {};

        obj.createNewReferenceTag = function(contId, title, authors, text) {
            var tag = '';
            tag = tag + '<span class="mceNonEditable KFReference" id="' + contId + '">';
            tag = tag + obj.createReferenceTag(contId, title, authors, text);
            tag = tag + '</span>';
            return tag;
        };

        obj.createReferenceTag = function(contId, title, authors, text) {
            var authorText = $community.makeAuthorStringByIds(authors);
            var tag = '';
            if (text && text.length > 0) {
                tag = tag + '<span class="KFReferenceQuote"><span>"</span><span class="KFReferenceText">' + text + '</span><span>"</span></span>';
            }
            tag = tag + '<span> (<a href="contribution/' + contId + '">';
            tag = tag + '<img src="/manual_assets/kf4images/icon-note-unread-othr-.gif">"' + title + '"</a>';
            tag = tag + '<span class="KFReferenceAuthor"> by ' + authorText + '</span>)</span>';
            tag = tag + '</span>';
            return tag;
        };

        obj.createNewScaffoldTag = function(supportId, title) {
            var tag = '';
            tag = tag + '<p>';
            tag = tag + '<span id="' + supportId + '" class="KFSupportStart mceNonEditable">';
            tag = tag + obj.createScaffoldStartTag(title);
            tag = tag + '</span>';
            tag = tag + '- enter your idea here -';
            tag = tag + '<span id="' + supportId + '" class="KFSupportEnd mceNonEditable">';
            tag = tag + obj.createScaffoldEndTag();
            tag = tag + '<span>';
            tag = tag + '</p><br/>';
            return tag;
        };

        obj.createScaffoldStartTag = function(title) {
            var tag = '';
            tag = tag + '<span class="kfSupportStartMark">&nbsp; </span>';
            tag = tag + '<span class="kfSupportStartLabel">' + title + '</span>';
            return tag;
        };

        obj.createScaffoldEndTag = function() {
            var tag = '';
            tag = tag + '<span class="kfSupportEndMark">&nbsp; </span>';
            return tag;
        };

        return obj;
    });