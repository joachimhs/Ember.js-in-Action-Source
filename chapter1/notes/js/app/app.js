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
Notes.Router.map(function () {
    this.route('notes', {path: "/"});
});

Notes.NotesRoute = Ember.Route.extend();

/** Controllers **/
Notes.ApplicationController = Ember.Controller.extend({});

Notes.NotesController = Ember.ArrayController.extend({
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
            alert('Note must have a unique name of at least 2 characters!');
        }
    },

    doDeleteNote: function() {
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
    needs: ['notes'],
    contentBinding: 'controllers.notes.selectedNote',
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
            '<button {{action doDeleteNote}} class="btn btn-mini floatRight btn-danger smallMarginBottom">Delete</button>' +
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



Notes.Duration = Ember.Object.extend({
    durationSeconds: 0,

    durationString: function(key, value) {
        if (arguments.length === 2 && value) {
            var valueParts = value.split(":");
            if (valueParts.length == 3) {
                var duration = (valueParts[0] * 60 * 60) +
                    (valueParts[1] * 60) + (valueParts[2] * 1);
                this.set('durationSeconds', duration);
            }
        }
        var duration = this.get('durationSeconds');
        var hours   = Math.floor(duration / 3600);
        var minutes = Math.floor((duration - (hours * 3600)) / 60);
        var seconds = Math.floor(duration - (minutes * 60) -
            (hours * 3600));

        //force numbers to have 2 digits: "HH:mm" using slice(-2)
        return ("0" + hours).slice(-2) + ":" +
            ("0" + minutes).slice(-2) + ":" + ("0" + seconds).slice(-2);
    }.property('durationSeconds').cacheable()
});