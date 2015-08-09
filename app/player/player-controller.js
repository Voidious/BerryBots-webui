/*
  Copyright (C) 2014 - Voidious

  This software is provided 'as-is', without any express or implied
  warranty.  In no event will the authors be held liable for any damages
  arising from the use of this software.

  Permission is granted to anyone to use this software for any purpose,
  including commercial applications, and to alter it and redistribute it
  freely, subject to the following restrictions:

  1. The origin of this software must not be misrepresented; you must not
     claim that you wrote the original software. If you use this software
     in a product, an acknowledgment in the product documentation would be
     appreciated but is not required.
  2. Altered source versions must be plainly marked as such, and must not be
     misrepresented as being the original software.
  3. This notice may not be removed or altered from any source distribution.
*/

var playberrybots = playberrybots || {};

playberrybots.Player = [
    '$scope',
    '$rootScope',
    '$location',
    '$routeParams',
    '$sce',
    '$timeout',
    function($scope, $rootScope, $location, $routeParams, $sce, $timeout) {
      $scope.errorLog = $rootScope.errorLog;
      $scope.replayUrl = $sce.trustAsResourceUrl('/replays/' + $routeParams.replay);
      $scope.showingErrorLog = false;

      $scope.back = function() {
        $location.path('/');
      };

      $scope.showErrorLog = function($event) {
        _gaq.push(['_trackEvent', 'error log', 'open']);

        $scope.showingErrorLog = !$scope.showingErrorLog;
        $timeout(function () { $event.target.blur() }, 0, false);
      };

      $scope.playerKeyDown = function(keyCode) {
        if (keyCode == 27) { // escape
          $scope.showingErrorLog = false;
        }
      };
    }
];
