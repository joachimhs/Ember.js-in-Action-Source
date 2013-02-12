var Notes = Ember.Application.create();

/** Router **/
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
    content: []
});

Notes.SelectedNoteController = Ember.ObjectController.extend({
    contentBinding: 'notesController.selectedNote',
    notesController: null
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

Notes.initialize();

//** Templates **/
Ember.TEMPLATES['application'] = Ember.Handlebars.compile('' +
    '{{outlet}}' +
    '{{render selectedNote}}'
);

Ember.TEMPLATES['notes'] = Ember.Handlebars.compile(''
);

Ember.TEMPLATES['selectedNote'] = Ember.Handlebars.compile(''
);