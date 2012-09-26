var Blog = Ember.Application.create({
    log: function(message) {
        if (window.console) console.log(message);
    }
});

//Removing the Camelcase-to-dash convention from Ember Data
DS.Model.reopen({
    namingConvention: {
        keyToJSONKey: function(key) {
            return key;
        },

        foreignKey: function(key) {
            return key;
        }
    }
});

Blog.store = DS.Store.create({
    adapter:  DS.RESTAdapter.create({ bulkCommit: false }),
    revision: 4
});