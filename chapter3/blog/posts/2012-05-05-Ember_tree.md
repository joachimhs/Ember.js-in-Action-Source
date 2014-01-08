Implementing a Custom Tree Model in Ember
============

Admittedly there are tons of JavaScript Tree implementations out there, so why bother implementing your own ? Well, there are multiple reasons. My reason was that I could implement a customized tree structure, nicely integrated into my Ember.js application without having to figure out how to customize another ready-made tree structure to fit my requirements. A process that is often time consuming and frustrating. 

First off, this is what our final result will look like:

![Ember.js Tree](/chapter3/blog/images/ember_tree1.png)

There are a few things that we can note about the features of this tree structure:

- On the far left there is a disclosure triangle that indicates if the tree node is open or closed
- Each row in the tree has a checkbox that can be ticked in order to select the node
- The user is able to click both the disclosure triangle *and* the node text to open/close the node
- Each sub-node is indented by an extra indentation-step

In addition we have the following non-visible requirements

- The contents of the tree is fetched from the server side via a JSON interface
- Only nodes that are expanded should show its child-nodes

Since our JSON API already exists, our tree needs to be able to use this model, the _EurekaJ.InstrumentationTreeModel_: 

	EurekaJ.InstrumentationTreeItem = DS.Model.extend({
        primaryKey: 'guiPath',
        guiPath: DS.attr('string'),
        name: DS.attr('string'),
        isSelected: DS.attr('boolean'),
        isExpanded: false,
        parentPath: DS.attr('string'),
        hasChildren: DS.attr('boolean'),
        childrenNodes: DS.hasMany('EurekaJ.InstrumentationTreeItem'),
        chartGrid: DS.hasMany('EurekaJ.ChartGridModel'),
        nodeType: DS.attr('string'),
        
        observesSelected: function() {
            if (this.get('isSelected')) {
                EurekaJ.selecedTreeNodesController.selectNode(this);
            } else {
                EurekaJ.selecedTreeNodesController.deselectNode(this);
            }
        }.observes('isSelected'),
        
        guiPathTranslated: function() {
            return this.get('guiPath').replace(/\:/g,'_').replace(/ /g, '�');
        }.property('guiPath')
    });

From the code above we can read that it uses the new Ember Data framework to define its properties. The important properties for this implementation is the properies _guiPath_, _name_, _isSelected_, _isExpanded_ and _childrenNodes_. Also, we can see that this particular model object observes any changes to the _isSelected_ property in order to call functions on the _selectedTreeNodesController_.

Our Tree Menu requires two controllers. One controller to hold all of our tree menu nodes, and one controller to hold our selected nodes. First, lets have a look into our InstrumentationTreeController: 

	EurekaJ.InstrumentationTreeController = Em.ArrayProxy.create({
        content: [],
        rootElement: null,
        
        initializeWithServerContent: function() {
            var root = EurekaJ.store.filter(EurekaJ.InstrumentationTreeItem, function(data) {
                if (data.parentPath === null) { 
                    return true; 
                }
            });
            
            this.set('rootElement', root);
        },
        
        rootElementObserver: Ember.observer(function() {
            var root = this.get('rootElement');
            
            if (root.get('length') > 0) {
                var content = [];
    
                for (index = 0; index < root.get('length'); index++) {
                    //console.log('pushing object: ' + root.objectAt(index).get('name'));
                    content.pushObject(root.objectAt(index));
                }
                
                this.set('content', content);
            }
            
            
        }, 'rootElement.length')
    });

As we can see, our Tree Controller have two properties, our root element holing our the root element(s) that the Ember Data framework returns. The _rootElementObserver_ function observes the length of the rootElement property and makes sure to update the controllers _content_ property when the length of _rootElement_ changes. Note that this controller does not contain a list of all of the nodes in the tree, as each node's child-nodes are contained within the _EurekaJ.InstrumentationTreeItem_ model's _childrenNodes_ property. As we will see later on, the view will only render the nodes that are being displayed on the screen at any one time. This means that our DOM won't be cluttered with lots of rendered nodes that are hidden using, for example, _display: none;_. 

Remember that our _EurekaJ.InstrumentationTreeItem_ had observers for the _isSelected_ property to call the _selectNode_ and _deselectNode_ functions on our _EurekaJ.selectedTreeNodesController_ ? Lets take a look at what these functions do:

	EurekaJ.selecedTreeNodesController = Em.ArrayProxy.create({
        content: [],
        
        selectNode: function(node) {
            if (this.findSelectedNodeIndex(node) == 0) {
                this.get('content').pushObject(node);
            }
        },
        
        deselectNode: function(node) {
            this.get('content').removeObject(node);
        },
        
        findSelectedNodeIndex: function(node) {
            var content = this.get('content');
    
            for (index = 0; index < content.get('length'); index++) {
                if (node === content.objectAt(index)) {
                    return index;
                }
            }
    
            return 0;
        }
    });

As you can see, we only want to push our object to the _content_ array once, and we ensure that we check that the _content_ array does not contain the node we are selecting before pushing it. Ideally this should never happen, but at the same time, we want to be extra cautious and prevent "double selection" from occurring in our application. 

Regardless of how we choose to implement our Tree, the above code - or code similar to it - would be required in your Ember.js application. The view-portion of the code starts with the definition of our Tree view: 

	eurkajTreeMenuView: Em.View.extend({
    	templateName: 'eurekaJTreeTemplate',
        contentBinding: 'EurekaJ.InstrumentationTreeController.content'	
    }),

