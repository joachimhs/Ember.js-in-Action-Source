Ember.Application.reopen({
    init: function() {
        this._super();

        this.loadTemplates();
    },

    templates: [],

    loadTemplates: function() {
        var app = this,
            templates = this.get('templates');

        app.deferReadiness();

        var promises = templates.map(function(name) {
            return Ember.$.get('/templates/'+name+'.hbs').then(function(data) {
                Ember.TEMPLATES[name] = Ember.Handlebars.compile(data);
            });
        });

        Ember.RSVP.all(promises).then(function() {
            app.advanceReadiness();
        });
    }
});

var Notes = Ember.Application.create({
    LOG_TRANSITIONS: true,
    templates: ['application', 'notes', 'confirmDialog', 'selectedNote']
});

/** Router **/
Notes.Router = Ember.Router.extend({});

Notes.Router.map(function () {
    this.route('notes', {path: "/"});
});

Notes.NotesRoute = Ember.Route.extend({
    setupController: function(controller) {
        controller.set('content', []);
        var selectedNoteController = this.controllerFor('selectedNote');
        selectedNoteController.set('notesController', controller);
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
        var unique = newNoteName != null && newNoteName.length > 1;
        content.forEach(function(note) {
            if (newNoteName === note.get('name')) {
                unique = false; return;
            }
        });

        if (unique) {
            content.pushObject(
                Ember.Object.create({"name": newNoteName, "value": ""})
            );
            this.set('newNoteName', null);
        } else {
            alert('Note must have a unique name');
        }
    },

    doDeleteNote: function(note) {
        $("#confirmDeleteConfirmDialog").modal({show: true});
    },

    doConfirmDelete: function() {
        var selectedNote = this.get('selectedNote');
        if (selectedNote) {
            this.get('content').removeObject(selectedNote);
            this.set('selectedNote', null);
        }
        $("#confirmDeleteConfirmDialog").modal('hide');
    },

    doCancelDelete: function() {
        $("#confirmDeleteConfirmDialog").modal('hide');
    }
});

Notes.SelectedNoteController = Ember.ObjectController.extend({
    contentBinding: 'notesController.selectedNote',
    notesController: null
});

//** Views **/
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
    template: Ember.Handlebars.compile('' +
        '{{name}}' +
        '{{#if view.isSelected}}' +
            '<button {{action doDeleteNote this}} class="btn btn-mini floatRight btn-danger smallMarginBottom">Delete</button>' +
        '{{/if}}'),

    classNames: ['pointer', 'noteListItem'],

    classNameBindings: "isSelected",

    isSelected: function() {
        return this.get('controller.selectedNote.name') === this.get('content.name');
    }.property('controller.selectedNote.name'),

    click: function() {
        this.get('controller').set('selectedNote', this.get('content'));
    }
});

Notes.ConfirmDialogView = Ember.View.extend({
    templateName: 'confirmDialog',
    classNames: ['modal', 'hide'],

    cancelButtonLabel: 'Cancel',
    cancelAction: null,
    okButtonLabel: "OK",
    okAction: null,
    header: null,
    message: null,
    target: null
});

Notes.BootstrapButton = Ember.View.extend(Ember.TargetActionSupport, {
    tagName: 'button',
    classNames: ['button'],
    disabled: false,

    click: function() {
        if (!this.get('disabled')) {
            this.triggerAction();
        }
    },

    template: Ember.Handlebars.compile('{{#if view.iconName}}<i {{bindAttr class="view.iconName"}}></i>{{/if}}{{view.content}}')
});