var Blog = Ember.Application.create({});

Blog.Router.map(function(match) {
    match("/").to("index");
    match("/blog").to("blogs", function(match) {
        match('/posts').to('blogIndex');
        match('/post/:blog_post_id').to('blogPost')
    });
    match("/about").to("about");
});

Blog.IndexRoute = Ember.Route.extend({
    redirect: function() {
        this.transitionTo('blogs.blogIndex');
    }
});

Blog.BlogsBlogIndexRoute = Ember.Route.extend({
    setupController: function(controller) {
        console.log('Blog.BlogsRoute setupControllers');
        controller.set('content', Blog.BlogPost.find());
    }
});

Blog.BlogsBlogPostRoute = Ember.Route.extend({
    setupController: function(controller, model) {
        console.log('Blog.BlogPostRoute setupControllers');
        controller.set('content', model);
    }
});

Blog.BlogsBlogPostController = Ember.ObjectController.extend({
    content: null,

    contentObserver: function() {
        console.log('Blog.BlogPostController contentObserver: ' + this.get('content.id'));
        if (this.get('content')) {
            var page = this.get('content');

            $.get("/posts/" + this.get('content.id') + ".md", function(data) {
                var converter = new Showdown.converter();
                page.set('markdown', new Handlebars.SafeString(converter.makeHtml(data)));
            }, "text")
                .error(function() {
                    page.set('markdown',  "Unable to find specified page");
                    //TODO: Navigate to 404 state
                });

        }
    }.observes('content')
});

Blog.ApplicationView = Ember.View.extend({
    init: function() {
        this._super();
        console.log('appView init');
    },
    elementId: 'mainArea'
});

Blog.BlogsBlogIndexView = Ember.View.extend({
    elementId: 'blogsArea',
    init: function() {
        this._super();
        console.log('init');
    }
});

Blog.BlogsBlogPostView = Ember.View.extend({
    elementId: 'blogPostArea'
});

Blog.AboutView = Ember.View.extend({
    elementId: 'aboutArea'
});

Ember.TEMPLATES['application'] = Ember.Handlebars.compile('' +
    '<h1>Ember.js in Action Blog</h1>' +
    '<div class="headerLinks">' +
        '{{#linkTo "blogs.blogIndex"}}Home{{/linkTo}}<span class="middot">&middot;' +
        '{{#linkTo "about"}}About{{/linkTo}}' +
    '</div>' +
    '{{outlet}}'
);

Ember.TEMPLATES['blogs/blogIndex'] = Ember.Handlebars.compile('' +
    '{{#each content}}' +
        '<h1>{{postTitle}}</h1>' +
        '<div class="postDate">{{formattedDate}}</div>' +
        '{{postLongIntro}}<br />' +
        '<br />{{#linkTo "blogs.blogPost" this}}Full Article ->{{/linkTo}}' +
        '<hr class="blogSeperator"/>' +
    '{{/each}}'
);

Ember.TEMPLATES['blogs/blogPost'] = Ember.Handlebars.compile('' +
    '<div class="postDate">{{formattedDate}}</div>' +
    '<br />{{#linkTo "blogs.blogIndex"}}&lt; back{{/linkTo}}' +
    '{{markdown}}' +
    '<br />{{#linkTo "blogs.blogIndex"}}&lt; back{{/linkTo}}'
);

Ember.TEMPLATES['about'] = Ember.Handlebars.compile('' +
    '<h1>About</h1>This blog is part of the Ember in Action book. ' +
    'Sample code for chapter 3.'
);

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

Blog.initialize();