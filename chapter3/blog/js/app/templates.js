Ember.TEMPLATES['application'] = Ember.Handlebars.compile('' +
    '<h1>Ember.js in Action Blog</h1>' +
    '<div class="headerLinks">' +
    '{{#linkTo "blogIndex"}}Home{{/linkTo}}<span class="middot">&middot;' +
    '{{#linkTo "about"}}About{{/linkTo}}' +
    '</div>' +
    '{{outlet}}'
);

Ember.TEMPLATES['blogIndex'] = Ember.Handlebars.compile('' +
    '{{#each content}}' +
        '<h1>{{postTitle}}</h1>' +
        '<div class="postDate">{{formattedDate}}</div>' +
        '{{postLongIntro}}<br />' +
        '<br />{{#linkTo "blogPost" this}}Full Article ->{{/linkTo}}' +
        '<hr class="blogSeperator"/>' +
    '{{/each}}'
);

Ember.TEMPLATES['blogPost'] = Ember.Handlebars.compile('' +
    '<div class="postDate">{{formattedDate}}</div>' +
    '<br />{{#linkTo "blogIndex"}}&lt; back{{/linkTo}}' +
    '{{markdown}}' +
    '<br />{{#linkTo "blogIndex"}}&lt; back{{/linkTo}}'
);

Ember.TEMPLATES['about'] = Ember.Handlebars.compile('' +
    '<h1>About</h1>This blog is part of the Ember in Action book. ' +
    'Sample code for chapter 3.'
);