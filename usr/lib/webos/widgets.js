/**
 * Widgets pour le webos.
* @author $imon <contact@simonser.fr.nf>
* @version 1.0
* @since 1.0
*/

/*
* Objet servant a gerer les widgets sur le webos.
*/
$.webos = {};
/*
* Proprietes des widgets.
*/
$.webos.properties = {};
/*
* Liste des proprietes des widgets.
*/
$.webos.properties.list = {};
/**
* Recuperer les proprietes d'un widget.
* @param string widget Le nom du widget.
* @return object
*/
$.webos.properties.get = function(widget) {
	if (typeof $.webos.properties.list[widget] == 'undefined') {
		return {};
	}
	
	return $.webos.properties.list[widget];
};
/**
* Declarer un widget.
* @param string widget Le nom du widget.
* @param object|string arg1 Les proprietes du widget. Si est le nom d'un widget, le nouveau widget heritera de celui-ci.
* @param object arg2 Si arg1 est le nom d'un widget, arg2 sera les proprietes du widget.
*/
$.webos.widget = function(widget, arg1, arg2) {
	var properties;
	if (typeof arg2 != 'undefined') {
		properties = $.webos.extend($.webos.properties.get(arg1), arg2);
	} else {
		properties = arg1;
	}
	$.webos.properties.list[widget] = properties;
	
	$.widget('weboswidgets.'+widget, properties);
};
var widgetProperties = {
	_name: 'widget',
	options: {
		id: 0,
		pid: null
	},
	_create: function() {
		this.options.id = $.webos.widgets.push(this.element) - 1;
		if (typeof Webos.Process.current() != 'undefined') {
			this.options.pid = Webos.Process.current().getPid();
		}
		this.element.addClass('webos-'+this._name);
		this.element.attr('id', 'webos-widget-'+this.options.id);
	},
	id: function() {
		return this.options.id;
	},
	pid: function() {
		return this.options.pid;
	},
	destroy: function() {
		this._destroy();
		delete $.webos.widgets[this.options.id];
		$.Widget.prototype.destroy.call(this);
	},
	_destroy: function() {},
	_setOption: function(key, value) {
		this.options[key] = value;
		this._update(key, value);
	},
	selector: function() {
		return '#'+this.element.attr('id');
	},
	_update: function() {}
};
$.webos.widget('widget', widgetProperties);
$.webos.widgets = [];
$.webos.getWidgets = function() {
	return $.webos.widgets;
};
$.webos.extend = function(parent, child) {
	child = $.extend(true, {}, parent, child);
	child._parent = function() {
		return parent;
	};
	var reportMethods = function(parentMethod, childMethod) {
		return function() {
			var args = new Array();
			for (var i = 0; i < arguments.length; i++) {
				args.push(arguments[i]);
			}
			parentMethod.apply(this, args);
			return childMethod.apply(this, args);
		};
	};
	for (var attr in child) {
		if (typeof child[attr] == 'function' && typeof parent[attr] == 'function') {
			child[attr] = reportMethods(parent[attr], child[attr]);
		}
		if (child[attr] instanceof Array && parent[attr] instanceof Array) {
			child[attr] = parent[attr].concat(child[attr]);
		}
	}
	return child;
};
/**
* @todo Enlever les widgets crees par le processus.
*/
$.webos.stopProcess = function(proc) {
	var widgets = $.webos.getWidgets();
	for (var i = 0; i < widgets.length; i++) {
		//On enleve les widgets crees par le processus correspondant.
		// ...
		// Not yet implemented
	}
};

//Container
var containerProperties = $.webos.extend($.webos.properties.get('widget'), {
	_name: 'container',
	options: {
		_content: undefined,
		_components: {}
	},
	_create: function() {
		this.options._content = this.element;
	},
	content: function() {
		return this.options._content;
	},
	add: function(element) {
		this.options._content.append(element);
		element.trigger('insert');
	},
	component: function(component) {
		return this.options._components[component];
	}
});
$.webos.widget('container', containerProperties);

$.webos.container = function() {
	return $('<div></div>').container();
};

