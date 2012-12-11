"use strict";

var mfc = {

  init: function mfc_Init() {
    var self = this;
    window.addEventListener('load', function mfc_onLoad() {
      window.removeEventListener('load', mfc_onLoad, false);
      var supportsHistory = !!(window.history && history.pushState);
      if (supportsHistory) {
        // Set the popstate handler on a timeout, to avoid the inital load popstate in Webkit
        window.setTimeout(function mfc_onLoadTimeout() {
          window.addEventListener('popstate', function mfc_popstate(e) {
           self.parseQuery(e);
          }, false);
        }, 1);
      }
      self.parseQuery();
    }, false);
  },


  // Wait for user to input bugmail
  acquireBugmail: function mcM_acquireChangeset(errorText) {
    var self = this;

    document.getElementById('getBugmail').style.display = 'block';
    document.getElementById('top').innerHTML = '';
    document.getElementById('table').innerHTML = '';
    document.getElementById('res').innerHTML = '';

    var form = document.getElementById('bugmailForm');
    form.addEventListener('submit', function onBugmailSubmit (e) {
      e.preventDefault();
      self.go('bugmail=' + encodeURIComponent(document.getElementById('bugmail').value));
    }, false);
  },


  onError: function mfc_onError() {
    document.getElementById('witticism').innerHTML = 'Hmm. Something went wrong. Try again?';
    this.acquireBugmail();
  },


  // Callback following load of bug data from Bugzilla. Providing there's no errors, it's time
  // to display the results
  onBugLoad: function mcM_onBugLoad(components) {
    if (!components || components.length == 0) {
      var html = 'Either you mistyped your email, or you haven\'t fixed anything yet.';
      html += ' (<a href="http://www.mozilla.org/contribute">Get Involved!</a>)';
      document.getElementById('witticism').innerHTML = html;
      this.acquireBugmail();
      return;
    }

    var top = components[0].name;
    var witticism = "The results are in...";
    if (top in wit)
      witticism = wit[top];
    document.getElementById('witticism').innerHTML = witticism;
    document.getElementById('top').innerHTML = 'Your favourite component is ' + top;

    var rows = [];
    components.forEach(function compMap(component, index) {
      var str = '<tr class="l' + (index % 2) + '">';
      str += '<td class="name">' + component.name + '</td>'; 
      str += '<td class="percent">' + component.percentage + '%</td>'; 
      rows.push(str);
    });
    var res = document.getElementById('res');
    res.innerHTML = 'Results in full...';
    var div = document.getElementById('table');
    div.innerHTML = '<table id="results">' + rows.join('</tr>') + '</table>';  
  },


  loadBugs: function mfc_loadBugs(bugmail) {
    if (bugmail == 'nobody@mozilla.org') {
      document.getElementById('witticism').innerHTML = 'We\'re not interested in nobody - we\'re interested in you!'; 
      return;
    }

    var form = document.getElementById('getBugmail');
    form.style.display = 'none';
    var witticism = document.getElementById('witticism');
    witticism.innerHTML = 'Loading...';

    var self = this;
    var errorCallback = function mcf_errorCallback(msg) {
      self.onError();
    };
    var loadCallback = function mcf_loadCallback(components) {
      self.onBugLoad(components);
    }; 

    BugData.load(bugmail, loadCallback, errorCallback);
  },


  // Parse URL to display correct content
  parseQuery: function mcM_parseQuery(event) {
    var self = null;
    if (!event)
      self = this;
    else
      self = window.mfc;

    var query = document.location.search;
    if (query) {
      query = query.substring(1);
      var params = query.split('&');
      var paramsObj = {}
      for (var x in params) {
        var p = params[x].split('=');
        paramsObj[p[0]] = p[1];
      }
      if ('bugmail' in paramsObj) {
        var bugmail = decodeURIComponent(paramsObj['bugmail']);
        self.loadBugs(bugmail);
        return;
      }
    }
    self.acquireBugmail();
  },


  // Push a new URL onto history
  go: function mcM_go(query, replace) {
    var newURL = document.location.href.split('?')[0];
    if (query)
      newURL = newURL + '?' + query;

    var supportsHistory = !!(window.history && history.pushState);
    if (supportsHistory) {
      if (replace)
        history.replaceState(null, null, newURL);
      else
        history.pushState(null, null, newURL);
      this.parseQuery();
    } else {
       document.location.href = newURL;
    }
  }
};

mfc.init();
