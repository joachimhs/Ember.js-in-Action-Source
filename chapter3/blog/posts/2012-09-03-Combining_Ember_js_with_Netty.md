Combining Ember.js With Netty
=============================

This blog post is split up into three parts. The first part consists of a short introduction, while the second and third part will talk about the client-side and the server-side respectably. The last part will also talk about one way in which it is possible to utilize the server-side application in order to keep your development, test and production versions of your client-side app the same without needing the prepackage the JavaScript code. 

Part One - Introduction
-----------------------

The requirements and ideas presented in this blog post came about while I was designing the website for my newly started company, which incidentally (or not really) is the website you are viewing now :) But before we get started, a bit of background is in place. 

I started my programming career writing webapps within the Java Enterprise Edition sphere (J2EE at the time). Having a background in Java webapps means that I have spent the majority of my career writing applications that can be packaged up as either EAR or WAR files. If you do not know what these files are (or even if you do), you can think of them as horrible conglomerate files that contains everything your application needs. Code, libraries, configuration, markup, metadata, images, documents, certificates, context meta-data, you name it. If you can think of any type of application dependency, I'm positive that someone, somewhere, have figured out how include it in one of these files. To be quite frank, these files are where your __seperation of concerns__ come to die. I will talk more about how its possible to break free of these constraints in part three of this post. 

On the other end of the scale I have worked with frontend technologies ranging from Java Servlets, JavaServer Faces, SproutCore and Ember.js. I was first introduced to SproutCore in 2010 and I loved what I was seeing. Finally, a client-side JavaScript framework that truly understood the role of component based development. I quickly started with the work of porting one of my applications from a WAR-heavy JavaServer Faces based application to SproutCore and I loved every step of it, even the rather steep learning curve. But the SproutCore gold-plated medal came with a serious drawback. You were forced into using the rather cumbersome and strange build tools. I say cumbersome and strange because they were so different than anything I was used to from the world of Java. And even though the build tools did work, I found it awkward to have to maintain a ruby environment on both my local machine, as well as on my CI-machines in order to develop my SproutCore based application. Needless to say I was stoked when SproutCore 2.0 promised application development __without__ build tools. Of course, SproutCore 2.0 never happened. Instead members of the SproutCore core team broke out, taking the heart of SproutCore with them, and created Ember.js. 

Part Two - The Power of Ember.js
-----------------------------

