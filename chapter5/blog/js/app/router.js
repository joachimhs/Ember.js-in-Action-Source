Blog.router = Ember.Router.create({
    enableLogging: true,
    //location: 'history',
    root: Ember.Route.extend({
        index: Ember.Route.extend({
            route: '/',
            redirectsTo: 'blog'
        }),
        blog: Ember.Route.extend({
            route: '/blog',
            initialState: 'index',

            doReturnToIndex: Ember.Router.transitionTo('blog.index'),
            doNavigateToAbout: Ember.Router.transitionTo('blog.about'),
			doSelectPost: Ember.Route.transitionTo('blogPost'),

            index: Ember.Route.extend({
                route: '/',

                connectOutlets: function(router) {
                    router.get('applicationController')
						.connectOutlet('blogs', Blog.BlogPost.find());
                }
            }),

            blogPost: Ember.Route.extend({
                route: '/post/:blog_post_id',

                connectOutlets: function(router, post) {
                    router.get('applicationController')
						.connectOutlet('blogPost', post);
                }
            }),

            about: Ember.Route.extend({
                route: "/about",

                connectOutlets: function(router) {
                    router.get('applicationController').connectOutlet('about');
                }
            })
        })
    })
});