//ScrollPane
var scrollPaneProperties = $.webos.extend($.webos.properties.get('container'), {
	_name: 'scrollpane',
	options: {
		autoResize: false
	},
	_create: function() {
		this.reload();
		this.options._content = this.element.data('jsp').getContentPane();
		this._update('autoResize', this.options.autoResize);
	},
	_update: function(key, value) {
		switch (key) {
			case 'autoResize':
				var that = this;
				var autoResizeFn = function() {
					that.reload();
				};
				if (value) {
					$(window).resize(autoResizeFn);
				} else {
					$(window).unbind('resize', autoResizeFn);
				}
				break;
		}
	},
	reload: function() {
		this.element.jScrollPane();
	}
});
$.webos.widget('scrollPane', scrollPaneProperties);

$.webos.scrollPane = function() {
	return $('<div></div>').scrollPane();
};

//Label
var labelProperties = $.webos.extend($.webos.properties.get('container'), {
	options: {
		text: ''
	},
	_name: 'label',
	_create: function() {
		this.options._content.html(this.options.text);
	},
	_update: function(key, value) {
		switch(key) {
			case 'text':
				this.options._content.html(this.options.text);
				break;
		}
	}
});
$.webos.widget('label', labelProperties);

$.webos.label = function(text) {
	return $('<div></div>').label({
		text: text
	});
};

//Image
var imageProperties = $.webos.extend($.webos.properties.get('widget'), {
	options: {
		src: '',
		title: 'image'
	},
	_create: function() {
		this.option('title', this.options.title);
		this.option('src', this.options.src);
	},
	_update: function(key, value) {
		switch(key) {
			case 'src':
				this.element.attr('src', value);
				break;
			case 'title':
				this.element.attr('alt', value).attr('title', value);
				break;
		}
	}
});
$.webos.widget('image', imageProperties);

$.webos.image = function(src, title) {
	return $('<img />').image({
		src: src,
		title: title
	});
};

//Progressbar
var progressbarProperties = $.webos.extend($.webos.properties.get('container'), {
	_name: 'progressbar',
	options: {
		value: 0
	},
	_create: function() {
		this.options._content = $('<div></div>', { 'class': 'cursor-wait' }).appendTo(this.element);
		this.element.append(this.content());
		this.value(this.options.value);
	},
	_update: function(key, value) {
		switch(key) {
			case 'value':
				this.value(value);
				break;
		}
	},
	value: function(value) {
		if (typeof value == 'undefined') {
			return this.options.value;
		} else {
			value = parseInt(value);
			if (isNaN(value)) {
				value = 0;
			}
			if (value < 0) {
				value = 0;
			}
			if (value > 100) {
				value = 100;
			}
			this.options.value = value;
			this.content().css('width', value+'%');
		}
	}
});
$.webos.widget('progressbar', progressbarProperties);

$.webos.progressbar = function(value) {
	return $('<div></div>').progressbar({
		value: value
	});
};

//ButtonContainer
var buttonContainerProperties = $.webos.extend($.webos.properties.get('container'), {
	_name: 'button-container'
});
$.webos.widget('buttonContainer', buttonContainerProperties);

$.webos.buttonContainer = function() {
	return $('<div></div>').buttonContainer();
};

//Button
var buttonProperties = $.webos.extend($.webos.properties.get('container'), {
	options: {
		label: 'Bouton',
		icon: undefined,
		submit: false,
		disabled: false,
		showIcon: true,
		showLabel: true
	},
	_name: 'button',
	_create: function() {		
		this._update('submit', this.options.submit);
		this._update('label', this.options.label);
		this._update('disabled', this.options.disabled);
		this._update('icon', this.options.icon);
		this._update('showLabel', this.options.showLabel);
		this._update('showIcon', this.options.showIcon);
	},
	_update: function(key, value) {
		switch (key) {
			case 'submit':
				var submitFn = function() {
					$(this).parents('form').first().submit();
				};
				if (value) {
					this.content().click(submitFn);
				} else {
					this.content().unbind('click', submitFn);
				}
				break;
			case 'label':
				this.content().html(value);
				break;
			case 'disabled':
				this.disabled(value);
			case 'icon':
				break;
			case 'showLabel':
				break;
			case 'showIcon':
				break;
		}
	},
	disabled: function(value) {
		if (typeof value == 'undefined') {
			return this.options.disabled;
		} else {
			this.options.disabled = (value) ? true : false;
			if (!this.element.is('.disabled') && this.options.disabled) {
				this.element.addClass('disabled cursor-default');
			}
			if (this.element.is('.disabled') && !this.options.disabled) {
				this.element.removeClass('disabled cursor-default');
			}
		}
	}
});
$.webos.widget('button', buttonProperties);

