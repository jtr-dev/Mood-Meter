'use strict';
(function (global) {
  /*
    Methods for Controller
  */
  function MainController($scope, api, $sce) {
    var vm = $scope;
    vm.data;
    vm.gif;
    vm.error;
    vm.loading = true;

    $scope.title = 'Example Notification';
    $scope.text = 'This is some notification text.';

    let searchArr = ['i quit', 'sad', 'its happening', 'dota mlg', 'im the best'];

    var getMatches = function () {
      api.getMatches()
        .then(res => {
          vm.loading = false;
          vm.data = res;
          console.log(vm.data);
        }).catch(err => {
          vm.error = err
        })
    }

    vm.getGiphy = function () {
      let n = vm.data.wins;
      let search = searchArr[n - 1];
      api.getGiphy(search)
        .then(res => {
          let gif = res.data[Math.floor(Math.random() * res.data.length)].embed_url;
          vm.gif = gif
        })

    }

    vm.trustSrc = function (src) {
      return $sce.trustAsResourceUrl(src);
    }


    getMatches();
  }
  /*
  Bind Controller to the View
  */
  angular
    .module('app')
    .controller('MainController', MainController)
    .directive('showButton', ['webNotification', function (webNotification) {
      'use strict';

      return {
        restrict: 'C',
        scope: {
          notificationTitle: '=',
          notificationText: '='
        },
        link: function (scope, element) {
          element.on('click', function onClick() {
            webNotification.showNotification(scope.notificationTitle, {
              body: scope.notificationText,
              onClick: function onNotificationClicked() {
                console.log('Notification clicked.');
              },
              autoClose: 4000 //auto close the notification after 4 seconds (you can manually close it via hide function)
            }, function onShow(error, hide) {
              if (error) {
                window.alert('Unable to show notification: ' + error.message);
              } else {
                console.log('Notification Shown.');

                setTimeout(function hideNotification() {
                  console.log('Hiding notification....');
                  hide(); //manually close the notification (you can skip this if you use the autoClose option)
                }, 5000);
              }
            });
          });
        }
      };
    }]);
  MainController.$inject = ['$scope', 'moodService', '$sce'];
})(this);
