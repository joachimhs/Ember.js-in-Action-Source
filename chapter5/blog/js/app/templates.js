Ember.TEMPLATES['application'] = Ember.Handlebars.compile('' +
    '<h1>Ember.js in Action Blog</h1>' +
    '<div class="headerLinks">' +
        '<a class="headerLink" {{action doReturnToIndex href=true}}>Home</a><span class="middot">&middot;</span>' +
        '<a class="headerLink" {{action doNavigateToAbout href=true}}>About</a>' +
    '</div>' +
    '{{outlet}}');

Ember.TEMPLATES['blogs'] = Ember.Handlebars.compile('' +
    '{{#each content}}' +
        '{{view Blog.BlogIndexView contentBinding="this"}}' +
    '{{/each}}'
);

Ember.TEMPLATES['blogIndex'] = Ember.Handlebars.compile('' +
    '<h1>{{postTitle}}</h1>' +
    '<div class="postDate">{{formattedDate}}</div>' +
    '{{postLongIntro}}<br />' +
    '<br /><a {{action doSelectPost view.content href=true}}>Full Article -></a>' +
    '<hr class="blogSeperator"/>'
);

Ember.TEMPLATES['blogPost'] = Ember.Handlebars.compile('' +
    '<div class="postDate">{{formattedDate}}</div>' +
    '<br /><a {{action doReturnToIndex href=true}}>&lt;- Back</a>' +
    '{{markdown}}' +
    '<br /><a {{action doReturnToIndex href=true}}>&lt;- Back</a>'
);

Ember.TEMPLATES['about'] = Ember.Handlebars.compile('' +
    '<h1>About</h1>This blog is part of the Ember in Action book. Sample code for chapter 3.'
);








