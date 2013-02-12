var Blog = Ember.Application.create({
    log: function(message) {
        if (window.console) console.log(message);
    }
});

Blog.store = DS.Store.create({
    adapter:  DS.RESTAdapter.create(),
    revision: 11
});
