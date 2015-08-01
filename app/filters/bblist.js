var playberrybots = playberrybots || {};

// Thanks sanusart!
// http://stackoverflow.com/questions/11540157/using-comma-as-list-separator-with-angularjs
playberrybots.bbList = function() {
    return function (input, delimiter) {
      return (input || []).join(delimiter || ', ');
    };
};
