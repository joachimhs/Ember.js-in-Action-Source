Blog.ApplicationController = Ember.ObjectController.extend({

});

Blog.BlogsController = Ember.ArrayController.extend({
    content: []
});

Blog.BlogPostController = Ember.ObjectController.extend({
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
