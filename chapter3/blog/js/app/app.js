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

//Setting up the adapter to receive data from the server
Blog.Adapter = DS.Adapter.create({
    //Finding all object of a certain type. Fetching from the server
    findAll: function(store, type) {
        var url = type.url;

        console.log('finding all: type: ' + type + ' url: ' + url);

        $.ajax({
            type: 'GET',
            url: url,
            contentType: 'application/json',
            success: function(data) { Blog.store.loadMany(type, data); }
        });
    },

    find: function(store, type, id) {
        this.findAll(store, type);
    }
});

Blog.store = DS.Store.create({
    adapter:  Blog.Adapter,
    revision: 11
});
