'use strict';
(function (global) {
  /*
    Methods for Controller
  */
  function MainController($scope, api, $sce, webNotification, mood) {
    var vm = $scope;
    vm.data;
    vm.gif;
    vm.error;
    vm.loading = true;

    const searchArr = ['i quit', 'sad', 'its happening', 'dota mlg', 'im the best'];
    const notificationTitle = 'He finished a match!';
    const hostUrl = "http://localhost:8000";

    var GrantedOptions = {
      body: "I'll let you know after he finishes a match",
      autoClose: 2500
    }
    var WinOptions = {
      body: 'He won! :D',
      // icon: 'todo',
      onClick: function onNotificationClicked() {
        var win = window.open(hostUrl, '_blank');
        win.focus();
      },
      autoClose: 2500
    }
    var LoseOptions = {
      body: 'He lost  :( ',
      // icon: 'todo',
      onClick: function onNotificationClicked() {
        var win = window.open(hostUrl, '_blank');
        win.focus();
      },
      autoClose: 2500
    }

    setTimeout(() => {
      if (!webNotification.permissionGranted)
        webNotification.showNotification('Thanks!', GrantedOptions)
    }, 10000)

    setInterval(() => {
      api.getMatches()
        .then(res => {
          if (res.all_match_ids[0] != vm.data.all_match_ids[0]) {
            console.log(res, vm.data);
            (res.wins > vm.data.wins) ?
              webNotification.showNotification(notificationTitle, WinOptions)
              : webNotification.showNotification(notificationTitle, LoseOptions)
            vm.data = res;
          } else {
            console.log('no change, tell him to go play some dota')
          }
        })
    }, 100000)

    var getMatches = function () {
      api.getMatches()
        .then(res => {
          vm.loading = false;
          vm.data = res;
          if (res.success === false) {
            loadOfflineData();
          }
        })
    }

    vm.getGiphy = function () {
      let n = vm.data.wins;
      let search = searchArr[n - 1];
      api.getGiphy(search)
        .then(res => {
          let gif = res.data[Math.floor(Math.random() * res.data.length)].embed_url;
          vm.gif = gif
        }).catch(err => {
          loadOfflineGifs()
        })
    }

    vm.trustSrc = function (src) {
      return $sce.trustAsResourceUrl(src);
    }

    setTimeout(() => {
      getMatches();
    }, 2500)


    function loadOfflineData() {
      let data = {
        'all_match_ids': [],
        'total': undefined,
        'wins': undefined
      }
      mood.tables.forEach(table => {
        mood[table.name]
          .toArray()
          .then(res => {
            res[0].map(r => {
              data[table.name] = r
            });
          }).then(() => {
            console.log(data)
          })
        vm.loading = false;
        return vm.data = data
      });
    }

    function loadOfflineGifs() {
      mood.gifs.toArray()
        .then(res => {
          // console.log(res[0][0])
          let gif = res[0][Math.floor(Math.random() * res[0].length)];
          vm.gif = gif
        })
    }

  }
  /*
  Bind Controller to the View
  */
  angular
    .module('app')
    .controller('MainController', MainController)
  MainController.$inject = ['$scope', 'moodService', '$sce', 'webNotification', 'moodFactory'];
})(this);
