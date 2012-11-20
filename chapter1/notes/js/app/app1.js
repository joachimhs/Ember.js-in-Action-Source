var Notes = Ember.Application.create();

/** Router **/
Notes.Router = Ember.Router.extend({
    enableLogging: false,
    root: Ember.Route.extend({
        index: Ember.Route.extend({
            route: '/',

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
    content: []
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

Notes.initialize();

//** Templates **/
Ember.TEMPLATES['applicationTemplate'] = Ember.Handlebars.compile('' +
    '{{outlet notes}}{{outlet selectedNote}}'
);

Ember.TEMPLATES['notesTemplate'] = Ember.Handlebars.compile(''
);

Ember.TEMPLATES['selectedNoteTemplate'] = Ember.Handlebars.compile(''
);