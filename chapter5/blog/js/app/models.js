Blog.BlogPost = DS.Model.extend({
    postTitle: DS.attr('string'),
    postDate: DS.attr('string'),
    postShortIntro: DS.attr('string'),
    postLongIntro: DS.attr('string'),
    postFullUrl: function() {
        return "/blog/post/" + this.get('id');
    }.property('id').cacheable(),
    markdown: null
});