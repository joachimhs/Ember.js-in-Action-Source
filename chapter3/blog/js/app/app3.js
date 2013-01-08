var Blog = Ember.Application.create({});

Blog.BlogPostController = Ember.ObjectController.extend({
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
        this.transitionTo('blogIndex');
    }
});

Blog.BlogIndexRoute = Ember.Route.extend({
    setupControllers: function(controller) {
        console.log('Blog.BlogsRoute setupControllers');
        controller.set('content', Blog.BlogPost.find());
    }
});

Blog.BlogPostRoute = Ember.Route.extend({
    setupControllers: function(controller, model) {
        console.log('Blog.BlogPostRoute setupControllers');
        controller.set('content', model);
    }
});

Blog.ApplicationView = Ember.View.extend({
    elementId: 'mainArea'
});

Blog.BlogIndexView = Ember.View.extend({
    elementId: 'blogsArea'
});

Blog.BlogPostView = Ember.View.extend({
    elementId: 'blogPostArea'
});

Blog.AboutView = Ember.View.extend({
    elementId: 'aboutArea'
});

Ember.TEMPLATES['application'] = Ember.Handlebars.compile('' +
    '<h1>Ember.js in Action Blog</h1>' +
    '<div class="headerLinks">' +
        '{{#linkTo "blogIndex"}}Home{{/linkTo}}<span class="middot">&middot;' +
        '{{#linkTo "about"}}About{{/linkTo}}' +
    '</div>' +
    '{{outlet}}'
);

Ember.TEMPLATES['blogIndex'] = Ember.Handlebars.compile('' +
    '{{#each content}}' +
        '<h1>{{postTitle}}</h1>' +
        '<div class="postDate">{{formattedDate}}</div>' +
        '{{postLongIntro}}<br />' +
        '<br />{{#linkTo "blogPost" this}}Full Article ->{{/linkTo}}' +
        '<hr class="blogSeperator"/>' +
    '{{/each}}'
);

Ember.TEMPLATES['blogPost'] = Ember.Handlebars.compile('' +
    '<div class="postDate">{{formattedDate}}</div>' +
    '<br />{{#linkTo "blogIndex"}}&lt; back{{/linkTo}}' +
    '{{markdown}}' +
    '<br />{{#linkTo "blogIndex"}}&lt; back{{/linkTo}}'
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