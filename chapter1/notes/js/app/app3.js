var Notes = Ember.Application.create();

/** Router **/
Notes.Router = Ember.Router.extend({
    enableLogging: false,
    root: Ember.Route.extend({
        index: Ember.Route.extend({
            route: '/',

            createNewNote: function(router) {
                router.get('notesController').createNewNote();
            },

            doDeleteNote: function(router) {
                $("#confirmDeleteConfirmDialog").modal({show: true});
            },

            doConfirmDelete: function(router) {
                router.get('notesController').deleteSelectedNote();
                $("#confirmDeleteConfirmDialog").modal('hide');
            },

            doCancelDelete: function(router) {
                $("#confirmDeleteConfirmDialog").modal('hide');
            },

            connectOutlets: function(router) {
                router.get('applicationController')
                    .connectOutlet('notes', 'notes');
                router.get('applicationController')
                    .connectOutlet('selectedNote', 'selectedNote');
                router.get('selectedNoteController')
                    .connectControllers('notes');
            }
        })
    })
});

/** Controllers **/
Notes.ApplicationController = Ember.Controller.extend({});

Notes.NotesController = Ember.ArrayController.extend({
    content: [],
    newNoteName: null,

    createNewNote: function() {
        var content = this.get('content');
        var newNoteName = this.get('newNoteName');
        var unique = true;
        content.forEach(function(note) {
            if (newNoteName === note.get('name')) { unique = false; return; }
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

    deleteSelectedNote: function() {
        var selectedNote = this.get('selectedNote');
        if (selectedNote) {
            this.get('content').removeObject(selectedNote);
            this.set('selectedNote', null);
        }
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
    templateName: 'notesTemplate',
    classNames: ['azureBlueBackground', 'azureBlueBorderThin']
});

Notes.SelectedNoteView = Ember.View.extend({
    elementId: 'selectedNote',
    templateName: 'selectedNoteTemplate'
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


Notes.initialize();

//** Templates **/
Ember.TEMPLATES['applicationTemplate'] = Ember.Handlebars.compile('' +
    '{{outlet notes}}{{outlet selectedNote}}' +
    '{{view Notes.ConfirmDialogView ' +
        'elementId="confirmDeleteConfirmDialog" ' +
        'okAction="doConfirmDelete" ' +
        'cancelAction="doCancelDelete" ' +
        'target="Notes.router" ' +
        'header="Delete selected note?" ' +
        'message="Are you sure you want to delete the selected Note? This action cannot be be undone!"' +
    '}}'
);

Ember.TEMPLATES['confirmDialog'] = Ember.Handlebars.compile(
    '<div class="modal-header centerAlign">' +
        '<button type="button" class="close" data-dismiss="modal" class="floatRight">×</button>' +
        '<h1 class="centerAlign">{{view.header}}</h1>' +
    '</div>' +
    '<div class="modal-body">' +
        '{{view.message}}' +
    '</div>' +
    '<div class="modal-footer">' +
        '{{#if view.cancelAction}}' +
            '{{view Notes.BootstrapButton ' +
                'contentBinding="view.cancelButtonLabel" ' +
                'actionBinding="view.cancelAction" ' +
                'targetBinding="view.target"}}' +
        '{{/if}}' +
        '{{#if view.okAction}}' +
            '{{view Notes.BootstrapButton ' +
                'contentBinding="view.okButtonLabel" ' +
                'actionBinding="view.okAction" ' +
                'targetBinding="view.target"}}' +
        '{{/if}}' +
    '</div>'
);

Ember.TEMPLATES['notesTemplate'] = Ember.Handlebars.compile('' +
    '{{view Notes.TextField target="Notes.router" action="createNewNote" classNames="input-small search-query mediumTopPadding" valueBinding="controller.newNoteName"}}' +
    '<button class="btn" {{action createNewNote}}>New Note</button>' +
    '{{view Notes.NoteListView}}'
);

Ember.TEMPLATES['selectedNoteTemplate'] = Ember.Handlebars.compile('' +
    '{{#if controller.content}}' +
        '<h1>{{name}}</h1>' +
        '{{view Ember.TextArea valueBinding="value"}}' +
    '{{/if}}'
);