$.webos.button = function(label, submit) {
	return $('<span></span>').button({
		label: label,
		submit: submit
	});
};

//List
var listProperties = $.webos.extend($.webos.properties.get('container'), {
	options: {
		columns: [],
		buttons: []
	},
	_name: 'list',
	_create: function() {
		this.options._components.table = $('<table></table>').appendTo(this.element);
		this.options._components.head = $('<thead></thead>').appendTo(this.options._components.table);
		this.options._content = $('<tbody></tbody>').appendTo(this.options._components.table);
		
		for (var i = 0; i < this.options.columns.length; i++) {
			this.addColumn(this.options.columns[i]);
		}
		
		for (var i = 0; i < this.options.buttons.length; i++) {
			this.addButton(this.options.buttons[i]);
		}
	},
	addColumn: function(value) {
		if (this.options._components.head.children('tr').length == 0) {
			this.options._components.head.append($('<tr></tr>'));
		}
		
		this.options._components.head.children('tr').append($('<td></td>').html(value));
	},
	addButton: function(button) {
		if (typeof this.options._components.buttonContainer == 'undefined') {
			this.options._components.buttonContainer = $.w.buttonContainer().appendTo(this.element);
		}
		
		this.options._components.buttonContainer.append(button);
	},
	selection: function() {
		return this.options._content.children('.active');
	},
	_update: function(key, value) {
		switch(key) {
			case 'columns':
				this.options._components.head.children('tr').remove();
				for (var i = 0; i < this.options.columns.length; i++) {
					this.addColumn(this.options.columns[i]);
				}
				break;
			case 'buttons':
				if (typeof this.options._components.buttonContainer != 'undefined') {
					this.options._components.buttonContainer.remove();
				}
				for (var i = 0; i < this.options.buttons.length; i++) {
					this.addButton(this.options.buttons[i]);
				}
				break;
		}
	}
});
$.webos.widget('list', listProperties);

$.webos.list = function(columns, buttons) {
	return $('<div></div>').list({
		columns: columns,
		buttons: buttons
	});
};

//ListItem
var listItemProperties = $.webos.extend($.webos.properties.get('container'), {
	options: {
		columns: [],
		active: false
	},
	_name: 'list-item',
	_create: function() {
		for (var i = 0; i < this.options.columns.length; i++) {
			this.addColumn(this.options.columns[i]);
		}
		
		var that = this;
		
		this.options._content.mousedown(function() {
			that.active(true);
		});
		
		this.active(this.options.active);
	},
	addColumn: function(value) {
		var column = $('<td></td>');
		if (typeof value != 'undefined') {
			column.html(value);
		}
		this.content().append(column);
		return column;
	},
	column: function(id, content) {
		var column;
		if (typeof id == 'undefined') {
			column = this.addColumn();
		} else {
			column = this.content().find('td')[id];
			if (typeof column == 'undefined') {
				column = this.addColumn();
			}
		}
		
		if (typeof content != 'undefined') {
			column.html(content);
		}
		
		return column;
	},
	active: function(value) {
		if (typeof value == 'undefined') {
			return (this.options.active) ? true : false;
		} else {
			if (value) {
				this.options._content.parent('tbody').first().children('tr.active').listItem('active', false);
				this.options._content.addClass('active').trigger('select');
				
				this._trigger('select');
			} else {
				this.options._content.removeClass('active').trigger('unselect');
				
				this._trigger('unselect');
			}
		}
	},
	_update: function(key, value) {
		switch(key) {
			case 'active':
				this.active(value);
				break;
		}
	}
});
$.webos.widget('listItem', listItemProperties);

$.webos.listItem = function(columns) {
	return $('<tr></tr>').listItem({
		columns: columns
	});
};

