var Blog = Ember.Application.create({
});

Blog.Router = Ember.Router.extend({
    location: 'hash'
});

Blog.Router.map(function() {
    this.route("index", {path: "/"});
    this.route("blogIndex", {path: "/blog"});
});

Blog.IndexRoute = Ember.Route.extend({
    redirect: function() {
        this.transitionTo('blogIndex');
    }
});

Blog.BlogIndexRoute = Ember.Route.extend({
    model: function() {
        return Blog.BlogPost.find();
    }
});

Blog.ApplicationView = Ember.View.extend({
    elementId: 'mainArea'
});

Blog.BlogIndexView = Ember.View.extend({
    elementId: 'blogsArea'
});

Blog.ApplicationController = Ember.Controller.extend({});

Blog.BlogIndexController = Ember.ArrayController.extend({
    content: null
});

Ember.TEMPLATES['application'] = Ember.Handlebars.compile('' +
    '<h1>Ember.js in Action Blog</h1>' +
    '{{outlet}}'
);

Ember.TEMPLATES['blogIndex'] = Ember.Handlebars.compile('' +
    '{{#each content}}' +
        '<h1>{{postTitle}}</h1>' +
        '<div class="postDate">{{formattedDate}}</div>' +
        '{{postLongIntro}}<br />' +
        '<hr class="blogSeperator"/>' +
    '{{/each}}'
);

Blog.store = DS.Store.create({
    adapter:  DS.RESTAdapter,
    revision: 11
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
    }.property('postDate').cacheable(),

    postFullUrl: function() {
        return "/blog/post/" + this.get('id');
    }.property('id').cacheable()
});

Blog.initialize();