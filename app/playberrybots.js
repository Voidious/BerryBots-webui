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

playberrybots.module = angular.module('playberrybots', [
  'ngRoute',
]);

playberrybots.module.config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {
  $routeProvider.when('/replay/:replay', {
    templateUrl: 'player/player.html',
    controller: 'Player',
  }).otherwise({
    templateUrl: 'codeview/codeview.html',
    controller: 'CodeView',
  });
}]);

playberrybots.module.service('matchRunner', playberrybots.matchRunner);
playberrybots.module.service('shipEditor', playberrybots.shipEditor);
playberrybots.module.directive('bbButton', playberrybots.bbButton);
playberrybots.module.directive('bbFocus', playberrybots.bbFocus);
playberrybots.module.directive('bbSpinner', playberrybots.bbSpinner);
playberrybots.module.controller('CodeView', playberrybots.CodeView);
playberrybots.module.controller('Player', playberrybots.Player);
playberrybots.module.filter('bbList', playberrybots.bbList);