//IconsList
var iconsListProperties = $.webos.extend($.webos.properties.get('container'), {
	_name: 'iconslist'
});
$.webos.widget('iconsList', iconsListProperties);

$.webos.iconsList = function() {
	return $('<ul></ul>').iconsList();
};

//IconsListItem
var iconsListItemProperties = $.webos.extend($.webos.properties.get('container'), {
	options: {
		icon: '',
		title: '',
		active: false
	},
	_name: 'iconslistitem',
	_create: function() {
		this.options._components.icon = $('<img />').appendTo(this.element);
		this.options._components.title = $('<span></span>').appendTo(this.element);
		
		var that = this;
		
		this.element.mousedown(function() {
			that.active(true);
		});
		
		this._setIcon(this.options.icon);
		this._setTitle(this.options.title);
		this.active(this.options.active);
	},
	_setIcon: function(icon) {
		if (typeof icon == 'undefined') {
			return this.options.icon;
		} else {
			this.options._components.icon.attr('src', icon);
		}
	},
	_setTitle: function(title) {
		if (typeof title == 'undefined') {
			return this.options.title;
		} else {
			if (title == '') {
				this.element.children('br').remove();
			} else {
				$('<br />').insertBefore(this.options._components.title);
			}
			this.options._components.title.html(title);
		}
	},
	active: function(value) {
		if (typeof value == 'undefined') {
			return (this.options.active) ? true : false;
		} else {
			if (value) {
				this.element.parent().children('.active').iconsListItem('active', false);
				this.element.addClass('active');
			} else {
				this.element.removeClass('active');
			}
		}
	},
	_update: function(key, value) {
		switch(key) {
			case 'icon':
				this._setIcon(value);
				break;
			case 'title':
				this._setTitle(value);
				break;
			case 'active':
				this.active(value);
				break;
		}
	}
});
$.webos.widget('iconsListItem', iconsListItemProperties);

$.webos.iconsListItem = function(icon, title) {
	return $('<li></li>').iconsListItem({
		icon: icon,
		title: title
	});
};

//Spoiler
var spoilerProperties = $.webos.extend($.webos.properties.get('container'), {
	_name: 'spoiler',
	options: {
		label: 'Plus',
		shown: false
	},
	_create: function() {
		var that = this;
		
		this.options._components.label = $('<div></div>')
			.addClass('label')
			.html(this.options.label)
			.click(function() {
				that.toggle();
			})
			.appendTo(this.element);
		
		this.options._components.arrow = $('<span></span>')
			.addClass('arrow')
			.prependTo(this.options._components.label);
		
		this.options._content = $('<div></div>').addClass('content').appendTo(this.element);
		
		if (!this.options.shown) {
			this.content().hide();
		}
	},
	show: function() {
		this.content().slideDown();
		this.element.addClass('shown');
		this.options.shown = true;
		this._trigger('show');
	},
	hide: function() {
		this.content().slideUp();
		this.element.removeClass('shown');
		this.options.shown = false;
		this._trigger('hide');
	},
	toggle: function() {
		if (this.options.shown) {
			this.hide();
		} else {
			this.show();
		}
	},
	_update: function(key, value) {
		switch(key) {
			case 'label':
				this.options._components.label.html(value);
				this.options._components.arrow = $('<span></span>')
					.addClass('arrow')
					.prependTo(this.options._components.label);
				break;
			case 'shown':
				if (value) {
					this.show();
				} else {
					this.hide();
				}
				break;
		}
	}
});
$.webos.widget('spoiler', spoilerProperties);

$.webos.spoiler = function(label) {
	return $('<div></div>').spoiler({
		label: label
	});
};

//EntryContainer
var entryContainerProperties = $.webos.extend($.webos.properties.get('container'), {
	_name: 'entry-container',
	_create: function() {
		this.element.submit(function(event) {
			event.preventDefault();
		});
		$('<input />', { type: 'submit', 'class': 'fake-submit' }).appendTo(this.content());
	}
});
$.webos.widget('entryContainer', entryContainerProperties);

$.webos.entryContainer = function() {
	return $('<form></form>').entryContainer();
};

