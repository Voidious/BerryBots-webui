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

playberrybots.shipEditor = ['$http', function($http) {
  var editor = null;
  var aceEnabled = false;

  this.initRichCodeEditor = function() {
    aceEnabled = true;
    editor = ace.edit("editor");
    editor.getSession().setMode("ace/mode/lua");
    editor.setTheme("ace/theme/solarized_light");
    editor.getSession().setTabSize(2);
    editor.getSession().setUseSoftTabs(true);
    editor.setHighlightActiveLine(false);
  };

  this.editorText = function(text) {
    if (aceEnabled) {
      if (text === undefined) {
        return editor.getValue();
      }
      editor.setValue(text);
      editor.clearSelection();
      editor.scrollToLine(0);
      editor.moveCursorTo(0, 0);
    }
    return '';
  };

  var loadSnippets = function(code, snippets, statuses, loadCallback) {
    if (snippets == null || snippets.length == 0) {
      if (aceEnabled) {
        editor.setValue(code);
        editor.clearSelection();
        editor.scrollToLine(0);
        editor.moveCursorTo(0, 0);
        editor.focus();
      }

      if (loadCallback) {
        loadCallback(code, statuses);
      }
    } else {
      var snippetFilename = snippets.pop();
      $http.get('/snippets/' + snippetFilename).success(
          function(snippetCode, status) {
            // Strip the default Player code, if present. Kind of icky.
            // TODO: Maybe Player should be snippetized?
            code = code.replace(/\n--+\n-- Player[\s\S]*-- \/Player.*\n--+\n/,
                                '');
            code += '\n' + snippetCode;
            statuses.push(status);
            loadSnippets(code, snippets, statuses, loadCallback);
          });
    }
  }

  var defaultRunCode =  '  move(enemyShips, sensors)\n' +
                        '  fire(enemyShips, sensors)\n';

  this.loadStarterCode = function(botFilename, snippets, runCode, loadCallback) {
    $http.get('/bots/' + botFilename).success(function(code, status) {
      if (snippets.length > 0) {
        code = code.replace(defaultRunCode, runCode);
      }

      snippets = (snippets) ? snippets.reverse() : [];
      loadSnippets(code, snippets, [status], loadCallback);
    });
  };
}];
