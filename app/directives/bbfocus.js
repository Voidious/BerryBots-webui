var playberrybots = playberrybots || {};

// Thanks Mark Rajkoc!
// http://stackoverflow.com/questions/14833326/how-to-set-focus-in-angularjs
playberrybots.bbFocus = function($timeout, $parse) {
  return {
    link: function(scope, element, attrs) {
      var model = $parse(attrs.bbFocus);
      scope.$watch(model, function(value) {
        if(value === true) { 
          $timeout(function() {
            element[0].focus(); 
          }, 0);
        }
      });
    }
  };
};
