$(document).ready(function () {

    var infos = ['EpisodeNumber', 'EpisodeNumber2', 'Title', 'OriginalAirDate'];

    var main = $('#load');

    var today = new Date();

    $('#date').text(formatDate(today));

    var wikiUrl = 'http://en.wikipedia.org/wiki/';

    var series = [
        {
            title: 'The Big Bang Theory',
            wikiTitles: 'The_Big_Bang_Theory_(season_6)',
            links: {
                'kinox.to EN': 'http://kinox.to/Stream/The_Big_Bang_Theory-1.html',
                'kinox.to DE_subbed': 'http://kinox.to/Stream/The_Big_Bang_Theory_german_subbed.html'
            }
        },
        {
            title: 'How I Met Your Mother',
            wikiTitles: 'How_I_Met_Your_Mother_(season_8)',
            links: {
                'kinox.to EN': 'http://kinox.to/Stream/How_I_Met_Your_Mother-1.html',
                'kinox.to DE_subbed': 'http://kinox.to/Stream/How_I_Met_Your_Mother_german_subbed.html'
            }
        },
        {
            title: 'Two and a Half Men',
            wikiTitles: 'Two_and_a_Half_Men_(season_10)',
            links: {
                'kinox.to EN': 'http://kinox.to/Stream/Two_and_a_Half_Men-2.html',
                'kinox.to DE_subbed': 'http://kinox.to/Stream/Two_and_a_Half_Men_german_subbed.html'
            }
        },
        {
            title: 'The Walking Dead',
            wikiTitles: 'The_Walking_Dead_(season_3)',
            links: {
                'kinox.to EN': 'http://kinox.to/Stream/The_Walking_Dead.html',
                'kinox.to DE_subbed': 'http://kinox.to/Stream/The_Walking_Dead_german_subbed.html'
            }
        },
        {
            title: 'The Mentalist',
            wikiTitles: 'The_Mentalist_(season_5)',
            links: {
                'kinox.to EN': 'http://kinox.to/Stream/The_Mentalist-1.html',
                'kinox.to DE_subbed': 'http://kinox.to/Stream/The_Mentalist_german_subbed.html'
            }
        },
        {
            title: 'Dexter',
            wikiTitles: 'Dexter_(season_7)',
            links: {
                'kinox.to EN': 'http://kinox.to/Stream/Dexter-1.html',
                'kinox.to DE_subbed': 'http://kinox.to/Stream/Dexter_german_subbed.html'
            }
        },
        {
            title: 'Breaking Bad',
            wikiTitles: 'Breaking_Bad_(season_5)',
            links: {
                'kinox.to EN': 'http://kinox.to/Stream/Breaking_Bad-1.html',
                'kinox.to DE_subbed': 'http://kinox.to/Stream/Breaking_Bad_german_subbed.html'
            }
        },
        {
            title: 'Grimm',
            wikiTitles: 'Grimm_(season_2)',
            links: {
                'kinox.to EN': 'http://kinox.to/Stream/Grimm.html',
                'kinox.to DE_subbed': 'http://kinox.to/Stream/Grimm-1.html'
            }
        }
    ];

    var actualSeries = 0;

    function getSeriesData(callback) {

        var sData = series[actualSeries];
        if (sData === undefined) {
            return false;
        }

        $.ajax({
            url: 'http://en.wikipedia.org/w/api.php',
            data: {
                action: 'query',
                titles: sData.wikiTitles,
                prop: 'revisions',
                rvprop: 'content',
                //rvparse: '1', // Als Html parsen
                format: 'json'
            },
            dataType: 'jsonp',
            success: function (r) {
                //console.log(r);
                var pages = r.query.pages;
                $.each(pages, function (id, data) {
                    var revision = data.revisions[0]['*'];
                    var t = revision.match(/<onlyinclude>(.|\n)*<\/onlyinclude>/g);
                    //console.log(t);
                    var t2 = t[0].split('{{Episode list/sublist|');
                    t2.splice(0, 1);
                    var season = [];
                    $.each(t2, function (eId, eData) {
                        var episode = {};
                        $.each(infos, function (k, v) {
                            var reg = new RegExp(v + ' *= *(.[^\\n]*)');
                            var out = eData.match(reg);
                            episode[v] = $.trim(out[1]);
                        });
                        season.push(episode);
                    });
                    callback(season);
                });
            }
        });
    }

    function getDate(data) {
        //{{Start date|2012|11|15}}
        var d = data.match(/{{Start date([0-9\|]*)}}/);
        if (d !== null) {
            var u = d[1];
            var date = u.split('|');
            return new Date(date[1], date[2]-1, date[3]);
        }
        return null;
    }

    function formatDate(date) {
        if (date === null) {
            return '-';
        }
        function formatNum(num) {
            return num < 10 ? '0' + num : num;
        }
        return formatNum(date.getDate()) + '.' + formatNum(date.getMonth() + 1) + '.' + date.getFullYear();
    }

    function formatTitle(title) {
        var t = title.match(/\[\[(.[^\]]*)/);
        if (t !== null) {
            var d = t[1].split('|');
            return '<a href="' + wikiUrl + (d[0] || d[1]).replace(/ /g, '_') + '">' + (d[1] || d[0]) + '</a>';
        }
        if (title === '') {
            return '<em>Noch nicht bekannt</em>'
        }
        return title;
    }

    var callback = function (data) {

        var sData = series[actualSeries];
        var html = '<section>';
        //html += '<h2><a href="http://stiebel.lc:8888/test.php">' + sData.title + '</a></h2><table>';
        if (sData.links) {
            html += '<ul class="ext-links">';
            $.each(sData.links, function (name, url) {
                html += '<li><a href="' + url + '">' + name + '</a></li>'
            });
            html += '</ul>';
        }
        html += '<h2><a href="' + wikiUrl + sData['wikiTitles'] + '">' + sData.title + '</a></h2><table>';
        $.each(data, function (k, episode) {
            var date = getDate(episode['OriginalAirDate']);
            var state = 'future';
            if (date) {
                var dif = today - date;
                if (dif > 0) {
                    state = 'old';
                    if (dif > 0 && dif < 86400000*7) {
                        state = 'actual';
                    }
                }
            }
            html += '<tr class="' + state + '">';
            html += '<td>' + episode['EpisodeNumber'] + '</td>';
            html += '<td>' + episode['EpisodeNumber2'] + '</td>';
            html += '<td>' + formatTitle(episode['Title']) + '</td>';
            html += '<td>' + formatDate(date) + '</td>';
            html += '</tr>';
        });
        html += '</table></section>';
        main.append(html);
        actualSeries++;
        getSeriesData(callback);
    };

    getSeriesData(callback);

});