/*
  Copyright (C) 2013-2014 - Voidious

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

// Thanks: http://www.abeautifulsite.net/blog/2011/11/detecting-mobile-devices-with-javascript/
var isMobile = {
  Android: function() {
    return navigator.userAgent.match(/Android/i);
  },
  BlackBerry: function() {
    return navigator.userAgent.match(/BlackBerry/i);
  },
  iOS: function() {
    return navigator.userAgent.match(/iPhone|iPad|iPod/i);
  },
  Opera: function() {
    return navigator.userAgent.match(/Opera Mini/i);
  },
  Windows: function() {
    return navigator.userAgent.match(/IEMobile/i);
  },
  any: function() {
    return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS()
            || isMobile.Opera() || isMobile.Windows());
  }
};

function encodeQuery(s) {
  return encodeURI(s).replace(/\+/g, '%2B').replace(/;/g, '%3B');
}

var animatedScrollOnce = false;

function runMatch() {
  showSpinner('run');
  processMatch();
}

function rerunMatch() {
  showSpinner('rerun');
  processMatch();
}

function processMatch() {
  var x = new XMLHttpRequest();
  var stage = document.getElementById('Stage').value;
  var opponent = document.getElementById('Opponent').value;
  var params = 'stage=' + stage + '&opponent=' + opponent
      + '&code=' + encodeQuery(getEditorText());
  _gaq.push(['_trackEvent', 'run match', stage, opponent,
      getEditorText().length]);
  x.open('POST', '/cgi-bin/runmatch.pl', true);
  x.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  var startTime = new Date().getTime();
  x.onreadystatechange = function () {
    if (x.readyState == 4) {
      var endTime = new Date().getTime();
      var elapsedTime = endTime - startTime;
      _gaq.push(['_trackTiming', 'run match', 'load time', elapsedTime, stage, 100]);

      // TODO: split this up
      var parser = new DOMParser();
      var xmlDoc = parser.parseFromString(x.responseText, 'application/xml');

      var player = document.getElementById('player');
      var playerDiv = document.getElementById('playerDiv');
      if (player != null) {
        playerDiv.removeChild(player);
      }

      var errorDiv = document.getElementById('errorDiv');
      if (errorDiv != null) {
        playerDiv.removeChild(errorDiv);
      }

      var errorLogDiv = document.getElementById('errorLogDiv');
      if (errorLogDiv != null) {
        playerDiv.removeChild(errorLogDiv);
      }

      var rerun = document.getElementById('rerun');
      if (rerun == null) {
        var rerun = document.createElement('input');
        rerun.id = 'rerun';
        rerun.type = 'submit';
        rerun.value = 'Rerun Match';
        rerun.className = 'rerunMatch';
        rerun.onclick = function() {
          rerunMatch();
        }
        playerDiv.appendChild(rerun);
      }

      var rerunSpinner = document.getElementById('rerunSpinner');
      if (rerunSpinner == null) {
        rerunSpinner = document.createElement('div');
        rerunSpinner.id = 'rerunSpinner';
        rerunSpinner.className = 'rerunSpinner';
        playerDiv.appendChild(rerunSpinner);
      }

      if (document.getElementById('replayUrl') == null) {
        var ruDiv = document.createElement('div');
        ruDiv.className = 'replayUrlDiv';

        var replayLabel = document.createElement('div');
        replayLabel.className = 'replayLabel';
        replayLabel.innerHTML = 'Replay: ';
        ruDiv.appendChild(replayLabel);

        var input = document.createElement('input');
        input.id = 'replayUrl';
        input.type = 'text';
        input.size = 25;
        input.onfocus = function(e) {
          this.select();
        }
        input.onmouseup = function(e) {
          return false;
        }
        ruDiv.appendChild(input);

        playerDiv.appendChild(ruDiv);
      }

      var errorLog = xmlDoc.getElementsByTagName('e')[0].childNodes[0].nodeValue;
      if (errorLog.length > 0) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'errorDiv';
        errorDiv.className = 'errorDiv';
        var youHaveErrors = document.createElement('span');
        youHaveErrors.className = 'errorSpan';
        youHaveErrors.innerHTML = 'Your bot hit some errors.';
        errorDiv.appendChild(youHaveErrors);

        var errorLink = document.createElement('a');
        errorLink.href = 'javascript:void(0)';
        errorLink.innerHTML = '[ View error log ]';
        errorLink.className = 'uiLink errorLink';
        errorLink.onclick = function() {
          viewErrors(errorLog);
        }
        errorDiv.appendChild(errorLink);
        playerDiv.appendChild(errorDiv);
      }

      player = document.createElement('iframe');
      player.id = 'player';
      player.style.width = '95%';
      var viewportHeight = document.body.clientHeight;
      var playerHeight = Math.max(300, Math.min(document.body.clientWidth,
          Math.min(850, (viewportHeight - 45))));
      playerDiv.style.height = playerHeight + 'px';
      player.style.height = playerHeight + 'px'; 
      hideSpinners();

      var replayPath = '/replays/' + xmlDoc.getElementsByTagName('r')[0].childNodes[0].nodeValue;
      document.getElementById('replayUrl').value =
          'http://' + window.location.hostname + replayPath;

      var delay = 0;
      if (!animatedScrollOnce) {
        delay = 500;
        animatedScrollOnce = true;
        smoothScrollTo(document.body.scrollHeight);
      }
      setTimeout(function() {
        player.src = replayPath;
        document.getElementById('playerDiv').appendChild(player);
        window.scrollTo(0, document.body.scrollHeight);
        if (window.location.hash != '#player') {
          window.location.hash = 'player';
        }
      }, delay);
    }
  };
  x.send(params);
}

function smoothScrollTo(z) {
  delayedScroll(self.pageYOffset, z, 25, 17, (self.pageYOffset < z));
}

function delayedScroll(startY, endY, deltaY, delayMs, scrollingDown) {
  setTimeout(function() {
    var y = startY + ((scrollingDown ? 1 : -1) * deltaY);
    window.scrollTo(0, Math.min(y, endY));
    if (scrollingDown == (y < endY)) {
      delayedScroll(y, endY, deltaY, delayMs, scrollingDown);
    }
  }, delayMs);
}

function doLoadBot(filename) {
  var x = new XMLHttpRequest();
  x.open('GET', '/bots/' + filename, false);
  x.setRequestHeader('Content-Type', 'text/plain');
  x.onreadystatechange = function () {
    if (x.readyState == 4) {
      setEditorText(x.responseText);
    }
  };
  x.send();
}

function loadBot(filename) {
  _gaq.push(['_trackEvent', 'start from', filename]);
  doLoadBot(filename);
}

function setEditorText(text) {
  if (isMobile.any()) {
    document.getElementById('editorArea').value = text;
    // TODO: adjust cursor position if possible
  } else {
    editor.setValue(text);
    editor.clearSelection();
    editor.scrollToLine(0);
    editor.moveCursorTo(0, 0);
  }
}

function getEditorText() {
  if (isMobile.any()) {
    return document.getElementById('editorArea').value;
  } else {
    return editor.getValue();
  }
}

function onStageSelect() {
  var stage = document.getElementById('Stage').value;
  var opponent = document.getElementById('Opponent').value;
  if (stage == 'maze2.lua' || stage == 'lasergallery.lua'
      || stage == 'vortex.lua') {
    selectBot('<none>');
  } else if (stage == 'joust.lua') {
    if (!(opponent == 'jouster.lua' || opponent == 'chaser.lua'
        || opponent == 'floatingduck.lua')) {
      selectBot('jouster.lua');
    }
  } else if (stage == 'battle1.lua') {
    if (opponent == 'jouster.lua' || opponent == '<none>') {
      selectBot('randombot.lua');
    }
  }
}

function selectBot(filename) {
  var opponentSelect = document.getElementById('Opponent');
  for (var x = 0; x < opponentSelect.options.length; x++) {
    if (opponentSelect.options[x].value == filename) {
      opponentSelect.options[x].selected = true;
      return;
    }
  }
}

function viewErrors(errorLog) {
  _gaq.push(['_trackEvent', 'error log', 'open']);
  hideErrors();

  var errorLogDiv = document.createElement('div');
  errorLogDiv.id = 'errorLogDiv';
  errorLogDiv.className = 'errorLogDiv';

  var errorText = document.createElement('p');
  errorText.className = 'errorText';
  errorText.innerHTML = errorLog.replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/ /g, '&nbsp;').replace(/\n/g, '<br>')
      .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
  errorLogDiv.appendChild(errorText);

  var closeLink = document.createElement('a');
  closeLink.innerHTML = '&times;'
  closeLink.href = 'javascript:void(0)';
  closeLink.className = 'closeErrorLog';
  closeLink.onclick = function(e) {
    hideErrors();
  };
  errorLogDiv.appendChild(closeLink);

  var errorTitle = document.createElement('span');
  errorTitle.innerHTML = 'Error Log';
  errorTitle.className = 'errorTitle';
  errorLogDiv.appendChild(errorTitle);

  document.getElementById('playerDiv').appendChild(errorLogDiv);
}

function hideErrors() {
  var errorLogDiv = document.getElementById('errorLogDiv');
  if (errorLogDiv != null) {
    document.getElementById('playerDiv').removeChild(errorLogDiv);
  }
}

function showFeedbackForm() {
  var feedbackDiv = document.createElement('div');
  feedbackDiv.id = 'feedbackDiv';
  feedbackDiv.className = 'feedbackDiv';
  feedbackDiv.innerHTML = '<div>\n'
      + '  <div class="overlayFormLabel">Name (optional):</div>\n'
      + '  <input type="text" id="feedbackName" class="overlayFormInput">\n'
      + '  <br>\n'
      + '  <div class="overlayFormLabel">Email (optional):</div>\n'
      + '  <input type="text" id="feedbackEmail" class="overlayFormInput">\n'
      + '  <textarea rows="6" id="feedbackArea" class="feedbackArea">'
          + '</textarea>\n';

  var closeLink = document.createElement('a');
  closeLink.innerHTML = '&times;'
  closeLink.href = 'javascript:void(0)';
  closeLink.className = 'closeFeedback';
  closeLink.onclick = function(e) {
    hideFeedbackForm();
  };
  feedbackDiv.appendChild(closeLink);

  var feedbackButton = document.createElement('input');
  feedbackButton.id = 'feedbackButton';
  feedbackButton.className = 'feedbackButton';
  feedbackButton.type = 'submit';
  feedbackButton.value = 'Send Feedback';
  feedbackButton.onclick = function(e) {
    document.getElementById('feedbackButton').disabled = true;
    var x = new XMLHttpRequest();
    var params = 'message='
        + encodeQuery(document.getElementById('feedbackArea').value)
        + '&name=' + encodeQuery(document.getElementById('feedbackName').value)
        + '&email=' + encodeQuery(document.getElementById('feedbackEmail').value);
    x.open('POST', '/cgi-bin/feedback.pl', true);
    x.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    x.onreadystatechange = function () {
      if (x.readyState == 4) {
        var feedbackButton = document.getElementById('feedbackButton');
        if (feedbackButton != null) {
          feedbackButton.disabled = true;
        }
      }
      hideFeedbackForm();
    }
    x.send(params);
  };
  feedbackDiv.appendChild(feedbackButton);
  document.getElementById('sendFeedbackDiv').appendChild(feedbackDiv);
  document.getElementById('feedbackArea').focus();
}

function hideFeedbackForm() {
  var feedbackDiv = document.getElementById('feedbackDiv');
  if (feedbackDiv != null) {
    document.getElementById('sendFeedbackDiv').removeChild(feedbackDiv);
  }
}

function showSpinner(prefix) {
  hideSpinner(prefix);
  disableButton('run');
  disableButton('rerun');
  var d = document.getElementById(prefix + 'Spinner');
  if (d != null) {
    d.appendChild(makeSpinner(prefix + 'SpinnerImg'));
  }
}

function disableButton(prefix) {
  var d = document.getElementById(prefix);
  if (d != null) {
    d.disabled = true;
  }
}

function makeSpinner(id) {
  var spinner = document.createElement('img');
  spinner.id = id;
  spinner.src = '/images/spinner.gif';
  return spinner;
}

function hideSpinners() {
  hideSpinner('run');
  hideSpinner('rerun');
}

function hideSpinner(prefix) {
  var d = document.getElementById(prefix);
  if (d != null) {
    d.disabled = false;
    var spinImg = document.getElementById(prefix + 'SpinnerImg');
    if (spinImg != null) {
      document.getElementById(prefix + 'Spinner').removeChild(spinImg);
    }
  }
}

function showCrashCourse() {
  _gaq.push(['_trackEvent', 'crash course', 'open']);
  smoothScrollTo(0);
  var d = document.createElement('div');
  d.id = 'crash';
  d.className = 'crashDiv';

  d.innerHTML = 
      '<div class="crashMenu">'
    + '  <div class="crashMenuContent">'
    + '    <div id="crashIntro" class="crashMenuItem crashMenuItemSelected">'
        + '<a href="javascript:void(0)" '
        + 'onclick="selectCrashMenuItem(\'crashIntro\')">Intro</div>'
    + '    <div id="crashInit" class="crashMenuItem">'
        + '<a href="javascript:void(0)" '
        + 'onclick="selectCrashMenuItem(\'crashInit\')">init()</div>'
    + '    <div id="crashRun" class="crashMenuItem">'
        + '<a href="javascript:void(0)" '
        + 'onclick="selectCrashMenuItem(\'crashRun\')">run()</div>'
    + '    <div id="crashWinning" class="crashMenuItem">'
        + '<a href="javascript:void(0)" '
        + 'onclick="selectCrashMenuItem(\'crashWinning\')">Winning</div>'
    + '    <div id="crashMoreInfo" class="crashMenuItem">'
        + '<a href="javascript:void(0)" '
        + 'onclick="selectCrashMenuItem(\'crashMoreInfo\')">More info</div>'
    + '  </div>'
    + '</div>'
    + '<div id="crashContent" class="crashContent"></div>'
    + '<a href="javascript:void(0)" onclick="hideCrashCourse()" '
        + 'class="closeCrashCourse">&times;</a>';

  document.body.appendChild(d);

  selectCrashMenuItem('crashIntro');
}

function hideCrashCourse() {
  var d = document.getElementById('crash');
  if (d != null) {
    document.body.removeChild(d);
  }
}

function selectCrashMenuItem(id) {
  _gaq.push(['_trackEvent', 'crash course', 'item', id]);
  var d = document.getElementById('crashContent');
  if (id == 'crashIntro') {
    d.innerHTML = getCrashIntroHtml();
  } else if (id == 'crashInit') {
    d.innerHTML = getCrashInitHtml();
  } else if (id == 'crashRun') {
    d.innerHTML = getCrashRunHtml();
  } else if (id == 'crashWinning') {
    d.innerHTML = getCrashWinningHtml();
  } else if (id == 'crashMoreInfo') {
    d.innerHTML = getCrashMoreInfoHtml();
  }
  highlightCrashMenuItem(id);
}

function highlightCrashMenuItem(id) {
  var items = ['crashIntro', 'crashInit', 'crashRun', 'crashWinning',
               'crashMoreInfo'];
  for (var x = 0; x < items.length; x++) {
    var d = document.getElementById(items[x]);
    d.className =
        'crashMenuItem' + (items[x] == id ? ' crashMenuItemSelected' : '');
  }
}

function getCrashIntroHtml() {
  return '<p class="crashIntroText">In BerryBots, you program a ship in '
      + '<a href="http://lua.org" target="_blank">Lua</a> to move around and '
      + 'complete challenges or compete against other ships.</p>'
      + '<p>This is a crash course to help get you started.</p>'
      + '<p>For specific advice, please <a href="javascript:void(0)" '
      + 'onclick="showFeedbackForm()">send feedback</a> or post your question '
      + 'in the <a href="http://berrybots.com/forum" target="_blank">forums</a>.'
      + getCrashNextLink('crashInit');
}

function getCrashInitHtml() {
  return '<img src="/images/crash_init.png" width="530" height="204" alt="init sample">'
      + '<div class="crashInitRunInfo">'
      + '  There are 3 primary commands you can send to your ship:'
      + '  <ul>'
      + '    <li><a href="http://berrybots.com/apidoc/modules/Ship.html#fireThruster" target="_blank">fireThruster(angle, force)</a></li>'
      + '    <li><a href="http://berrybots.com/apidoc/modules/Ship.html#fireLaser" target="_blank">fireLaser(heading)</a></li>'
      + '    <li><a href="http://berrybots.com/apidoc/modules/Ship.html#fireTorpedo" target="_blank">fireTorpedo(heading, distance)</a></li>'
      + '  </ul>'
      + '  You can also set your ship\'s name and colors, fetch its speed, '
      + '  location and heading, and much more. See the full API documentation for '
      + '  <a href="http://berrybots.com/apidoc/modules/Ship.html" target="_blank">Ship</a> '
      + '  and <a href="http://berrybots.com/apidoc/modules/World.html" target="_blank">World</a>'
      + '  modules.'
      + '</div>'
      + getCrashPrevLink('crashIntro')
      + getCrashNextLink('crashRun');
}

function getCrashRunHtml() {
  return '<img src="/images/crash_run.png" width="530" height="115" alt="run sample">'
      + '<div class="crashInitRunInfo">'
      + '  The <tt>enemyShips</tt> parameter is a table, like an array. Each '
      + '  entry has data about an enemy ship. Some of the fields are:'
      + '  <ul>'
      + '    <li><strong>x</strong> and <strong>y</strong> coorinates</li>'
      + '    <li><strong>speed</strong> and <strong>energy</strong></li>'
      + '    <li><strong>heading</strong>, in radians (0 is east, pi / 2 is north)</li>'
      + '  </ul>'
      + '  To fire at the first ship you see, you could start with:<br>'
      + '  <div class="crashCode">'
      + '    <tt>&nbsp;&nbsp;ship:fireLaser(math.atan2(<br>'
          + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;enemyShips[1].y - ship:y(), enemyShips[1].x - ship:x()))</tt><br>'
      + '  </div>'
      + '  See the full API documentation for '
      + '  <a href="http://berrybots.com/apidoc/modules/ShipControl.html#EnemyShip" target="_blank">EnemyShip</a> '
      + '  and <a href="http://berrybots.com/apidoc/modules/Sensors.html" target="_blank">Sensors</a>'
      + '  modules.'
      + '</div>'
      + getCrashPrevLink('crashInit')
      + getCrashNextLink('crashWinning');
}

function getCrashWinningHtml() {
  return 'The gameplay on every stage is different, but many have common '
      + 'goals. Some have you navigate to a specific location.'
      + '<div class="crashImg">'
      + '  <a href="http://berrybots.com/replays/maze2-2013.10.05-17.07.19.html" target="_blank">'
      + '  <img src="/images/crash_stages_move.png" width="250" height="130" alt="Maze">'
      + '  <div class="play replay replay_maze"></div></a>'
      + '</div>'
      + 'On others, you try to destroy all the enemy ships.'
      + '<div class="crashImg">'
      + '  <a href="http://berrybots.com/replays/battle1-2013.10.05-17.03.29.html" target="_blank">'
      + '  <img src="/images/crash_stages_destroy.png" width="250" height="170" alt="Battle">'
      + '  <div class="play replay replay_battle"></div></a>'
      + '</div>'
      + getCrashPrevLink('crashRun')
      + getCrashNextLink('crashMoreInfo');
}

function getCrashMoreInfoHtml() {
  return 'How to win on...'
      + '<ul>'
      + '  <li><a href="http://berrybots.com/wiki/Vortex">Vortex</a> - Reach '
          + 'the zones in the corners to score. Avoid getting sucked into the '
          + 'vortex and watch out for the meteors!</li>'
      + '  <li><a href="http://berrybots.com/wiki/Battle1">Battle</a> - Last '
      + '  ship alive each round wins. Best of 9.</li>'
      + '  <li><a href="http://berrybots.com/wiki/Maze2">Maze</a> - Navigate '
      + '  to the zone without touching any walls.</li>'
      + '  <li><a href="http://berrybots.com/wiki/Joust">Joust</a> - Ram or '
      + '  lure your opponent off the battle strip before they do the same to you.</li>'
      + '</ul>'
      + 'BerryBots and Lua programming resources:'
      + '<ul>'
      + '  <li><a href="http://berrybots.com/specs.html" target="_blank">BerryBots Specs</a>'
          + ' - Basic game rules and physics.</li>'
      + '  <li><a href="http://berrybots.com/apidoc" target="_blank">BerryBots API docs</a></li>'
      + '  <li><a href="http://lua-users.org/wiki/MathLibraryTutorial" target="_blank">Lua math library</a></li>'
      + '  <li><a href="http://berrybots.com/wiki/Category:Samples" target="_blank">BerryBots sample programs</a>'
          + ' - Learn by example, plus lots of code snippets to get you started.</li>'
      + '</ul>'
      + getCrashPrevLink('crashWinning')
      +  '<div class="nextLink"><a href="javascript:void(0)" '
      + 'onclick="hideCrashCourse()">[ Close ]</a></div>';

}

function getCrashPrevLink(prevId) {
  return getCrashLink(prevId, '&lt; Back', 'prevLink');
}

function getCrashNextLink(nextId) {
  return getCrashLink(nextId, 'Next &gt;', 'nextLink');
}

function getCrashLink(id, label, className) {
  return '<div class="' + className + '"><a href="javascript:void(0)" '
      + 'onclick="selectCrashMenuItem(\'' + id + '\')">' + label + '</a></div>';
}

function showEnterLeagueForm() {
  _gaq.push(['_trackEvent', 'enter league', 'open']);
  var leagueDiv = document.createElement('div');
  leagueDiv.id = 'league';
  leagueDiv.className = 'leagueDiv';

  leagueDiv.innerHTML = '<div>\n'
      + '  <div class="overlayFormLabel">Name (optional):</div>\n'
      + '  <input type="text" id="leagueName" class="overlayFormInput">\n'
      + '  <br>\n'
      + '  <div class="overlayFormLabel">Email (optional):</div>\n'
      + '  <input type="text" id="leagueEmail" class="overlayFormInput">\n'

  var closeLink = document.createElement('a');
  closeLink.innerHTML = '&times;'
  closeLink.href = 'javascript:void(0)';
  closeLink.className = 'closeEnterLeague';
  closeLink.onclick = function(e) {
    hideEnterLeagueForm();
  };
  leagueDiv.appendChild(closeLink);

  var leagueInfoDiv = document.createElement('div');
  leagueInfoDiv.className = 'leagueInfo';
  leagueInfoDiv.innerHTML = 'The '
      + '<a href="http://berrybots.com/littleleague.html" target="_blank" '
      + 'class="uiLink">BerryBots Little League</a> is a regularly held, '
      + 'casual BerryBots competition with some light prizes. You can '
      + 'submit the code you\'re working on right from here.'
  leagueDiv.appendChild(leagueInfoDiv);

  var contactDiv = document.createElement('div');
  contactDiv.className = 'contactPrizes';
  contactDiv.innerHTML = 'Name and email are optional, but if you want a shot '
      + 'at a prize, I\'ll need a way to contact you.';
  leagueDiv.appendChild(contactDiv);

  var leagueButton = document.createElement('input');
  leagueButton.id = 'leagueButton';
  leagueButton.className = 'leagueButton';
  leagueButton.type = 'submit';
  leagueButton.value = 'Enter the BerryBots Little League!';
  leagueButton.onclick = function(e) {
    document.getElementById('leagueButton').disabled = true;
    var messageSpan = document.getElementById('messageSpan');
    if (messageSpan != null) {
      leagueDiv.removeChild(messageSpan);
    }

    var x = new XMLHttpRequest();
    var params = '&name=' + encodeQuery(document.getElementById('leagueName').value)
        + '&email=' + encodeQuery(document.getElementById('leagueEmail').value)
        + '&code=' + encodeQuery(getEditorText());
    x.open('POST', '/cgi-bin/enterleague.pl', true);
    x.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    x.onreadystatechange = function () {
      if (x.readyState == 4) {
        var leagueButton = document.getElementById('leagueButton');

        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(x.responseText, 'application/xml');
        var success =
            xmlDoc.getElementsByTagName('success')[0].childNodes[0].nodeValue;
        var message =
            xmlDoc.getElementsByTagName('message')[0].childNodes[0].nodeValue;
        var messageSpan = document.createElement('span');
        messageSpan.id = 'messageSpan';
        if (success.length > 0 && success == 'false') {
          _gaq.push(['_trackEvent', 'enter league', 'error']);
          setTimeout(function() {
            document.getElementById('leagueButton').disabled = false;
          }, 1500);
          messageSpan.className = 'entryMessage entryError';
          messageSpan.innerHTML = message;
        } else {
          _gaq.push(['_trackEvent', 'enter league', 'submitted']);
          messageSpan.className = 'entryMessage entrySuccess';
          messageSpan.innerHTML = 'Success!';
          setTimeout(function() {
            hideEnterLeagueForm();
          }, 1000);
        }
        leagueDiv.appendChild(messageSpan);
      }
    }
    x.send(params);
  };
  leagueDiv.appendChild(leagueButton);

  document.body.appendChild(leagueDiv);
  document.getElementById('leagueName').focus();
}

function hideEnterLeagueForm() {
  var d = document.getElementById('league');
  if (d != null) {
    document.body.removeChild(d);
  }
}

window.addEventListener('load', function() {
  document.body.onkeydown = function(e) {
    if (e.which == 27) { // escape
      hideErrors();
      hideFeedbackForm();
      hideCrashCourse();
      hideEnterLeagueForm();
    }
  };
  doLoadBot('player.lua');
});
