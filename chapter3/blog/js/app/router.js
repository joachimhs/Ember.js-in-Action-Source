Blog.Router = Ember.Router.extend({
    location: 'hash'
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
        console.log('indexRoute');
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