//Entry
var entryProperties = $.webos.extend($.webos.properties.get('container'), {
	options: {
		label: '',
		value: '',
		disabled: false
	},
	_name: 'entry',
	_create: function() {
		var that = this;
		
		this.options._components.label = $('<label></label>')
			.html(this.options.label)
			.click(function() {
				that.options._content.focus();
			});
		this.element.append(this.options._components.label);
	},
	value: function(value) {
		if (typeof value == 'undefined') {
			return this.content().val();
		} else {
			this.content().val(value);
		}
	},
	disabled: function(value) {
		if (typeof value == 'undefined') {
			return this.content().prop('disabled');
		} else {
			this.options.disabled = (value) ? true : false;
			this.content().prop('disabled', this.options.disabled);
			if (this.options.disabled) {
				this.element.addClass('disabled');
			} else {
				this.element.removeClass('disabled');
			}
		}
	},
	_update: function(key, value) {
		switch(key) {
			case 'label':
				this.options._components.label.html(value);
				break;
			case 'disabled':
				this.disabled(value);
				break;
			case 'value':
				this.value(value);
				break;
		}
	}
});
$.webos.widget('entry', entryProperties);

//TextEntry
var textEntryProperties = $.webos.extend($.webos.properties.get('entry'), {
	_name: 'text-entry',
	_create: function() {
		this.options._content = $('<input />', { type: 'text' }).val(this.options.defaultValue);
		this.element.append(this.options._content);
		
		this.value(this.options.value);
	}
});
$.webos.widget('textEntry', textEntryProperties);

$.webos.textEntry = function(label, value) {
	return $('<div></div>').textEntry({
		label: label,
		value: value
	});
};

//SearchEntry
var searchEntryProperties = $.webos.extend($.webos.properties.get('entry'), {
	_name: 'search-entry',
	_create: function() {
		this.options._content = $('<input />', { type: 'text' });
		this.element.append(this.options._content);
	}
});
$.webos.widget('searchEntry', searchEntryProperties);

$.webos.searchEntry = function(label) {
	return $('<div></div>').searchEntry({
		label: label
	});
};

//PasswordEntry
var passwordEntryProperties = $.webos.extend($.webos.properties.get('entry'), {
	_name: 'password-entry',
	_create: function() {
		this.options._content = $('<input />', { type: 'password' });
		this.element.append(this.options._content);
	}
});
$.webos.widget('passwordEntry', passwordEntryProperties);

$.webos.passwordEntry = function(label) {
	return $('<div></div>').passwordEntry({
		label: label
	});
};

//TextAreaEntry
var textAreaEntryProperties = $.webos.extend($.webos.properties.get('entry'), {
	_name: 'textarea-entry',
	_create: function() {
		this.options._content = $('<textarea></textarea>');
		this.element.append(this.options._content);
		
		this.value(this.options.value);
	}
});
$.webos.widget('textAreaEntry', textAreaEntryProperties);

$.webos.textAreaEntry = function(label) {
	return $('<div></div>').textAreaEntry({
		label: label
	});
};

//CheckButton
var checkButtonProperties = $.webos.extend($.webos.properties.get('entry'), {
	options: {
		value: false
	},
	_name: 'checkbutton',
	_create: function() {
		var that = this;
		
		this.options._content = $('<input />', { type: 'checkbox' }).change(function() {
			that.options.value = that.value();
		});
		this.element.prepend(this.content());
		
		this.value(this.options.value);
	},
	value: function(value) {
		if (typeof value == 'undefined') {
			return this.content().prop('checked');
		} else {
			this.options.value = (value) ? true : false;
			this.content().prop('checked', this.options.value);
		}
	}
});
$.webos.widget('checkButton', checkButtonProperties);

$.webos.checkButton = function(label, value) {
	return $('<div></div>').checkButton({
		label: label,
		value: value
	});
};

//RadioButtonContainer
var radioButtonContainerProperties = $.webos.extend($.webos.properties.get('container'), {
	_name: 'radiobutton-container'
});
$.webos.widget('radioButtonContainer', radioButtonContainerProperties);

$.webos.radioButtonContainer = function() {
	return $('<div></div>').radioButtonContainer();
};