This tells us that we want to bind our tree views content to the _content_ property of the _EurekaJ.InstrumentationTreeController_ defined above, and that we want to use the template named _eurekaJTreeTemplate_. This template is defined in our index.html file: 

	<script type="text/x-handlebars" data-template-name="eurekaJTreeTemplate">
        <div class="treeView">
			<h1>INSTRUMENTATION MENU</h1>
			{{#each content}}
				{{view EurekaJ.nodeView contentBinding="this"}}
			{{/each}}
		</div>
    </script>

The template iterates over each of our nodes inside the views _content_ property. If you remember back, this means our root nodes, which there are 6 of in our tree (as pictured above). Each node is rendered as an _EurekaJ.nodeView_ view, which simply specifies that each node is rendered using the _tree-node_ template.  

	EurekaJ.nodeView = Ember.View.extend({
        templateName: 'tree-node',
        tagName: 'div'    
    });

And our template: 

	<script type="text/x-handlebars" data-template-name="tree-node">
	   	{{#with content}}
			{{view EurekaJ.nodeContentView contentBinding="this"}}
			
			{{#if isExpanded}}
			<div style="width: 500px;">
	        	{{#each childrenNodes}}
	        		{{#with this}}
	           			<div style="margin-left: 18px;">{{view EurekaJ.nodeView contentBinding="this"}}</div>
	         		{{/with}}
	        	{{/each}}
	      	</div>
			{{/if}}
		{{/with}}
	</script>
	
This is where it starts to get interesting. The template starts out by rendering a view of type _EurekaJ.nodeContentView_. We will look at this implementation a bit later on. The next part is where the view decides if it should render the children node of the current node. If the _isExpanded_ property is set to true, the view will iterate over each of the _childrenNodes_ and render each node of type _EurekaJ.nodeView_, with a left margin of 18 pixels. This will cause the children nodes to be rendered on-screen with an 18 pixel indentation relative to its parent node. The view will recursively keep on rendering its children nodes until it reaches a node where _isExpanded_ resolves to _false_. 

Remember from our requirements that clicking on either the disclosure triangle or on the node text will toggle the _isExpanded_ property ? To implement this functionality, I have implemented each node as set of three views. One for the checkbox, one for the disclosure triangle and one for the node title. 

	EurekaJ.nodeContentView = Ember.View.extend({
        templateName: 'tree-node-content',
        tagName: 'span'
    });

And the _tree-node-content_ template: 

	<script type="text/x-handlebars" data-template-name="tree-node-content">
		{{#with content}}
			{{#unless hasChildren}}
				<span style="margin-right: 17px;"></span>
			{{/unless}}
			{{view Ember.Checkbox valueBinding="isSelected" tagName="span"}}
			{{view EurekaJ.nodeArrowView contentBinding="this"}}
			{{view EurekaJ.nodeTextView contentBinding="this"}}
		{{/with}}
	</script>

The above template tells us that we will render an empty span if the node has no children nodes. In effect this will indent our nodes without children an equal amount of pixels as our disclosure triangle occupies, in order to align the checkboxes neatly:

![Ember.js Tree](/images/ember_tree2.png)

Also, the template tells us that we are rendering the checkbox as a standard Ember.Checkbox view, while the disclosure triangle and the text is rendered in separate views: 

	EurekaJ.nodeTextView = Ember.View.extend({
        templateName: 'tree-node-text',
        tagName: 'span',
        click: function(evt) {
            this.get('content').set('isExpanded', !this.get('content').get('isExpanded'));
        }
    });
    
    EurekaJ.nodeArrowView = Ember.View.extend({
        templateName: 'tree-node-arrow',
        tagName: 'span',
        click: function(evt) {
            this.get('content').set('isExpanded', !this.get('content').get('isExpanded'));
        }
    });

Both of these views implement the _click_ function in order to toggle the nodes _isExpnded_ property. The templates for the above views are listed below: 

	<script type="text/x-handlebars" data-template-name="tree-node-text">
		{{#with content}}
			{{name}}
		{{/with}}
	</script>

    <script type="text/x-handlebars" data-template-name="tree-node-arrow">
		{{#with content}}
			{{#if hasChildren}}
				{{#if isExpanded}}
					<span class="downarrow"></span>
				{{else}}
					<span class="rightarrow"></span>
				{{/if}}
			{{/if}}
		{{/with}}
	</script>
	
There's no magic to any of these templates, and they should start to look familiar to you at this point. One little nifty detail is the implementation of the actual disclosure triangle. Instead of using images, its using empty _span_ tags, styled with some CSS magic to render the triangles: 

	.rightarrow {
        content: '';
        float: left;
        width: 0;
        height: 0;
        margin-left: 5px;
        margin-right: 5px;
        margin-top: 3px;
        border-top: 6px solid transparent;
        border-bottom: 6px solid transparent;
        border-left: 6px solid black;
    }
    
    .downarrow {
        content: '';
        float: left;
        width: 0;
        height: 0;
        margin-left: 5px;
        margin-right: 5px;
        margin-top: 5px;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid black;
    }

Thats all there is to it, and to be honest it took me about two hours to implement the tree in its entirety. Thats two hours including the integration with the rest of the application. I might not have ended up with a versatile solution that can be applied as-is to any application, but I did end up with a rather simple implementation that is customized to my application needs, and which can be easily changed as the requirements to my application grows. Thats a rather big bonus in my book!
