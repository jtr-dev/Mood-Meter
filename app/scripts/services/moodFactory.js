(function () {
    'use strict';

    angular
        .module('app')
        .factory('moodFactory', moodFactory);

    moodFactory.$inject = ['moodService'];
    function moodFactory(api) {

        var base64result = [];

        var mood = new Dexie('matchHistory');

        var db = mood;

        const searchArr = ['i quit', 'sad', 'its happening', 'dota mlg', 'im the best'];
        var columns = [
            'all_match_ids',
            'total',
            'wins'
        ]

        db.version(1).stores({
            'all_match_ids': "id++, match",
            'total': 'id++, value',
            'wins': 'id++, value',
            'gifs': 'id++, value'
        });

        function getBase64Image(img) {
            var result;
            var xhr = new XMLHttpRequest();
            xhr.open('GET', img, true);
            xhr.responseType = 'arraybuffer';
            xhr.onload = function (e) {
                if (this.status == 200) {
                    console.log("2> " + xhr.response);
                    var uInt8Array = new Uint8Array(this.response);
                    var i = uInt8Array.length;
                    var biStr = new Array(i);
                    while (i--) {
                        biStr[i] = String.fromCharCode(uInt8Array[i]);
                    }
                    var data = biStr.join('');
                    var base64 = window.btoa(data);
                    // console.log("3> " + base64);
                    // $("#myImage").attr("src", "data:image/png;base64," + base64);
                    // return "data:image/png;base64," + base64;
                    result = "data:image/png;base64," + base64;
                    base64result.push(result);
                }
            };
            xhr.send();
        }



        db.on('ready', function () {
            return db.all_match_ids.count(function (count) {
                if (count > 0) {
                    console.log("Already populated, db is already created at this domain.");
                } else {
                    console.log("Database is empty. Populating from ajax call...");
                    return Dexie.Promise.all(columns.map(name => new Dexie.Promise((resolve, reject) => {
                        api.getMatches()
                            .then(res => {
                                console.log(res)
                                let data = [res[name]]
                                resolve(data)
                            }).catch(err => {
                                reject(err)
                            });
                    }).then(data => {
                        console.log("Got ajax response for " + name);
                        return data;
                    }).then(res => {
                        console.log("Adding " + res + " to " + name);
                        return db[name].add(res);
                    }).then(() => {
                        console.log("Done importing " + name);
                    }))).then(() => {
                        console.log("All files successfully imported");
                        db.wins.toArray().then(res => {
                            return res;
                        }).then((wins) => {
                            return Dexie.Promise.all(new Dexie.Promise((resolve, reject) => {
                                let search = searchArr[wins - 1];
                                console.log(search)
                                api.getGiphy(search)
                                    .then(res => {
                                        console.log(res)
                                        resolve(res)
                                    }).catch(err => {
                                        reject(err)
                                    });
                            }).then(data => {
                                return data.data.forEach(x => {
                                    getBase64Image(x.images.original.webp)
                                })
                            }).then(res => {
                                if (base64result.length < 10) {
                                    setTimeout(() => {
                                        return db.gifs.add(base64result)
                                    }, 10000)
                                } else {
                                    return db.gifs.add(base64result)
                                }
                            })).then((data) => {
                                console.log('saved some gifs, just in case')
                            })
                        })
                    }).catch(err => {
                        console.error("Error importing data: " + (err.stack || err));
                        throw err;
                    });
                }
            });
        });


        db.open();


        return mood;

    }
})();