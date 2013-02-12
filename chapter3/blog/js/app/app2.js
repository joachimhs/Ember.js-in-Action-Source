var Blog = Ember.Application.create({
});

Blog.Router = Ember.Router.extend({
    location: 'hash'
});

Blog.Router.map(function() {
    this.route("index", {path: "/"});
    this.resource("blog", {path: "/blog"}, function() {
        this.route("blogIndex", {path: '/posts'});
        this.route("blogPost", {path: '/post/:blog_post_id'});
    });
});

Blog.IndexRoute = Ember.Route.extend({
    redirect: function() {
        this.transitionTo('blog.blogIndex');
    }
});

Blog.BlogBlogIndexRoute = Ember.Route.extend({
    model: function() {
        return Blog.BlogPost.find();
    }
});

Blog.BlogBlogPostRoute = Ember.Route.extend({
    setupController: function(controller, model) {
        controller.set('content', model);
    }
});

Blog.BlogBlogPostController = Ember.ObjectController.extend({
    content: null,

    contentObserver: function() {
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
    elementId: 'mainArea'
});

Blog.BlogBlogIndexView = Ember.View.extend({
    elementId: 'blogsArea'
});

Blog.BlogBlogPostView = Ember.View.extend({
    elementId: 'blogPostArea'
});

Blog.AboutView = Ember.View.extend({
    elementId: 'aboutArea'
});

Ember.TEMPLATES['application'] = Ember.Handlebars.compile('' +
    '<h1>Ember.js in Action Blog</h1>' +
    '{{outlet}}'
);

Ember.TEMPLATES['blog/blogIndex'] = Ember.Handlebars.compile('' +
    '{{#each content}}' +
        '<h1>{{postTitle}}</h1>' +
        '<div class="postDate">{{formattedDate}}</div>' +
        '{{postLongIntro}}<br />' +
        '<br />{{#linkTo "blog.blogPost" this}}Full Article ->{{/linkTo}}' +
        '<hr class="blogSeperator"/>' +
    '{{/each}}'
);

Ember.TEMPLATES['blog/blogPost'] = Ember.Handlebars.compile('' +
    '<div class="postDate">{{formattedDate}}</div>' +
    '{{markdown}}'
);

Blog.store = DS.Store.create({
    adapter:  DS.RESTAdapter.create(),
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
            return (this.get('postDate').getUTCMonth() + 1)
                + "/" + this.get('postDate').getUTCDay()
                + "/" + this.get('postDate').getUTCFullYear();
        }

        return '';
    }.property('postDate').cacheable(),

    postFullUrl: function() {
        return "/blog/post/" + this.get('id');
    }.property('id').cacheable()
});

Blog.BlogPost.reopenClass({
    url: '/blog_posts'
});

Blog.initialize(Blog.router);