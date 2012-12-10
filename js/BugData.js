"use strict";

var BugData = {
  bugs: {},
  fields: 'id,product,component',
  bugzilla: bz.createClient(),

  load: function BD_load(bugmail, loadCallback, errorCallback) {
    var params = {email1 : bugmail,
              email1_type: 'equals',
              email1_assigned_to: 1,
              resolution: 'fixed',
              include_fields: this.fields};

    var self = this;
    var callback  = function BD_LoadCallback(errmsg, data) {
      if (errmsg)
        errorCallback(errmsg);
      else
        self.parseData(data, loadCallback, errorCallback);
    };

    this.bugzilla.searchBugs(params, callback);
  },


  parseData: function BD_parseData(data, loadCallback, errorCallback) {
    if (!data) {
      errorCallback();
      return;
    }

    if (data.length == 0) {
      loadCallback(data);
      return;
    }

    var componentsDict = {};
    var count = 0;
    data.forEach(function (bug) {
      var comp = bug.product + ':' + bug.component;
      if (!(comp in componentsDict))
        componentsDict[comp] = 0;
      componentsDict[comp] += 1;
      count += 1;
    });

    var bugs = [];
    for (var x in componentsDict) {
      bugs.push({name: x, count: componentsDict[x], percentage: (componentsDict[x] / count * 100.0).toFixed(2)});
    }

    bugs.sort(function compare(a, b) {return b.count - a.count});
    loadCallback(bugs);
  }
};
