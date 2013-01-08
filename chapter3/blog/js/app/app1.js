var Blog = Ember.Application.create({
});

Blog.Router = Ember.Router.extend({
    location: 'hash'
});

Blog.Router.map(function(match) {
    match("/").to("index");
    match("/blog").to("blogIndex");
});

Blog.IndexRoute = Ember.Route.extend({
    redirect: function() {
        this.transitionTo('blogIndex');
    }
});

Blog.BlogIndexRoute = Ember.Route.extend({
    setupControllers: function(controller) {
        console.log('Blog.BlogsRoute setupControllers');
        controller.set('content', Blog.BlogPost.find());
    }
});

Blog.ApplicationView = Ember.View.extend({
    elementId: 'mainArea'
});

Blog.BlogIndexView = Ember.View.extend({
    elementId: 'blogsArea'
});

Blog.ApplicationController = Ember.Controller.extend({});

Blog.BlogIndexControlelr = Ember.ArrayController.extend({
    content: []
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

    //Finding a specific object with a specific ID.
    //Here we are reusing the findAll from above
    find: function(store, type, id) {
        this.findAll(store, type);
    }
});

Blog.store = DS.Store.create({
    adapter:  Blog.Adapter,
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

Blog.BlogPost.reopenClass({
    url: '/blogs.json'
});

Blog.initialize(Blog.router);