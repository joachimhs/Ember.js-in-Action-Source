var Notes = Ember.Application.create({
});

/** Router **/
Notes.Router.map(function () {
    this.route('notes', {path: "/"});
});

Notes.NotesRoute = Ember.Route.extend({
    setupController: function(controller) {
    }
});

/** Controllers **/
Notes.ApplicationController = Ember.Controller.extend({});

Notes.NotesController = Ember.ArrayController.extend({});

Notes.SelectedNoteController = Ember.ObjectController.extend({
    needs: ['notes'],
    contentBinding: 'controllers.notes.selectedNote',
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

//** Templates **/
Ember.TEMPLATES['application'] = Ember.Handlebars.compile('' +
    '{{outlet}}' +
    '{{render selectedNote}}'
);