At the time of writing, Ember.js exists in version 1.0-pre. What this means is that while the APIs are mostly in place, things might still change before the final 1.0 release. Any code shown in this blog post should work on the 1.0-pre release, as its posted on [Emberjs.com](http://www.emberjs.com/). Ember.js has a number of fantastic features that sets it apart from other frameworks. I will go through the ones I feel are most important in this section. 

### Statecharts - Ember.Router

SproutCore 1.6 came with a fantastic Statechart framework written by Michael Cohen called [KI](http://github.com/FrozenCanuck/Ki). At one time I even wrote a Java-port of KI called [JavaKI](https://github.com/joachimhs/JavaKI) that I used to power the GUI of a Swing based Java application. Keep in mind that JavaKI is not as generalized as it should be :) The idea of statecharts has its origins from the late 1980s, and is explained in detail in a scientific paper published by David Harel i 1987 called [Statecharts: A Visual Formalism For Complex Systems](http://www.wisdom.weizmann.ac.il/~harel/SCANNED.PAPERS/Statecharts.pdf).

Enough with the boring facts and on with the gory details you say ? I agree. 

Summarized in one sentence a statechart is a mechanism for you to express your applications state and the connections between these in a uniform and consistent manner. The beauty of a statechart implementation is that you have to be very specific and detailed in your application design in order to identify your states and the actions that each state is able to perform. I will blatantly quote my own blog post about [Statecharts in SproutCore](http://blog.sproutcore.com/statecharts-in-sproutcore/), posted on the [SproutCore Blog](http://blog.sproutcore.com): 

>There are a number of key factors that needs to be included in each state, so that the states can be combined into a statechart.
>
>- Each state needs to have exactly one clearly defined entry point
>- Each state needs to have at least one clearly defined exit point (the possible transitions available)
>- Each state needs to be able to set up everything required within that state upon state entry
>- Each state needs to be able to tear down anything that is state-specific upon state exit"

You also get a huge benefit if you decide to use the Ember Router inside your application, as you will be building an application where the routes that the user can travel through your application is __explicit__ in __both design and code__. For more detail on the inner workings of statecharts, please refer to the links provided above. 

To move things along, below is an excerpt from the Ember.Router taken from the implementation of this site. 

    HS.router = Ember.Router.create({
    enableLogging: true,
        location: 'history',
        root: Ember.Route.extend({
            enter: function() {
                HS.store.findAll(HS.PageModel);
                HS.store.findAll(HS.BlogPost);
            },

            index: Ember.Route.extend({
                route: '/',

                connectOutlets: function(router) {
                    router.get('applicationController').connectOutlet('pages');
                    router.get('applicationController').connectOutlet('footer', 'footer');

                    var frontPages = HS.store.filter(HS.PageModel, function(data) {
                        if (data.get('parentPage') === null) { return true; }
                    });
                    router.get('pagesController').set('content', frontPages);
                }
            }),
            blogs: Ember.Route.extend({
                route: '/blog',
                initialState: 'index',

                connectOutlets: function(router) {
                    var frontPages = HS.store.filter(HS.PageModel, function(data) {
                        if (data.get('parentPage') === null) { return true; }
                    });

                    router.get('applicationController').connectOutlet('menu', 'menu', frontPages);
                    router.get('applicationController').connectOutlet('footer', 'footer');
                    router.get('applicationController').connectOutlet('blogs', HS.BlogPost.find());
                },

                index: Ember.Route.extend({
                    route: '/',

                    connectOutlets: function(router) {
                        router.get('applicationController').connectOutlet('blogs', HS.BlogPost.find());
                        mixpanel.track("Navigate to Blog");
                    }
                }),

                blog: Ember.Route.extend({
                    route: '/post/:post_id',

                    connectOutlets: function(router, post) {
                        router.get('applicationController').connectOutlet('blogPost');
                        router.get('blogsController').set('selectedPostId', post.post_id);
                        mixpanel.track("Navigate to Blog Post: " + post.post_id);
                    }
                })
            })
        })
    })

The code segment above describes the websites landing page "/", as well as any page that starts with "/blog". It starts out by enabling logging, and setting the location to 'history', meaning that the HTML5 HistoryAPI will be used along with the URLs not having a hash-symbol (#) in them. Next it defines a root state. In Ember 1.0-pre this state is required and special in the sense that you cannot connect any outlets in this state, which is something you can and are expected to in any other state in your application. Summarized the root state is the initial entry-point into your application. We use this states enter() function to fetch data that we know we do need throughout the application so that its ready from the get-go. 

The next state defined is the _index_ state. This state is defined to have _route_ '/', meaning that this route will both respond to and serve the user the "/" URL. In the _connectOutlets()_ function we connect our application's controllers with view, templates and data. 

The next two states define the states required for the site's blog, which you are reading right now. First, the state named _blogs_ belongs to the '/blog' URL ad its initial state is the substate named _index_. Here we connect the outlets that drive the menu, the footer and the main section of the website. The _blogs.index_ state is responsible for serving the list of blog entries along with a short description of each. In this states' _connectOutlets_ function we connect up the controller and view with the data required. In addition we tell mixpanel that the user has indeed navigated to the Blog Index. 

The next and final state in this except, is the _blog_ state which is responsible for displaying the blog posts contents. As you can see the _blogs.blog_ state belongs to the URL '/blog/post/:post_id". The last part of this URL is dynamic and will tell the rest of the application which blog post the user wants to view. As you can see, we are using the second parameter of the connectOutlets function to determine the ID of the blog post we are presenting to the user. 

Using statecharts, or Ember.Router in this case, is a very powerful way to describe how your user interface fits together along with the paths that your users can navigate through your application. Even though a lot of effort and code will go into your applications Router, you do end up with a very structured application that is easier to test and troubleshoot. 

For more information on the Ember.js Router, please see this Guide from the [official Ember.JS website](http://emberjs.com/guides/outlets/#toc_the-router). 

###Templates

By default Ember.js uses Handlebars to define its templates. You are free to implement your own templating engine, or use any other templating engine you are comfortable with. Personally I find that Handlebars solve the common issues around templates in a consistent and thought through manner. Handlebars template can either be defined inside your index.html file within the head-tag of your website or via a call to Ember.Handlebars.compile. Ember lets you define your template separately, or inline within your views. Generally, simple views have inline template definitions while more complex views will utilize a pre-defined template. 

The following two code sections will produce the same result. 

    MyApp.MyView = Ember.View.extend({
	    template: 'This is my <span style="font-weight: 900;">awesome</span> view.'
    })

and

    Ember.HANDLEBARS['myTemplateName] = Ember.Handlebars.compile('' + 
        'This is my <span style="font-weight: 900;">awesome</span> view.');
    
    MyApp.MyView = Ember.View.extend({
	    templateName: 'myTemplateName'
    })

Your templates can contain simple logic to perform conditional statements like (if-else and unless) and  iterations (each), and if your app require a special type of statement you can create your own by registering a Handlebars helper. Having a complete and powerful templating engine built into your web-application makes all the difference to your development.

### Bindings and Observers

Bindings and Observers are two of the most fundamental and powerful features from Ember.js. Bindings lets you connect your object together in such a way that if either side of the binding change, the other side will be updated as well. Observers allow you to observe properties and define custom logic to be performed whenever the observed properties change. I wont go into bindings and observers in detail here. The Ember.js documentation on [Observers](http://emberjs.com/documentation/#toc_observers) and [Bindings](http://emberjs.com/documentation/#toc_bindings) explain the concepts involved. I have also written a short introduction to Bindings in this InfoQ Article: [Ember.js: Rich Web Applications Done Right](http://www.infoq.com/articles/emberjs).

### Client-Side MVC

I have blogged about the Client-Side MVC model before in the blog post [The RIA MVC Model](http://haagen-software.no/blog/post/2011-05-24-The_RIA_MVC_Model). This post was written with SproutCore in mind, but it holds true for Ember.js as well. 

Part Three - Netty on the server-side
-------------------------------------

I want to develop web-applications and I want to be able to use the very same source code, unchanged and un-packaged, during development, test and production. I want to be able to take my web-application and serve it directly from a directory using Apache and mock-data if I want. And when I want to plug in a real backend I want to be able to host this __very same__ directory from my backend-application. When the time comes to put the application into test and production I still want to be able to use the very same source code, without modification. Coming from a Java-background there are a number of issues that arise from wanting to work in this way. I will list the most prominent and important below before I will attempt to give a solution to each of these issues. 

>- Those conglomerate WAR and EAR files means that you have to package and include your web-application inside it
>- Developing everything inside one giant JavaScript file is definitely not the way to go, but serving lots of small script files from your index.html will increase the web-apps load time significantly
>- Your JavaScript needs to be minified
>- You need to run JSLint on your developed JavaScript at some time during the development cycle. 
>- The backend needs to support bookmarkable HTML5 History API-generated URLs.

While I recognize that WAR and EAR files have done the Java ecosystem a big favour early in the web-application-game by standardizing Java Application Servers, I also think that, at this point in time, that they are impeding on creativity, have become cumbersome to use, and are becoming bloatware and redundant. I have spent too many hours trying to streamline an assembly approach between my SproutCore web-application, the Ruby build tools, Maven and the .WAR file structure. It really should not be this hard!

When I stumbled accross [Netty](http://www.netty.io) I finally saw a solution to all of the issues above. __Finally__ there was a tried and tested application framework that would allow me to, rather simply, build a web-app where I could easily build in custom logic while at the same time deploy any web-app in any way I wanted. Java on the server side has a lot going for it, its fast, robust, secure, tried and tested and above all it is very easy to monitor using tools such as [Btrace](http://kenai.com/projects/btrace).

My approach when building this website is simple. I want Netty to be able to host an arbitrary folder on the local disk. This folder is actually a clone of the GitHub repository that hosts the source code for the Ember-based web-app. What this means is that updating the website with new content is as simple as logging into the server with SSH and executing __'git pull'__ from within that directory. A process that can be automated quite easily with any automation tool available.

Since the Git repository for the website contains an index.html file with many JavaScript dependencies, I need a way to convert the following code segment: 

    <script src="/lib/jquery-1.7.1.min.js" type="text/javascript" charset="utf-8"></script>
    <script src="/lib/jquery.transit.js" type="text/javascript" charset="utf-8"></script>
    <script src="/lib/handlebars-1.0.0.beta.6.js" type="text/javascript" charset="utf-8"></script>
    <script src="/lib/ember-1.0.pre.js" type="text/javascript" charset="utf-8"></script>
    <script src="/lib/ember-data-2012-08-22.js" type="text/javascript" charset="utf-8"></script>
    <script src="/lib/showdown.js" type="text/javascript" charset="utf-8"></script>
    <script src="/app/app.js" type="text/javascript" charset="utf-8"></script>
    <script src="/app/templates.js" type="text/javascript" charset="utf-8"></script>
    <script src="/app/models.js" type="text/javascript" charset="utf-8"></script>
    <script src="/app/controllers.js" type="text/javascript" charset="utf-8"></script>
    <script src="/app/views.js" type="text/javascript" charset="utf-8"></script>
    <script src="/app/router.js" type="text/javascript" charset="utf-8"></script>
    <script src="/app/main.js" type="text/javascript" charset="utf-8"></script>

to something like this: 

    <script src="/cachedScript/index.html.js" type="text/javascript" charset="utf-8"></script>

The reason I want to do this is simple. While it is OK to serve the index.html file as-is for development (and possibly also for testing) it is absolutely not OK to serve an index.html with 13 JavaScript dependencies in them because this means that the browser will have to execute 13 different HTTP requests to the server in order to assemble the complete website. 

I have solved this by writing two custom Netty Handlers. One handler will load and parse the index.html file in order to replace each of the __script src__-tags inside the documents _head_-tag with a single __script src__ tag. In addition to this, it needs parse and combine each of the files required - in the right order - before minifying and caching the end result. It then needs to serve the modified index.html file to the browser. The second Handler is responsible for serving the cached scripts to the browser. So in one swoop, two of the requirements from the list above is solved: 

>- Developing everything inside one giant JavaScript file is definately not the way to go, but serving lots of small  script files from your index.html will increase the webapps load time significantly
>- Your JavaScript needs to be minified

In order to support HTML History API URLs the backend needs to know which URLs that will host your application and which will serve data. A third Netty Handler handles this by accepting a list of URL that it will use to serve the index.html file through: 

    routes.add("startsWith:/about");
    routes.add("startsWith:/opensource");
    routes.add("startsWith:/blog");
    routes.add("startsWith:/consultancy");
    routes.add("startsWith:/eurekaj");
    routes.add("startsWith:/btrace");
    routes.add("startsWith:/pages/");
    routes.add("startsWith:/cv");
    routes.add("equals:/index.html");
    routes.add("equals:/");
    routes.add("startsWith:/cachedScript");

As you can see above, the list of _routes_ tell my Netty-based backend which URLs it supports via its handlers. If the path is not in the list of routes, the backend will attempt to serve this file from the file-system (which means the Git-repository directory mentioned above in this case). 

The only thing missing in this pipeline is the execution of JSLint in order to get some verification that the JavaScript doesn't contain bugs. Currently this is a manual step that i perform sort of "on the side" of the pipeline described above. I am, however, working on a solution. 

In addition I have built in plugin-support via the Java ServiceLocator mechanism that will allow me to add additional features and to host different applications, etc. into the Netty Application. These features are not at all ready for general use yet, but it goes a long way to prove that assembling your own custom-made web-app is not only possible, but rather easy using tools available. 

All of the source code mentioned in this blog post is available on GitHub. Keep in mind that most of the Netty-related code is in an early state, and at this point the code is very specific in regards to solving the issues I had for this particular web-application. The situation will improve as time goes by. Consider the Server-side code to be in alpha-state. 

References
----------

- [Netty](https://netty.io)
- [Ember.js](http://emberjs.com)
- [Netty-Webserver GitHub Repo](https://github.com/joachimhs/netty-webserver)
- [Haagen Software Github Repo](https://github.com/joachimhs/haagen-software.no)
- [BTrace](http://kenai.com/projects/btrace)
- [JSMin.java](http://docs.jboss.org/richfaces/latest_3_3_X/en/apidoc_impl/org/ajax4jsf/javascript/JSMin.html)



