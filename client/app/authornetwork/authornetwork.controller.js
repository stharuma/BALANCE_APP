/* global d3 */
'use strict';
angular.module('kf6App')
    .controller('AuthorNetworkCtrl', function($stateParams, $scope, $community, $http) {

        // commenter
        // vérifier window.location.href
        // vérifier dans la fonction refresh si c'est normal que les fonctions doivent être définies avant d'être appelées
        // traduire
        
        var viewId = $stateParams.viewId;
        
        $community.getObject(viewId, function(view) {
            $scope.view = view;
            $community.enter($scope.view.communityId);

            $scope.communityMembers = $community.getMembersArray();
            $community.refreshMembers(function(){
                refresh();
            });       
        });

        var refresh = function() {
            $http.post('/api/contributions/' + $scope.view.communityId + '/search', {
                query: {
                    communityId: $scope.view.communityId,
                    status: 'active',
                    pagesize: 1000
                }
            }).success(function(contributions) {
                $http.get('/api/links/buildson/' + $scope.view.communityId).success(function(links) {
                    var data = processData(contributions, links);
                    refreshView(data);                          
                });
            });
        };

        var processData = function(notes, links) {
            var authors = {};
            var buildsonkey = new Array();
            var buildson = new Array();

            notes.forEach(function(note) {
                note.authors.forEach(function(author){
                    if (typeof authors[author] !== 'undefined') {
                        authors[author].size++;
                    }
                    else{
                        authors[author] = {name: $community.getMember(author).getName(), size: 1}
                    }                
                });
            });

            links.forEach(function(link) {
                if(link.type === "buildson"){
                    link._from.authors.forEach(function(source){
                        link._to.authors.forEach(function(target){
                            if (typeof buildsonkey[source+target] !== 'undefined') {
                                buildsonkey[source+target].weight++;
                            }
                            else{
                                buildsonkey[source+target] = {source: source, target: target, type: "buildson", weight: 1}
                            }
                        });
                    });
                }
            });

            // remove key
            for (var key in buildsonkey) {
               buildson.push(buildsonkey[key]);
            }

            return [authors, buildson]
        };

        var refreshView = function(data) {
            var tick = function () {
                path.attr("d", function(d) {
                    if (d.source.name != d.target.name){
                        var dx = d.target.x - d.source.x,
                            dy = d.target.y - d.source.y,
                            dr = Math.sqrt(dx * dx + dy * dy);
                        return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
                    }
                    else{ // self link
                        return "M" + d.source.x + "," + d.source.y + "A20,40 270,1,1 " + (d.target.x - 1) + "," + (d.target.y - 1);
                    } 
                });
                    
                markerPath.attr("d", function(d) {
                    if (d.source.name != d.target.name){
                        var dx = d.target.x - d.source.x,
                            dy = d.target.y - d.source.y,
                            dr = Math.sqrt(dx * dx + dy * dy);
                        var endX = (d.target.x + d.source.x) / 2;
                        var endY = (d.target.y + d.source.y) / 2;
                        var len = dr - ((dr/2) * Math.sqrt(3));
                        
                        endX = endX + (dy * len/dr);
                        endY = endY + (-dx * len/dr);
                          
                        return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + endX + "," + endY;
                    }
                });

                circle.attr("transform", function(d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });

                text.attr("transform", function(d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });
            }

            var normalizeNodeSize = function(s){ 
                return ((s - minsize) / maxsize * 20) + 8;
            }

            var normalizeLinkWidth = function(w){ 
                return ((w - minweight) / maxweight * 5) + 2;
            }

            var showInfos = function() {
                var currentName = $(d3.select(this)[0][0]).attr("name");
                var currentSize = $(d3.select(this)[0][0]).attr("size");
                var nbbuildsonothers = 0;
                var nbothersbuildson = 0;
                var buildsonothers = "";
                var othersbuildson = "";
                var currentClass = "";
                var txt = "";

                if (lastshown === currentName && $('#infos').html() !== ''){
                    hideInfos();
                }
                else{
                    lastshown = currentName;
              
                    $("path").attr('style', 'stroke: #eee')
                    $("path.marker_only").attr("marker-end", "url("+window.location.href+"#flecheinactif)");;
                    $("circle").attr('style', "fill: #f0f0f0; stroke: #ccc");
                    $(d3.select(this)[0][0]).attr("style", "fill: #008; stroke: #ccc")
                    $(links).each(function() {
                        if (this.source.name === currentName){
                            $('circle[name="' + this.target.name + '"]').attr('style', 'fill: #080');
                            currentClass = $('path[name="' + this.source.name + this.target.name + '"]').attr('class')
                            $('path[name="' + this.source.name + this.target.name + '"]').attr('style', 'stroke: #080')
                            $('path[name="' + this.source.name + this.target.name + '"].marker_only').attr("marker-end", "url("+window.location.href+"#flecheverte)");
                            buildsonothers += "<li>" + this.weight + ' par ' + this.target.name + "</li>"; // traduire
                            nbbuildsonothers += this.weight;
                        }
                        else if (this.target.name === currentName){
                            $('circle[name="' + this.source.name + '"]').attr('style', 'stroke: #800');
                            currentClass = $('path[name="' + this.source.name + this.target.name + '"]').attr('class')
                            $('path[name="' + this.source.name + this.target.name + '"]').attr('style', 'stroke: #800')
                            $('path[name="' + this.source.name + this.target.name + '"].marker_only').attr("marker-end","url("+window.location.href+"#flecherouge)");
                            othersbuildson += "<li>" + this.weight + ' par ' + this.source.name + "</li>"; // traduire
                            nbothersbuildson += this.weight;
                        }
                    });
                
                    txt = currentName + ' a rédigé ' + currentSize + ' note' + (currentSize > 1 ? 's' : '') + '.<br>'; // traduire
                    if (nbbuildsonothers > 0){
                        txt += currentName + " a élaboré ses notes à partir de " + nbbuildsonothers + " note" + (nbbuildsonothers > 1 ? 's' : '') +  "&nbsp;: <ul>" + buildsonothers + "</ul>" ; // traduire
                    }
                    if (nbothersbuildson > 0){
                        txt += nbothersbuildson + " note" + (nbothersbuildson > 1 ? 's ont été élaborées' : ' a été élaborée') + "  à partir des notes de " + currentName + "&nbsp;: <ul>" + othersbuildson + "</ul>" ; // traduire
                    }  
                    $('#infos').html(txt)
                }
            }

            var hideInfos = function() {
                $("path").attr('style', 'stroke: #666')
                $("path.marker_only").attr("marker-end", "url("+window.location.href+"#flechenoire)");
                $("marker").attr('style', "fill-opacity: 1;");
                $("circle").attr('style', "fill: #ccc").attr('style', "stroke: #000");
                $("#infos").html('');
            }

            var minweight = null;
            var maxweight = null;
            var minsize = null;
            var maxsize = null;
            var lastshown = null;


            var nodes = data[0];
            var links = data[1];
            var cleanlinks = new Array();

            // for normalize node size
            for (var key in nodes) {
                var s = nodes[key].size
                minsize = (minsize === null || s < minsize ? s : minsize); 
                maxsize = (maxsize === null || s > maxsize ? s : maxsize); 
            }

            // Compute the distinct nodes from the links + normalize link width
            links.forEach(function(link) {
                if (nodes[link.source] && nodes[link.target]){
                    link.source = nodes[link.source];
                    link.target = nodes[link.target];
                    minweight = (minweight === null || link.weight < minweight ? link.weight : minweight); 
                    maxweight = (maxweight === null || link.weight > maxweight ? link.weight : maxweight);
                    cleanlinks.push(link);
                } 
                else{
                    console.log(link)
                }
            });
            links = cleanlinks;

            var width = 680,
            height = 500;

            var force = d3.layout.force()
                .nodes(d3.values(nodes))
                .links(links)
                .size([width, height])
                .linkDistance(260)
                .charge(-300)
                .on("tick", tick)
                .start();

            var svg = d3.select("#network").append("svg:svg")
                .attr("width", width)
                .attr("height", height);

            svg.append("svg:defs").selectAll("marker")
                .data(["flechenoire", "flecherouge", "flecheverte", "flecheinactif"])
                .enter().append("svg:marker")
                .attr("id", String)
                .attr("viewBox", "0 -5 10 10")
                .attr("markerWidth", 16)
                .attr("markerHeight", 16)
                .attr("orient", "auto")
                .attr("markerUnit", "strokeWidth")
                .append("svg:path")
                .attr("d", "M0,-5L10,0L0,5");

            var path = svg.append("svg:g").selectAll("path.link")
                .data(force.links())
                .enter().append("svg:path")
                .attr("stroke-width", function(d) { return normalizeLinkWidth(d.weight);})
                .attr("name", function(d) { return d.source.name + d.target.name;})
                .attr("class", function(d) { return "link " + d.type; });

            var markerPath = svg.append("svg:g").selectAll("path.marker")
                .data(force.links())
                .enter().append("svg:path")
                .attr("class", function(d) { return "marker_only " + d.type; })
                .attr("name", function(d) { return d.source.name + d.target.name;})
                .attr("marker-end", function(d) { return "url("+window.location.href+"#flechenoire)"; });

            var circle = svg.append("svg:g").selectAll("circle")
                .data(force.nodes())
                .enter().append("svg:circle")
                .on("click", showInfos)
                .attr("r", function(d) { return normalizeNodeSize(d.size); })
                .attr("name", function(d) { return d.name; })
                .attr("size", function(d) { return d.size; })
                .call(force.drag);

            var text = svg.append("svg:g").selectAll("g")
                .data(force.nodes())
                .enter().append("svg:g");

            text.append("svg:text")
                .attr("x", 8)
                .attr("y", ".31em")
                .attr("class", "shadow")
                .text(function(d) { return d.name; });

            text.append("svg:text")
                .attr("x", 8)
                .attr("y", ".31em")
                .text(function(d) { return d.name; });
        };
    });