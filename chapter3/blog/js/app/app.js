var Blog = Ember.Application.create({
    log: function(message) {
        if (window.console) console.log(message);
    }
});

Blog.Store = DS.Store.extend({
    adapter: DS.RESTAdapter
});
