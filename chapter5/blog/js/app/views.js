Blog.ApplicationView = Ember.View.extend({
    elementId: 'mainArea',
    templateName: 'application'
});

Blog.BlogsView = Ember.View.extend({
    elementId: 'blogsArea',
    templateName: 'blogs'
});

Blog.BlogIndexView = Ember.View.extend({
    templateName: 'blogIndex'
});

Blog.BlogPostView = Ember.View.extend({
    elementId: 'blogPostArea',
    templateName: 'blogPost'
});

Blog.AboutView = Ember.View.extend({
    elementId: 'aboutArea',
    templateName: 'about'
})