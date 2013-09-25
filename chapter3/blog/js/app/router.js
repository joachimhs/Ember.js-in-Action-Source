Blog.Router = Ember.Router.extend({
    location: 'hash'
});

Blog.Router.map(function() {
    this.route("index", {path: "/"});
    this.resource("blog", {path: "/blog"}, function() {
        this.route("index", {path: '/posts'});
        this.route("post", {path: '/post/:blog_post_id'});
    });
    this.route("about", {path: "/about"});
});

Blog.IndexRoute = Ember.Route.extend({
    redirect: function() {
        this.transitionTo('blog.index');
    }
});

Blog.BlogIndexRoute = Ember.Route.extend({
    model: function() {
        return this.store.find('blogPost');
    }
});

Blog.BlogPostRoute = Ember.Route.extend({
    model: function(blogPost) {
        return this.store.find('blogPost', blogPost.blog_post_id);
    }
});