//RadioButton
var radioButtonProperties = $.webos.extend($.webos.properties.get('entry'), {
	_name: 'radiobutton',
	_create: function() {
		this.options._content = $('<input />', { type: 'radio' }).change(function() {
			$(this).parents('.webos-radiobutton-container').first().find(':checked').not(this).prop('checked', false);
		});
		
		this.element.prepend(this.options._content);
		this.value(this.options.value);
	},
	value: function(value) {
		if (typeof value == 'undefined') {
			return this.content().prop('checked');
		} else {
			this.options.value = (value) ? true : false;
			this.content().prop('checked', this.options.value);
		}
	}
});
$.webos.widget('radioButton', radioButtonProperties);

$.webos.radioButton = function(label, value) {
	return $('<div></div>').radioButton({
		label: label,
		value: value
	});
};

//SelectButton
var selectButtonProperties = $.webos.extend($.webos.properties.get('entry'), {
	options: {
		choices: {}
	},
	_name: 'selectbutton',
	_create: function() {
		this.options._content = $('<select></select>').appendTo(this.element);
		this._setChoices(this.options.choices);
		this.value(this.options.value);
	},
	_setChoices: function(choices) {
		this.content().empty();
		for (var index in choices) {
			$('<option></option>', { value: index })
				.html(choices[index])
				.appendTo(this.content());
		}
	},
	value: function(choice) {
		if (typeof choice == 'undefined') {
			var selected = this.options._content.children('option:selected');
			if (selected.length == 1) {
				return selected.attr('value');
			} else {
				return;
			}
		} else {
			this.options._content.children('option[value="'+choice+'"]').attr('selected', 'selected');
		}
	},
	_update: function(key, value) {
		switch(key) {
			case 'choices':
				this._setChoices(value);
				break;
		}
	}
});
$.webos.widget('selectButton', selectButtonProperties);

$.webos.selectButton = function(label, choices) {
	return $('<div></div>').selectButton({
		label: label,
		choices: choices
	});
};

//SwitchButton
var switchButtonProperties = $.webos.extend($.webos.properties.get('entry'), {
	options: {
		value: false
	},
	_name: 'switchbutton',
	_create: function() {
		var that = this;
		
		this.options._content = $('<div></div>', { 'class': 'entry off' }).click(function() {
			if (!that.options.disabled) {
				that.toggle();
			}
		}).appendTo(this.element);
		this.options._components.labels = $('<div></div>', { 'class': 'labels' }).appendTo(this.options._content);
		this.options._components.on = $('<div></div>', { 'class': 'label-on' }).html('I').appendTo(this.options._components.labels);
		this.options._components.off = $('<div></div>', { 'class': 'label-off' }).html('O').appendTo(this.options._components.labels);
		this.options._components.slider = $('<div></div>', { 'class': 'slider' }).appendTo(this.options._content);
		this.options._components.slider.draggable({
			containment: 'parent',
			axis: 'x',
			stop: function(event, ui) {
				var ratio = (that.options._components.slider.position().left + that.options._components.slider.outerWidth() / 2) / that.options._content.innerWidth();
				if (ratio > 0.5) {
					that.value(true);
				} else {
					that.value(false);
				}
			}
		});
		
		this.value(this.options.value);
	},
	value: function(choice) {
		if (typeof choice == 'undefined') {
			return this.options.value;
		} else {
			choice = (choice) ? true : false;
			
			if (choice) {
				this.options._content.removeClass('off').addClass('on');
				if (this.element.closest('html').length) {
					this.options._components.slider.animate({
						left: this.options._content.innerWidth() - this.options._components.slider.outerWidth()
					}, 'fast');
				} else {
					this.options._components.slider.css('left', '36px');
				}
			} else {
				this.options._content.removeClass('on').addClass('off');
				if (this.element.closest('html').length) {
					this.options._components.slider.animate({
						left: 0
					}, 'fast');
				} else {
					this.options._components.slider.css('left', '0px');
				}
			}
			
			if (choice != this.options.value) {
				this.options.value = choice;
				this._trigger('change');
			}
		}
	},
	toggle: function() {
		this.value(!this.value());
	},
	disabled: function(value) {
		if (typeof value == 'undefined') {
			return this.options.disabled;
		} else {
			this.options.disabled = (value) ? true : false;
			
			if (this.options.disabled) {
				this.options._components.slider.draggable('disable');
			} else {
				this.options._components.slider.draggable('enable');
			}
		}
	}
});
$.webos.widget('switchButton', switchButtonProperties);

