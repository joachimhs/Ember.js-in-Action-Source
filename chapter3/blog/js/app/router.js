Blog.Router = Ember.Router.extend({
    location: 'hash'
});

Blog.Router.map(function() {
    this.route("index", {path: "/"});
    this.resource("blog", {path: "/blog"}, function() {
        this.route("blogIndex", {path: '/posts'});
        this.route("blogPost", {path: '/post/:blog_post_id'});
    });
    this.route("about", {path: "/about"});
});

Blog.IndexRoute = Ember.Route.extend({
    redirect: function() {
        console.log('indexRoute');
        this.transitionTo('blog.blogIndex');
    }
});

Blog.BlogBlogIndexRoute = Ember.Route.extend({
    model: function() {
        console.log('BlogBlogIndexRoute model');
        return Blog.BlogPost.find();
    }

    //setupController: function(controller) {
    //    console.log('Blog.BlogsRoute setupControllers');
    //    controller.set('content', Blog.BlogPost.find());
    //}
});

Blog.BlogBlogPostRoute = Ember.Route.extend({
    setupController: function(controller, model) {
        console.log('Blog.BlogPostRoute setupControllers');
        controller.set('content', model);
    }
});