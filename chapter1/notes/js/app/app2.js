var Notes = Ember.Application.create();

/** Router **/
Notes.Router = Ember.Router.extend({});

Notes.Router.map(function (match) {
    match('/').to('notes');
});

Notes.NotesRoute = Ember.Route.extend({
    setupControllers: function(controller) {
        controller.set('content', []);
        var selectedNoteController = this.controllerFor('selectedNote');
        selectedNoteController.set('notesController', controller);
    },

    renderTemplates: function() {
        this.render('notes', {
            outlet: 'notes'
        });

        var selectedNoteController = this.controllerFor('selectedNote');

        this.render('selectedNote', {
            outlet: 'selectedNote',
            controller: selectedNoteController
        });
    }
});

/** Controllers **/
Notes.ApplicationController = Ember.Controller.extend({});

Notes.NotesController = Ember.ArrayController.extend({
    content: [],
    newNoteName: null,

    createNewNote: function() {
        var content = this.get('content');
        var newNoteName = this.get('newNoteName');

        content.pushObject(
            Ember.Object.create({"name": newNoteName, "value": ""})
        );

        this.set('newNoteName', null);
    }
});

Notes.SelectedNoteController = Ember.ObjectController.extend({
    contentBinding: 'notesController.selectedNote',
    notesController: null
});

//** Views **/
Notes.ApplicationView = Ember.View.extend({
    templateName: 'applicationTemplate'
});

Notes.NotesView = Ember.View.extend({
    elementId: 'notes',
    classNames: ['azureBlueBackground', 'azureBlueBorderThin']
});

Notes.SelectedNoteView = Ember.View.extend({
    elementId: 'selectedNote'
});

Notes.TextField = Ember.TextField.extend(Ember.TargetActionSupport, {
    insertNewline: function() {
        this.triggerAction();
    }
});

Notes.NoteListView = Ember.View.extend({
    elementId: 'noteList',
    template: Ember.Handlebars.compile('' +
        '{{#each controller}}' +
        '{{view Notes.NoteListItemView contentBinding="this"}}' +
        '{{/each}}')
});

Notes.NoteListItemView = Ember.View.extend({
    template: Ember.Handlebars.compile('{{name}}'),
    classNames: ['pointer', 'noteListItem'],

    classNameBindings: "isSelected",

    isSelected: function() {
        return this.get('controller.selectedNote.name') === this.get('content.name');
    }.property('controller.selectedNote.name'),

    click: function() {
        this.get('controller').set('selectedNote', this.get('content'));
    }
});

Notes.initialize();

//** Templates **/
Ember.TEMPLATES['application'] = Ember.Handlebars.compile('' +
    '{{outlet notes}}{{outlet selectedNote}}'
);

Ember.TEMPLATES['notes'] = Ember.Handlebars.compile('' +
    '{{view Notes.TextField target="controller" action="createNewNote" classNames="input-small search-query mediumTopPadding" valueBinding="controller.newNoteName"}}' +
    '<button class="btn" {{action createNewNote}}>New Note</button>' +
    '{{view Notes.NoteListView}}'
);

Ember.TEMPLATES['selectedNote'] = Ember.Handlebars.compile('' +
    '{{#if controller.content}}' +
        '<h1>{{name}}</h1>' +
        '{{view Ember.TextArea valueBinding="value"}}' +
    '{{/if}}'
);