$.webos.switchButton = function(label, value) {
	return $('<div></div>').switchButton({
		label: label,
		value: value
	});
};

//Keyboard
$.webos.keyboard = {};
$.webos.keyboard.systemKey = 'shift';
$.webos.keyboard.keycodes = {
	down: 40,
	up: 38,
	left: 37,
	right: 39,
	
	end: 35,
	begin: 36,
	
	backTab: 8,
	tab: 9,
	shift: 16,
	ctrl: 17,
	enter: 13,
	esc: 27,
	space: 32,
	del: 46,
	
	a: 65,
	b: 66,
	c: 67,
	d: 68,
	e: 69,
	f: 70,
	g: 71,
	h: 72,
	i: 73,
	j: 74,
	k: 75,
	l: 76,
	m: 77,
	n: 78,
	o: 79,
	p: 80,
	q: 81,
	r: 82,
	s: 83,
	t: 84,
	u: 85,
	v: 86,
	w: 87,
	x: 88,
	y: 89,
	z: 90,
	
	f1: 112,
	f2: 113,
	f3: 114,
	f4: 115,
	f5: 116,
	f6: 117,
	f7: 118,
	f8: 119
};
$.webos.keyboard._keys = [];
$(document)
	.keydown(function(e) {
		if (jQuery.inArray(e.keyCode, $.webos.keyboard._keys) == -1) {
			$.webos.keyboard._keys.push(e.keyCode);
		}
	})
	.keyup(function(e) {
		var position = jQuery.inArray(e.keyCode, $.webos.keyboard._keys);
		if (position != -1) {
			delete $.webos.keyboard._keys[position];
		}
	});
$.webos.keyboard.pressed = function(keys) {
	if (typeof keys == 'undefined') {
		return $.webos.keyboard._keys;
	}
	
	if (typeof keys == 'string') {
		keys = keys.toLowerCase().split('+');
	}
	if (typeof keys != 'object') {
		keys = [keys];
	}
	
	for (var i = 0; i < keys.length; i++) {
		if (jQuery.inArray($.webos.keyboard.name2Keycode(keys[i]), $.webos.keyboard._keys) == -1) {
			return false;
		}
	}
	return true;
};
$.webos.keyboard.systemKeyDown = function() {
	return $.webos.keyboard.pressed($.webos.keyboard.systemKey);
};
$.webos.keyboard.keycode2Name = function(keycode) {
	for (var name in $.webos.keyboard.keycodes) {
		if (keycode === $.webos.keyboard.keycodes[name]) {
			return name;
		}
	}
	return keycode;
};
$.webos.keyboard.name2Keycode = function(name) {
	name = name.toLowerCase();
	if (typeof $.webos.keyboard.keycodes[name] != 'undefined') {
		return $.webos.keyboard.keycodes[name];
	}
	return name;
};
$.webos.keyboard.keycodes.system = $.webos.keyboard.name2Keycode($.webos.keyboard.systemKey);
$.webos.keyboard.bind = function(el, keycode, callback) {
	el = $(el);
	
	$(document).keydown(function(e) {
		if ($.webos.keyboard.pressed(keycode)) {
			var isBindActive = true;
			if (el.is('.webos-window') || el.parents().filter('.webos-window').length > 0) {
				if (!el.is('.webos-window')) {
					el = el.parents().filter('.webos-window').last();
				}
				isBindActive = el.is('foreground');
			} else if (el.is('#desktop') || el.parents().filter('#desktop').length > 0) {
				if (!el.is('#desktop')) {
					el = el.parents().filter('#desktop').last();
				}
				isBindActive = (typeof $.webos.window.getActive() == 'undefined');
			}
			
			if (isBindActive) {
				e.preventDefault();
				callback(e);
			}
		}
	});
};


//Raccourci
$.w = $.webos;