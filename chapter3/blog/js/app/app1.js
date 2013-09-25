var Blog = Ember.Application.create({
    log: function(message) {
        if (window.console) console.log(message);
    }
});

Blog.Store = DS.Store.extend({
    adapter: DS.RESTAdapter
});

Blog.BlogPost = DS.Model.extend({
    postTitle: DS.attr('string'),
    postDate: DS.attr('date'),
    postShortIntro: DS.attr('string'),
    postLongIntro: DS.attr('string'),
    postFilename: DS.attr('string'),

    markdown: null,

    formattedDate: function() {
        if (this.get('postDate')) {
            return this.get('postDate').getUTCDay()
                + "/" + (this.get('postDate').getUTCMonth() + 1)
                + "/" + this.get('postDate').getUTCFullYear();
        }

        return '';
    }.property('postDate')
});

Blog.Router = Ember.Router.extend({
    location: 'hash'
});

Blog.Router.map(function() {
    this.route("index", {path: "/"});
    this.route("blog", {path: "/blog"});
});

Blog.IndexRoute = Ember.Route.extend({
    redirect: function() {
        this.transitionTo('blog');
    }
});

Blog.BlogRoute = Ember.Route.extend({
    model: function() {
        return this.store.find('blogPost');
    }
});

Blog.ApplicationView = Ember.View.extend({
    //elementId: 'mainArea'
});
