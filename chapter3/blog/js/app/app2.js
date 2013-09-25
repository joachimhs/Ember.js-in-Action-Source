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
    this.resource("blog", {path: "/blog"}, function() {
        this.route("index", {path: '/posts'});
        this.route("post", {path: '/post/:blog_post_id'});
    });
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

Blog.BlogIndexRoute = Ember.Route.extend({
    model: function() {
        return this.modelFor('blog');
    }
});

Blog.BlogPostRoute = Ember.Route.extend({
    model: function(blogPost) {
        return this.store.find('blogPost', blogPost.blog_post_id);
    }
});

Blog.BlogPostController = Ember.ObjectController.extend({
    contentObserver: function() {
        console.log('Blog.BlogPostController contentObserver: ' + this.get('content.id'));
        if (this.get('content')) {
            var page = this.get('content');
            var id = page.get('id');
            $.get("/posts/" + id + ".md", function(data) {
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
    //elementId: 'mainArea'
});
