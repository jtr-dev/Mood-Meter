(function () {
  'use strict';

  angular
    .module('app')
    .factory('moodService', moodService);
  function moodService($http) {
    var api = {};

    api.getMatches = getMatches;
    api.getGiphy = getGiphy;

    var apiUrl = "https://dota-mood.azurewebsites.net"
    var giphyUrl = "http://api.giphy.com/v1/gifs"
    var giphyKey = "&api_key=dc6zaTOxFJmzC"  //public api key
    function getMatches() {
      return $http.get(apiUrl + '/score').then(handleSuccess, handleError('Error getting all users'));
    }
    function getGiphy(search) {
      return $http.get(giphyUrl + '/search?q=' + search + giphyKey).then(handleSuccess, handleError('Error getting all users'));
    }

    function handleSuccess(res) {
      return res.data;
    }

    function handleError(error) {
      return function () {
        return { success: false, message: error };
      };
    }
    return api;
    // return mood;

  }
})();