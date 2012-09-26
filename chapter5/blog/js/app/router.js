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
			
			doSelectPost: function() {
				var selectedPost = App.router.get('blogsController')
                    .get('selectedPost');
				if (selectedPost) {
					App.router.transitionTo('blog.blogPost', 
						{"post_id": selectedPost.get('id')}
					);
				}
			},

            index: Ember.Route.extend({
                route: '/',

                connectOutlets: function(router) {
                    router.get('applicationController')
						.connectOutlet('blogs', Blog.BlogPost.find());
                }
            }),

            blogPost: Ember.Route.extend({
                route: '/post/:post_id',
				
				doReturnToIndex: Ember.Router.transitionTo('blog.index'),
				
                connectOutlets: function(router, post) {
                    router.get('applicationController')
						.connectOutlet('blogPost');
                    router.get('blogsController')
						.set('selectedPostId', post.post_id);
                }
            })
        })
    })
});
