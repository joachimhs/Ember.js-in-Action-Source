var Notes = Ember.Application.create();

/** Router **/
Notes.Router = Ember.Router.extend({
    root: Ember.Route.extend({
        index: Ember.Route.extend({
            route: '/',

            createNewNote: function(router) {
                router.get('noteListController').pushObject(
                    Ember.Object.create({"name": router.get('noteListController.newNoteName')})
                );
                router.get('noteListController').set('newNoteName', null);
            },

            connectOutlets: function(router) {
                router.get('applicationController').connectOutlet('main');
                router.get('applicationController').connectControllers('noteList');
                router.get('selectedNoteController').connectControllers('noteList');
            }
        })
    })
});

/** Controllers **/
Notes.ApplicationController = Ember.Controller.extend({
    noteListController: null
});

Notes.NoteListController = Ember.ArrayController.extend({
    content: [],
    newNoteName: null,
    selectedNote: null
});

Notes.SelectedNoteController = Ember.ObjectController.extend({
    contentBinding: 'noteListController.selectedNote',
    noteListController: null
});

//** Views **/
Notes.ApplicationView = Ember.View.extend({
    templateName: 'applicationTemplate'
});
Notes.MainView = Ember.View.extend({
    templateName: 'mainTemplate'
})
Notes.LeftPanelView = Ember.View.extend({
    elementId: 'leftPanel',
    templateName: 'leftPanelTemplate',
    classNames: ['azureBlueBackground', 'azureBlueBorderThin']
});
Notes.RightPanelView = Ember.View.extend({
    elementId: 'rightPanel',
    templateName: 'rightPanelTemplate'
});

Notes.NoteListView = Ember.View.extend({
    elementId: 'noteList',
    templateName: 'noteListTemplate'
});

Notes.NoteListItemView = Ember.View.extend({
    template: Ember.Handlebars.compile('{{name}}'),
    classNames: ['pointer', 'noteListItem'],

    classNameBindings: "isSelected",

    isSelected: function() {
        return this.get('controller.noteListController.selectedNote.name') === this.get('content.name');
    }.property('controller.noteListController.selectedNote.name'),

    click: function() {
        this.get('controller.noteListController').set('selectedNote', this.get('content'));
    }
});

Notes.initialize();


//** Templates **/
Ember.TEMPLATES['applicationTemplate'] = Ember.Handlebars.compile('{{outlet}}');

Ember.TEMPLATES['mainTemplate'] = Ember.Handlebars.compile('{{view Notes.LeftPanelView}}{{view Notes.RightPanelView}}');

Ember.TEMPLATES['leftPanelTemplate'] = Ember.Handlebars.compile('' +
    '{{view Ember.TextField classNames="input-small search-query mediumTopPadding" valueBinding="noteListController.newNoteName"}}' +
    '<button class="btn" {{action createNewNote}}>New Note</button>' +
    '{{view Notes.NoteListView}}'
);

Ember.TEMPLATES['rightPanelTemplate'] = Ember.Handlebars.compile('Right Panel');

Ember.TEMPLATES['noteListTemplate'] = Ember.Handlebars.compile('{{#each noteListController}}{{view Notes.NoteListItemView contentBinding="this"}}{{/each}}');