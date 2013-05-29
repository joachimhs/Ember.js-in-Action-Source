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
            return Ember.$.get('/templates2/'+name+'.hbs').then(function(data) {
                Ember.TEMPLATES[name] = Ember.Handlebars.compile(data);
            });
        });

        Ember.RSVP.all(promises).then(function() {
            app.advanceReadiness();
        });
    }
});

var Notes = Ember.Application.create({
    templates: ['application', 'notes', ]
});

/** Router **/
Notes.Router.map(function () {
    this.route('notes', {path: "/"});
});

Notes.NotesRoute = Ember.Route.extend({});

/** Controllers **/
Notes.ApplicationController = Ember.Controller.extend({});

Notes.NotesController = Ember.ArrayController.extend({
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
    needs: ['notes'],
    contentBinding: 'controllers.notes.selectedNote',
});

//** Views **/
Notes.ApplicationView = Ember.View.extend({});

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