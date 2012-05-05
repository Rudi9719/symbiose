//On initialise la fenetre de deconnexion
var logoutWindow = $.w.window({
	icon: new SIcon('actions/logout'),
	title: 'Se d&eacute;connecter',
	width: 350,
	resizable: false
});

var logoutWindowContents = logoutWindow.window('content');

//Contenu de la fenetre
$('<img />').attr('src', new SIcon('actions/logout'))
	.css('float', 'left')
	.appendTo(logoutWindowContents);

logoutWindowContents.append('Voulez-vous vraiment quitter tous les programmes et vous d&eacute;connecter ?');
var buttonContainer = $.w.buttonContainer().appendTo(logoutWindowContents);
$.w.button('Annuler')
	.appendTo(buttonContainer)
	.click(function() {
		logoutWindow.window('close');
	});
$.w.button('Se d&eacute;connecter')
	.click(function() {
		W.Cmd.execute('logout', new W.Callback(function() {
			logoutWindow.window('close');
			W.UserInterface.load();
		}));
	})
	.appendTo(buttonContainer);

//On ouvre la fenetre
logoutWindow.window('open');