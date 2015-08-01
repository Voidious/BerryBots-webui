/*
  Copyright (C) 2014-2015 - Voidious

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

// TODO: link to wiki pages for bots and stages

////////////////////////////////////////////////////////////////////////////////
// Configure panel
////////////////////////////////////////////////////////////////////////////////

playberrybots.stageList = ['battle1.lua', 'joust.lua', 'maze1.lua',
                           'maze2.lua', 'vortex.lua', 'lasergallery.lua'];

playberrybots.bots = {
  'randombot.lua': {name: 'RandomBot'},
  'chaser.lua': {name: 'Chaser'},
  'wallhugger.lua': {name: 'WallHugger'},
  'basicbattler.lua': {name: 'BasicBattler'},
  'floatingduck.lua': {name: 'FloatingDuck'},
  'jouster.lua': {name: 'Jouster'}
};

playberrybots.stages = {
  'battle1.lua': {
    name: 'Battle1',
    opponents: ['randombot.lua', 'chaser.lua', 'wallhugger.lua',
                'basicbattler.lua', 'floatingduck.lua'],
    description:
        'Destroy your opponent with lasers and torpedos. Best of 9 rounds. ' +
        'Each of the sample ships provides a unique challenge.',
    oversized: false
  },
  'vortex.lua': {
    name: 'Vortex',
    opponents: [],
    description: 'Your ship is being sucked into a vortex! The force is too ' +
        'strong to out-run it. Slingshot around the vortex or bounce off the ' +
        'meteors and reach the zones in the corners to score.',
    oversized: true
  },
  'maze1.lua': {
    name: 'Maze (easy)',
    opponents: [],
    description: 'Navigate your ship to the zone in the top left corner. ' +
        'You\'re free to touch the walls on this stage, so moving randomly ' +
        'works (eventually).',
    oversized: false
  },
  'maze2.lua': {
    name: 'Maze (hard)',
    opponents: [],
    description: 'Navigate your ship to the zone in the top right corner ' +
        'without touching any walls. This maze is much more challenging.',
    oversized: false
  },
  'joust.lua': {
    name: 'Joust',
    opponents: ['jouster.lua', 'chaser.lua', 'floatingduck.lua'],
    description: 'Ram your opponent off the battle strip.',
    oversized: false
  },
  'lasergallery.lua': {
    name: 'LaserGallery',
    opponents: [],
    description: 'A targeting challenge. Your ship is stationary with only a ' +
        'laser gun. Destroy five enemy ships, one at a time and as quickly ' +
        'as possible.',
    oversized: false
  }
};


////////////////////////////////////////////////////////////////////////////////
// Starter kit
////////////////////////////////////////////////////////////////////////////////

playberrybots.starterKitBot = 'player.lua'

playberrybots.starterMovesList = ['bouncy.lua', 'chase.lua', 'swirly.lua'];

playberrybots.starterMoves = {
  'bouncy.lua': {
    name: 'Bouncy moves',
    modes: ['Battle', 'Maze'],
    description:
        'Moves straight in random directions, fearlessly bouncing off walls.',
    func: 'moveBouncy'
  },
  'chase.lua': {
    name: 'Chase moves',
    modes: ['Battle', 'Joust'],
    description:
        'Moves directly at the enemy ship. If none are visible, idles back ' +
        'and forth in a holding pattern.',
    func: 'moveChase'
  },
  'swirly.lua': {
    name: 'Swirly moves',
    modes: ['Battle', 'Maze'],
    description: 'Moves in long, swirly arcs. Simple but super effective.',
    func: 'moveSwirly'
  },
};

playberrybots.starterGunsList = ['direct.lua', 'linear.lua', 'learning.lua'];

playberrybots.starterGuns = {
  'direct.lua': {
    name: 'Direct guns',
    description: 'Fires directly at the enemy ship.',
    func: 'fireDirectGuns'
  },
  'linear.lua': {
    name: 'Linear guns',
    description: 'Fires at the enemy ship\'s projected location, based on ' +
        'its current speed and heading.',
    func: 'fireLinearGuns'
  },
  'learning.lua': {
    name: 'Learning guns',
    description: 'Fires at the enemy ship\'s projected location, based on ' +
        'its movement history and a simple k-nearest neighbors algorithm.',
    func: 'fireLearningGuns'
  },
};


////////////////////////////////////////////////////////////////////////////////
// Sample bots
////////////////////////////////////////////////////////////////////////////////

playberrybots.sampleBotsList = ['randombot.lua', 'chaser.lua', 'wallhugger.lua',
                                'basicbattler.lua', 'player.lua'];

playberrybots.sampleBots = {
  'randombot.lua': {
    name: 'RandomBot',
    modes: ['Battle', 'Team Battle'],
    description: 'RandomBot moves to randomly selected destinations on the ' +
        'stage and shoots directly at the nearest enemy ship. It can be run ' +
        'as a team of any size. RandomBot was the very first sample bot!'
  },
  'chaser.lua': {
    name: 'Chaser',
    modes: ['Battle', 'Joust', 'Team Battle'],
    description: 'Chaser moves directly at the first ship it sees and fires ' +
        'directly at it. It also supports jousting and can be run as a team ' +
        'of any size.'
  },
  'wallhugger.lua': {
    name: 'WallHugger',
    modes: ['Battle', 'Maze', 'Team Battle'],
    description: 'WallHugger moves along the walls, including around concave ' +
        'corners, and shoots directly at the nearest enemy ship. It can ' +
        'solve some mazes and can be run as a team of any size.'
  },
  'basicbattler.lua': {
    name: 'BasicBattler',
    modes: ['Battle', 'LaserGallery'],
    description: 'BasicBattler shoots lasers with linear targeting and ' +
        'shoots torpedos directly at its opponent. It moves with a simple ' +
        'but effective "minimum risk" movement and is the only sample bot ' +
        'that can hit all the ships in the LaserGallery. It\'s by far the ' +
        'most advanced battle bot among the sample bots.'
  },
  'player.lua': {
    name: 'Player',
    modes: [],
    description: 'Default code. Provides a simple template to build from.'
  },
};


////////////////////////////////////////////////////////////////////////////////
// Code editor
////////////////////////////////////////////////////////////////////////////////

playberrybots.CodeView =
    ['$scope', '$rootScope', '$location', '$window', '$timeout',
     'shipEditor', 'matchRunner',
    function($scope, $rootScope, $location, $window, $timeout, shipEditor,
             matchRunner) {
  // Thanks:
  // http://www.abeautifulsite.net/blog/2011/11/detecting-mobile-devices-with-javascript/
  $scope.isMobile = navigator.userAgent.match(/Android/i) ||
      navigator.userAgent.match(/BlackBerry/i) ||
      navigator.userAgent.match(/iPhone|iPad|iPod/i) ||
      navigator.userAgent.match(/Opera Mini/i) ||
      navigator.userAgent.match(/IEMobile/i);

  $scope.configuring = false;
  $scope.stageHighlighted = false;
  $scope.bots = playberrybots.bots;
  $scope.stageList = playberrybots.stageList;
  $scope.stages = playberrybots.stages;
  $scope.starterBot = playberrybots.starterKitBot;
  $scope.starterMovesList = playberrybots.starterMovesList;
  $scope.starterMoves = playberrybots.starterMoves;
  $scope.starterGunsList = playberrybots.starterGunsList;
  $scope.starterGuns = playberrybots.starterGuns;
  $scope.sampleBotsList = playberrybots.sampleBotsList;
  $scope.sampleBots = playberrybots.sampleBots;
  $scope.sampleBot = $scope.sampleBotsList[0];
  $scope.runningMatch = false;
  $scope.editorText = '';
  $scope.starterKitRunCode = '';
  if (!$scope.isMobile) {
    shipEditor.initRichCodeEditor();
  }

  var getEditorText = function() {
    if ($scope.isMobile) {
      return $scope.editorText;
    }
    return shipEditor.editorText();
  };

  $scope.setEditorText = function(editorText) {
    $scope.editorText = editorText;
    shipEditor.editorText(editorText);
  };

  if ($rootScope.code) {
    $scope.setEditorText($rootScope.code);
  } else {
    shipEditor.loadStarterCode('player.lua', [], '', function(shipCode) {
      $scope.setEditorText(shipCode);
    });
  }

  var defaultOpponent = function(stage) {
    var opponents = $scope.stages[stage].opponents;
    return (opponents.length == 0) ? '<none>' : opponents[0];
  };

  $scope.configureStage = $scope.stage =
      ($rootScope.stage) ? $rootScope.stage : $scope.stageList[0];
  $scope.opponent = ($rootScope.opponent) ?
      $rootScope.opponent : defaultOpponent($scope.stage);
  $scope.movesSnippet = $scope.starterMovesList[0];
  $scope.gunsSnippet = $scope.starterGunsList[0];

  $scope.$watch('configureStage', function() {
    $scope.configureOpponent = defaultOpponent($scope.configureStage);
  });
  $scope.$watch('configuring', function() {
    $scope.saving = false;
  });

  $scope.updateStarterKitRunCode = function() {
    $scope.starterKitRunCode =
        '  ' + playberrybots.starterMoves[$scope.movesSnippet].func +
        '(enemyShips, sensors)\n' +
        '  ' + playberrybots.starterGuns[$scope.gunsSnippet].func +
        '(enemyShips, sensors)\n';
  };

  $scope.$watch('movesSnippet', function() {
    $scope.updateStarterKitRunCode();
  });
  $scope.$watch('gunsSnippet', function() {
    $scope.updateStarterKitRunCode();
  });

  $scope.configure = function(configuring) {
    $scope.configuring = configuring || (configuring === undefined);
  };

  $scope.showStarterKit = function(showStarterKit) {
    $scope.showingStarterKit =
        showStarterKit || (showStarterKit === undefined);
  };

  $scope.showSampleBots = function(showSampleBots) {
    $scope.showingSampleBots =
        showSampleBots || (showSampleBots === undefined);
  };

  $scope.showApiDocs = function($event) {
    _gaq.push(['_trackEvent', 'api-docs', 'open']);

    $window.open('http://berrybots.com/apidoc', '_blank');
    $timeout(function () { $event.target.blur() }, 0, false);
  };

  $scope.opponents = function () {
    var stage = $scope.stage;
    if (stage == null) {
      return [];
    }
    return $scope.stages[$scope.configureStage].opponents;
  };

  $scope.configuringKeyDown = function(keyCode) {
    if (keyCode == 27) { // escape
      $scope.configuring = false;
    } else if (keyCode == 13) {
      $scope.saveMatchConfig();
    }
  };

  $scope.starterKitKeyDown = function(keyCode) {
    if (keyCode == 27) { // escape
      $scope.showingStarterKit = false;
    } else if (keyCode == 13) {
      $scope.saveStarterKit();
    }
  };

  $scope.sampleBotsKeyDown = function(keyCode) {
    if (keyCode == 27) { // escape
      $scope.showingSampleBots = false;
    } else if (keyCode == 13) {
      $scope.loadSelectedSampleBot();
    }
  };

  // TODO: Get UI logic out of controller, make this smoother.
  var highlightStage = function(highlight) {
    if ((highlight != $scope.stageHighlighted) &&
        (!highlight || $scope.stages[$scope.configureStage].oversized)) {
      $scope.stageHighlighted = highlight;
    }
  };

  $scope.highlightStage = function() {
    highlightStage(true);
  };

  $scope.unhighlightStage = function() {
    setTimeout(function() {
      highlightStage(false);
      $scope.$apply();
    }, 120);
  };

  $scope.saveMatchConfig = function() {
    $scope.stage = $scope.configureStage;
    $scope.opponent = $scope.configureOpponent;
    $scope.configure(false);
  };

  $scope.saveStarterKit = function() {
    _gaq.push(['_trackEvent', 'starter kit', 'load moves', $scope.movesSnippet]);
    _gaq.push(['_trackEvent', 'starter kit', 'load guns', $scope.gunsSnippet]);

    shipEditor.loadStarterCode(
        $scope.starterBot,
        [$scope.movesSnippet, $scope.gunsSnippet],
        $scope.starterKitRunCode,
        function(data, status) {
          $scope.showStarterKit(false);
          $scope.setEditorText(data);
        });
  };

  $scope.loadSelectedSampleBot = function() {
    _gaq.push(['_trackEvent', 'samples', 'load bot', $scope.sampleBot]);

    shipEditor.loadStarterCode(
        $scope.sampleBot, [], '',
        function(data, status) {
          $scope.showSampleBots(false);
          $scope.setEditorText(data);
        });
  };

  $scope.runMatch = function() {
    var userCode = getEditorText();
    _gaq.push(['_trackEvent', 'run match', $scope.stage, $scope.opponent, userCode.length]);

    $scope.runningMatch = true;
    $rootScope.code = userCode;
    $rootScope.stage = $scope.stage;
    $rootScope.opponent = $scope.opponent;
    var startTime = new Date().getTime();
    matchRunner.runMatch($scope.stage, $scope.opponent, userCode,
        function(data, status) {
          var endTime = new Date().getTime();
          var elapsedTime = endTime - startTime;
          _gaq.push(['_trackTiming', 'run match', 'load time', elapsedTime,
                     $scope.stage, 100]);

          $rootScope.errorLog = data.errorLog;
          $location.path('/replay/' + data.replay);
          $scope.runningMatch = false;
        }
    );
  };
}];
