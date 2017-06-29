/*
@license
webix UI v.3.2.4
This software is covered by Webix Trial License.
Usage without proper license is prohibited.
(c) XB Software Ltd.
*/
// tree type
webix.type(webix.ui.tree,{
	name: "FileTree",
	css: "webix_fmanager_tree",
	icon:function(obj,common){
		if(obj.webix_child_branch && !obj.$count){
			return "<div class='webix_tree_child_branch webix_tree_close'></div>";
		}
		else if (obj.$count){
			if (obj.open)
				return "<div class='webix_tree_open'></div>";
			else
				return "<div class='webix_tree_close'></div>";
		} else
			return "<div class='webix_tree_none'></div>";
	},
	folder:function(obj, common){
		if (obj.$count && obj.open)
			return "<div class='webix_icon icon fa-folder-open'></div>";
		return "<div class='webix_icon icon fa-folder'></div>";
	}
});
// dataview type
webix.type(webix.ui.dataview, {
	name:"FileView",
	css: "webix_fmanager_files",
	height: 110,
	margin: 10,
	width: 150,
	template: function(obj,common){
		var icon = obj.type ||"file";
		icon = common.icons[icon] || common.icons["file"];
		var css = "webix_fmanager_data_icon";
		var name = common.templateName(obj,common);
		return "<div class='webix_fmanager_file'><div class='"+css+"'>"+common.templateIcon(obj,common)+"</div>"+name+"</div>";
	}
});
// locale values
webix.i18n.filemanager = {
	name: "Name",
	size: "Size",
	type: "Type",
	date: "Date",
	copy: "Copy",
	cut: "Cut",
	paste: "Paste",
	upload: "Upload",
	remove: "Delete",
	create: "Create Folder",
	rename: "Rename",
	location: "Location",
	select: "Select Files",
	sizeLabels: ["B","KB","MB","GB"],
	saving: "Saving...",
	errorResponse: "Error: changes were not saved!",
	replaceConfirmation: "The folder already contains files with such names. Would you like to replace existing files ?",
	createConfirmation: "The folder with such a name already exists. Would you like to replace it ?",
	renameConfirmation: "The file with such a name already exists. Would you like to replace it ?",
	yes: "Yes",
	no: "No",
	types:{
		folder: "Folder",
		doc: "Document",
		excel: "Excel",
		pdf: "PDF",
		pp: "PowerPoint",
		text: "Text File",
		video: "Video File",
		image: "Image",
		code: "Code",
		audio: "Audio",
		archive: "Archive",
		file: "File"
	}
};
// editable Tree
webix.protoUI({
	name:"filetree"
}, webix.EditAbility, webix.ui.tree);

// editable Dataview
webix.protoUI({
	name:"fileview"
}, webix.EditAbility, webix.ui.dataview);

// Datatable with customized drag element
webix.protoUI({
	name:"filetable",
	$dragHTML:function(item, e){
		var html="<div class='webix_dd_drag webix_fmanager_drag' >";
		var index = this.getColumnIndex("value");
		html += "<div style='width:auto'>"+ this.config.columns[index].template(item,this.type)+"</div>";
		return html+"</div>";
	}
}, webix.ui.datatable);

// a new view for path display, based on List view
webix.protoUI({
	name: "path",
	defaults:{
		layout: "x",
		separator: ",",
		scroll: false
	},
	$skin:function(){
		this.type.height = webix.skin.$active.buttonHeight||webix.skin.$active.inputHeight;
	},
	$init: function(){
		this.$view.className += " webix_path";
	},
	value_setter: function(value){
		this.setValue();
		return 	value;
	},
	setValue: function(values){
		this.clearAll();
		if(values){
			if(typeof(values) == "string"){
				values = values.split(this.config.separator);
			}
			this.parse(webix.copy(values));
		}
	},
	getValue: function(){
		return this.serialize();
	}
},webix.ui.list);
webix.FileManagerStructure={
	structure:{
		"actions": {
			config: function(){
				var templateName = this.config.templateName;
				return {
					view: "contextmenu",
					width: 200,
					padding:0,
					autofocus: false,
					css: "webix_fmanager_actions",
					template: function(obj,common){
						var name = templateName(obj,common);
						return "<span class='webix_icon fa-"+obj.icon+"'></span>"+name+"";
					},
					data: "actionsData"
				};
			},
			oninit: function(){
				var menu = this.getMenu();
				menu._hide_on_item_click = false;
				if(menu){
					menu.attachEvent("onItemClick",webix.bind(function(id,e){
						var obj = this.getMenu().getItem(id);
						var method = this[obj.method]||this[id];
						if(method){
							var active = this.getActive();
							if(this.callEvent("onbefore"+(obj.method||id),[active])){
								if(!(id=="upload" && (webix.isUndefined(XMLHttpRequest) || webix.isUndefined((new XMLHttpRequest()).upload)))){
									menu._hide_sub_menu(true);
									menu.hide();
								}
								var args = [active];
								if(id=="upload"){
									e = webix.html.pos(e);
									args.push(e);
								}
								webix.delay(function(){
									method.apply(this,args);
									this.callEvent("onafter"+(obj.method||id),[]);
								},this);

							}

						}
					},this));
					menu.attachEvent("onBeforeShow",function(e){
						this.filter("");
						this.hide();
						var c = this.getContext();
						if(c && c.obj){
							return c.obj.callEvent("onBeforeMenuShow",[c.id,e]);
						}
						return true;
					});

				}
			}
		},
		"actionsData":{
			config: function(){
				return [
					{id: "copy", batch: "item", method: "markCopy",  icon: "copy", value: webix.i18n.filemanager.copy},
					{id: "cut", batch: "item", method: "markCut", icon: "cut", value: webix.i18n.filemanager.cut},
					{id: "paste",  method: "pasteFile", icon: "paste", value: webix.i18n.filemanager.paste},
					{ $template:"Separator" },
					{id: "create", method: "createFolder", icon: "folder-o", value: webix.i18n.filemanager.create},
					{id: "remove", batch: "item", method: "deleteFile", icon: "times", value: webix.i18n.filemanager.remove},
					{id: "edit", batch: "item", method: "editFile",  icon: "edit", value: webix.i18n.filemanager.rename},
					{id: "upload", method: "uploadFile", icon: "upload", value: webix.i18n.filemanager.upload}
				];

			}
		},
		"mainLayout": {
			type: "clean",
			rows:"mainRows"
		},
		"mainRows":[
			"toolbar",
			"bodyLayout"
		],
		"toolbar": {
			css: "webix_fmanager_toolbar",
			paddingX: 10,
			paddingY:5,
			margin: 7,
			cols:"toolbarElements"
		},
		"toolbarElements":[
			"menu",
			{id: "menuSpacer", width: 65},
			{margin:2, cols:["back","forward"]},"up",
			"path","search","modes"
		],
		"menu":{
			config: { view: "button", type: "iconButton", css: "webix_fmanager_back", icon: "bars", width: 37},
			oninit: function(){
				if(this.$$("menu")){
					this.$$("menu").attachEvent("onItemClick",  webix.bind(function(){
						//if(this.getActive() == this.getFirstChildId(0))

							if(this.callEvent("onBeforeMenu", [])){
								//this.getMenu()._area = null;
								this.getMenu()._area = {obj: this.getActiveView(), id: this.getActive()};
								this.getMenu().show(this.$$("menu").$view);
								this.callEvent("onAfterMenu", []);
							}
					},this));
					if(this.config.readonly){
						this.$$("menu").hide();
						if(this.$$("menuSpacer"))
							this.$$("menuSpacer").hide();
					}
				}
			}
		},
		"back": {
			config: { view: "button", type:"iconButton", css: "webix_fmanager_back", icon: "angle-left", width: 37},
			oninit: function(){
				if(this.$$("back")){
					this.$$("back").attachEvent("onItemClick",  webix.bind(function(){
						if(this.callEvent("onBeforeBack", [])){
							this.goBack();
							this.callEvent("onAfterBack", []);
						}
					},this));
				}
			}
		},
		"forward": {
			config: { view: "button", type:"iconButton", css: "webix_fmanager_forward", icon: "angle-right", width: 37},
			oninit: function(){
				if(this.$$("forward")){
					this.$$("forward").attachEvent("onItemClick", webix.bind(function(){
						if(this.callEvent("onBeforeForward", [])){
							this.goForward();
							this.callEvent("onAfterForward", []);
						}
					},this));
				}
			}
		},
		"up": {
			config: { view: "button", type:"iconButton", css: "webix_fmanager_up", icon: "level-up", disable: true, width: 37},
			oninit: function(){
				if(this.$$("up")){
					this.$$("up").attachEvent("onItemClick", webix.bind(function(){
						if(this.callEvent("onBeforeLevelUp", [])){
							this.levelUp();
							this.callEvent("onAfterLevelUp", []);
						}
					},this));
				}
			}
		},
		"path": {
			config: { view: "path", borderless: true},
			oninit: function(){
				if(this.$$("path")){
					this.attachEvent("onFolderSelect",webix.bind(function(id){
						this.$$("path").setValue(this.getPathNames(id));
					},this));
					this.$$("path").attachEvent("onItemClick",webix.bind(function(id){
						var targetIndex = this.$$("path").getIndexById(id);
						var levelUp = this.$$("path").count()-targetIndex-1;

						if(this.$searchResults)
							this.hideSearchResults();

						if(levelUp){
							id = this.getCursor();
							while(levelUp){
								id = this.getParentId(id);
								levelUp--;
							}
							this.setCursor(id);
						}
						this.callEvent("onAfterPathClick",[id]);
					},this));

					this.data.attachEvent("onClearAll",webix.bind(function(){
						this.clearAll();
					},this.$$("path")));
				}
			}
		},
		"search": {
			config:{ view: "search", gravity: 0.3, css: "webix_fmanager_search" },
			oninit: function(){
				var search = this.$$("search");
				if(search){
					this.attachEvent("onHideSearchResults", function(){
						search.setValue("");
					});
					this.attachEvent("onBeforeCursorChange", function(){
						if(this.$searchResults){
							this.hideSearchResults();
						}
					});
					search.attachEvent("onTimedKeyPress",  webix.bind(function(){
						if(this._code != 9){
							var value = search.getValue();
							if(value){
								if(this.callEvent("onBeforeSearch", [value])){
									this.showSearchResults(value);
									this.callEvent("onAfterSearch", [value]);
								}
							}
							else if(this.$searchResults){
								this.hideSearchResults();
							}

						}

					},this));
					search.attachEvent("onKeyPress",  function(code){
						this._code = code;
					});

					this.attachEvent("onAfterModeChange",function(){
						if(this.$searchResults)
							this.showSearchResults(search.getValue());
					});
				}
			}

		},
		"bodyLayout": {
			css: "webix_fmanager_body",
			cols:"bodyCols"
		},
		"bodyCols":[
			"tree",
			{view:"resizer", width:2},
			"modeViews"
		],
		"tree": {
			config: {
				width: 251,
				view: "filetree",
				id: "tree",
				select: true,

				filterMode:{
					showSubItems:false,
					openParents:false
				},
				type: "FileTree",
				navigation: true,
				scroll: true,
				editor:"text",
				editable: true,
				editaction: false,
				drag: true,
				tabFocus: true,
				onContext:{}
			},
			oninit: function(){
				var tree = this.$$("tree");

				if(tree){
					var fmanager = this;

					tree.type.icons = this.config.icons;

					// data source definition (syncing with main data source)
					tree.sync(this,function(){
						this.filter(function(obj){

							return (obj.$count||obj.type=="folder");
						});
					});

					tree.on_click["webix_tree_child_branch"] = function(ev, id, node){
						var url = fmanager.config.handlers["branch"];
						if(url){
							fmanager.loadDynData(url, this.getItem(id), "branch", true);
						}
					};

					this.attachEvent("onAfterDynParse", function(obj,data,mode){
						if(mode == "branch" && obj.open){
							tree.open(obj.id);
						}
					});

					tree.attachEvent("onAfterSelect", function(id){
						fmanager.callEvent("onFolderSelect",[id]);
					});

					this.attachEvent("onAfterCursorChange", function(id){
						if (id){
							tree.select(id);
							tree.showItem(id);
						}
					});

					// hide search results on click
					tree.attachEvent("onItemClick",function(){
						if(fmanager.$searchResults){
							fmanager.hideSearchResults();
						}
					});

					this.attachEvent("onItemRename", function(id){
						tree.refresh(id);
					});

					// open/close on double-click
					tree.attachEvent("onItemDblClick",function(id){
						if(this.isBranchOpen(id)){
							this.close(id);
						}
						else{
							this.open(id);
						}
					});

					tree.attachEvent("onBlur",function(){
						if(!fmanager.getMenu()||!fmanager.getMenu().isVisible()){
							webix.html.addCss(this.$view,"webix_blur");
						}
					});

					tree.attachEvent("onFocus",webix.bind(function(){

						this._activeView = tree;
						webix.html.removeCss(tree.$view,"webix_blur");

						// clear sub view selection
						this.$$(this.config.mode).unselect();
					},this));

					// setting path (history support)
					this.attachEvent("onPathLevel",function(id){
						//tree.open(id);
					});
					// setting path (history support)
					this.attachEvent("onPathComplete",function(id){
						tree.showItem(id);
					});

					// context menu
					if(!this.config.readonly){
						if(this.getMenu())
							this.getMenu().attachTo(tree);
						tree.attachEvent("onBeforeMenuShow",function(id){
							var menu = fmanager.getMenu();
							menu.filter(function(obj){
								var res = true;
								if(id == fmanager.getFirstChildId(0) && (!obj.batch || obj.batch.indexOf("root")==-1) )
									res = false;

								if(fmanager.config.menuFilter)
									res =  res && fmanager.config.menuFilter(obj);

								return res;
							});
							this.select(id);
							webix.UIManager.setFocus(this);
							return menu.count()>0;
						});
					}

					// editing (rename)
					tree.attachEvent("onBeforeEditStop",webix.bind(function(state,editor){
						return this.callEvent("onBeforeEditStop",[editor.id,state,editor,tree]);
					},this));
					tree.attachEvent("onAfterEditStop",webix.bind(function(state,editor){
						if(this.callEvent("onAfterEditStop",[editor.id,state,editor,tree])){
							this.renameFile(editor.id,state.value);
						}
					},this));

					// drag-n-drop
					tree.attachEvent("onBeforeDrag",function(context,e){
						return !fmanager.config.readonly&&fmanager.callEvent("onBeforeDrag",[context,e]);
					});
					tree.attachEvent("onBeforeDragIn",function(context,e){
						return !fmanager.config.readonly&&fmanager.callEvent("onBeforeDragIn",[context,e]);
					});
					tree.attachEvent("onBeforeDrop",function(context,e){
						if(fmanager.callEvent("onBeforeDrop",[context,e])){
							if (context.from){	//from different component
								fmanager.moveFile(context.source, context.target);
								fmanager.callEvent("onAfterDrop",[context,e]);
							}
						}
						return false;
					});

					// focus
					var setTreeCursor = function(){
						if(tree)
							webix.UIManager.setFocus(tree);
					};
					this.attachEvent("onAfterBack",setTreeCursor);
					this.attachEvent("onAfterForward",setTreeCursor);
					this.attachEvent("onAfterLevelUp",setTreeCursor);
					this.attachEvent("onAfterPathClick",setTreeCursor);

					// read-only mode
					if(this.config.readonly){
						tree.define("drag",false);
						tree.define("editable",false);
					}
				}
			}
		},
		"modeViews":{
			config: function(settings){
				var cells = [];
				if(settings.modes){
					for(var i =0; i < settings.modes.length; i++){
						cells.push(settings.modes[i]);
					}
				}
				return {
					animate: false,
					cells: cells
				};
			},
			oninit: function(){
				if(this.$$(this.config.mode)){
					this.$$(this.config.mode).show();
				}
				this.attachEvent("onBeforeCursorChange", function(){
					this.$$(this.config.mode).unselect();
					return true;
				});

				var modes = this.config.modes;
				if(modes){
					for(var i =0; i < modes.length; i++) {
						//this.$$(modes[i]).bind(this, "$level");
						if (this.$$(modes[i]) && this.$$(modes[i]).filter) {
							this._setViewHandlers(modes[i]);
						}
					}
				}
			}
		},
		"modes":{
			config:function(settings){
				var width = 0;
				var options = this.structure["modeOptions"];
				if(options){
					for(var i =0; i < options.length; i++){
						if(options[i].width)
							width += options[i].width+ (options.length?1:0);
					}
				}
				var config = { view: "segmented", options: "modeOptions", css:"webix_fmanager_modes", value: settings.mode};
				if(width)
					config.width = width+4;
				return config;
			},
			oninit: function(){
				if(this.$$("modes")){
					this.$$("modes").attachEvent("onBeforeTabClick",webix.bind(function(id){
						var value = this.$$("modes").getValue();
						if(this.callEvent("onBeforeModeChange",[value,id])){
							if(this.$$(id)){
								this.config.mode = id;
								this.$$(id).show();
								this.callEvent("onAfterModeChange",[value,id]);
								return true;
							}
						}
						return false;
					},this));
				}

			}
		},
		"modeOptions":[
			{
				id: "files",
				width: 32,
				value: "<span class=\"webix_fmanager_mode_option webix_icon fa-th\"></span>"
			},
			{
				id: "table",
				width: 32,
				value: "<span class=\"webix_fmanager_mode_option webix_icon fa-list-ul\"></span>"
			}
		],
		"files": {
			config:{
				view: "fileview",
				type: "FileView",
				select: "multiselect",
				editable:true,
				editaction: false,
				editor:"text",
				editValue:"value",
				drag: true,
				navigation: true,
				tabFocus: true,
				onContext:{}
			}
		},

		"table": {
			config: {
				view: "filetable",
				css: "webix_fmanager_table",
				columns: "columns",
				editable: true,
				editaction: false,
				select: "multiselect",
				drag: true,
				navigation: true,
				resizeColumn:true,
				tabFocus: true,
				onContext:{}
			},
			oninit: function(){
				if(this.$$("table")){
					this.attachEvent("onHideSearchResults", function(){
						if(this.$$("table").isColumnVisible("location"))
							this.$$("table").hideColumn("location");
					});
					this.attachEvent("onShowSearchResults", function(){
						if(!this.$$("table").isColumnVisible("location"))
							this.$$("table").showColumn("location");
					});

					this.$$("table").attachEvent("onBeforeEditStart", function(id){
						if(typeof(id) != "object"){
							this.edit({row:id,column: "value"});
							return false;
						}
						return true;
					});
				}

			}
		},
		"columns": {
			config: function(){
				var locale =  webix.i18n.filemanager;
				var manager = this;
				return [
					{ id:"value",	header: locale.name, fillspace:3, template: function(obj,common){
						var name = common.templateName(obj,common);
						return common.templateIcon(obj,common)+name;
					}, sort: "string", editor: "text"},
					{ id:"date",	header: locale.date, fillspace:2, template: function(obj,common){
						return common.templateDate(obj,common);
					}, sort: "date"},
					{ id:"type",	header: locale.type, fillspace:1, sort: "string",template: function(obj,common){
						return common.templateType(obj);
					}},
					{ id:"size",	header: locale.size, fillspace:1, css:{"text-align":"right"}, template: function(obj,common){
						return obj.type=="folder"?"":common.templateSize(obj);
					}, sort: "int"},
					{ id:"location",	header: locale.location, fillspace:2, template: function(obj){
						return manager._getLocation(obj);
					}, sort: "string",hidden:true}
				];
			}
		},
		"upload": {
			config: function(){
				var result = {};
				if (webix.isUndefined(XMLHttpRequest) || webix.isUndefined((new XMLHttpRequest()).upload)){
					result = {
						view: "uploader",
						css: "webix_upload_select_ie",
						type: "iconButton",
						icon:"check",
						label: webix.i18n.filemanager.select,
						formData:{ action:"upload" }
					};
				}
				else{
					result = {
						view:"uploader",
						apiOnly:true,
						formData:{ action:"upload" }
					};
				}
				return result;
			},
			oninit: function(){
				this._setUploadHandlers();
			}
		}
	}
};
webix.FileManagerUpload = {
	_initUploader: function(){
		var view = webix.copy(this.structure["upload"]);
		var config = this._getViewConfig(view,this.config);

		if(config){
			if (webix.isUndefined(XMLHttpRequest) || webix.isUndefined((new XMLHttpRequest()).upload)){
				this._createFlashUploader(webix.copy(config));
			}
			else{
				this._uploader = webix.ui(config);
				this.attachEvent("onDestruct", function(){
					this._uploader.destructor();
				});
			}


			if(view.oninit)
				view.oninit.call(this);
		}
	},
	_createFlashUploader: function(config){
		if(!config){
			var view = webix.copy(this.structure["upload"]);
			var config = this._getViewConfig(view,this.config);
		}
		this._uploadPopup = webix.ui({
			view:"popup",
			padding:0,
			width:250,
			body: config
		});
		this._uploader = this._uploadPopup.getBody();
		this.attachEvent("onDestruct", function(){
			this._uploadPopup.destructor();
		});
	},
	getUploader: function(){
		return 	this._uploader;
	},
	_getUploadFolder: function(){
		return 	this._uploaderFolder||this.getCursor();
	},
	uploadFile: function(id,e){

		if(!this.data.branch[id] && this.getItem(id).type != "folder"){
			id = this.getParentId(id);
		}

		this._uploaderFolder = id;

		if(this._uploadPopup){
			this._uploadPopup.destructor();
			this._createFlashUploader();
			this._setUploadHandlers();
			this._uploadPopup.show(e,{x:20,y:5});
		}
		else{
			if(this._uploader)
				this._uploader.fileDialog();
		}

	},
	_setUploadHandlers: function(){
		var uploader = this.getUploader();
		if(uploader){
			// define url
			uploader.config.upload = this.config.handlers.upload;
			// add drop areas
			var modes = this.config.modes;
			if(modes && !this.config.readonly){
				for(var i =0; i < modes.length; i++){
					if(this.$$(modes[i]))
						uploader.addDropZone(this.$$(modes[i]).$view);
				}
			}

			// handlers
			uploader.attachEvent("onBeforeFileAdd",webix.bind(function(file){
				var target = ""+this._getUploadFolder();

				uploader.config.formData.target = target;
				return this.callEvent("onBeforeFileUpload",[file]);
			},this));
			uploader.attachEvent("onAfterFileAdd", webix.bind(function(file){
				this._uploaderFolder = null;
				file.oldId = file.id;
				this.add({
					"id"   : file.id,
					"value": file.name,
					"type" : file.type,
					size   : file.size,
					date   : Math.round((new Date()).valueOf()/1000)
				}, -1, uploader.config.formData.target);

				if(this.config.uploadProgress){
					this.showProgress(this.config.uploadProgress);
				}
				this.refreshCursor();
			},this));

			uploader.attachEvent("onUploadComplete",webix.bind(function(){
				 if(this._uploadPopup){
					 this.getMenu().hide();
					 this._uploadPopup.hide();
				 }
			 },this));
			uploader.attachEvent("onFileUpload",webix.bind(function(item){
				var id = item.id.replace("\\\\","\\"); //flash upload require to pass id contained \\\ instead of \\

				if(item.oldId)
					this.data.changeId(item.oldId,item.id);
				if(item.value)
					this.getItem(item.id).value = item.value;

				this.getItem(item.id).type = item.type;
				this.refreshCursor();
				this.hideProgress();

			},this));
			uploader.attachEvent("onFileUploadError",webix.bind(function(item, response){
				this._errorHandler(response);
				this.hideProgress();

			},this));
		}

	}
};
webix.protoUI({
	name:"filemanager",
	$init: function(config) {
		this.$view.className += " webix_fmanager";
		webix.extend(this.data, webix.TreeStore, true);

		webix.extend(config,this.defaults);
		this.data.provideApi(this,true);
		this._cursorHistory = webix.extend([],webix.PowerArray,true);
		this._setDefaultElements(config);
		this.$ready.push(this._beforeInit);
		webix.UIManager.tabControl = true;
		webix.extend(config, this._getUI(config));
	},
	handlers_setter: function(handlers){
		for(var h in handlers){
			var url = handlers[h];
			if (typeof url == "string"){
				if(url.indexOf("->") != -1){
					var parts = url.split("->");
					url = webix.proxy(parts[0], parts[1]);
				}
				else if( h != "upload" && h != "download")
					url = webix.proxy("post", url);
			}
			handlers[h] = url;
		}
		return handlers;
	},
	_beforeInit: function(){

		this._createContext();

		this.attachEvent("onAfterLoad",function(){
			// history
			if(!this.config.disabledHistory){
				var state = window.location.hash;
				if (state && state.indexOf("#!/") === 0){
					this.setPath(state.replace("#!/",""));
				}
			}
			// default cursor
			if(!this.getCursor())
				this.setCursor(this._getDefaultSelection());
		});

		this.attachEvent("onFolderSelect", function(id){
			this.setCursor(id);
		});

		this.attachEvent("onAfterCursorChange", function(id){
			if(this.$$(this.config.mode))
				this.$$(this.config.mode).editStop();
			if(!this._historyIgnore){
				if(!this._historyCursor )
					this._cursorHistory.splice(1);
				if(this._cursorHistory[this._historyCursor] != id){
					if(this._cursorHistory.length==20)
						this._cursorHistory.splice(0,1);
					this._cursorHistory.push(id);
					this._historyCursor = this._cursorHistory.length-1;
				}
			}
			this._historyIgnore = false;
			if(!this.config.disabledHistory)
				this._pushHistory(id);
		});

		this.attachEvent("onBeforeDragIn",function(context){
			var target = context.target;
			if(target){
			    var ids = context.source;
			    for(var i=0; i < ids.length; i++){
				    while(target){
					    if(target==ids[i]){
				            return false;
				        }
				        target = this.getParentId(target);
				    }
			    }
			 }
			 return true;
		});
		this._initUploader();
	},
	_pushHistory: function(path){
		path = path||this.getCursor();
		if(window.history && window.history.replaceState){
			window.history.replaceState({ webix:true, id:this.config.id, value:path }, "", "#!/"+path);
		}
		else{
			window.location.hash =  "#!/"+path;
		}
	},
	_getUI: function(config){
		var layoutConf = this.structure["mainLayout"];
		var structure = webix.extend({},layoutConf.config || layoutConf);
		this._getCells(structure,config);
		if(config.on && config.on["onViewInit"]){
			config.on["onViewInit"].apply(this,[config.id||"mainLayout",structure]);
		}
		webix.callEvent("onViewInit",[config.id||"mainLayout",structure,this]);
		return structure;
	},
	updateStructure: function(){
		var ui = this._getUI();
		var collection = (this._vertical_orientation?"rows":"cols");
		this.define(collection,ui[collection]);
		this.reconstruct();
	},
	_getCells: function(struct,config){
		var cells, found, i, id,
			arrName = "",
			arrs = ["rows","cols","elements","cells","columns","options","data"];

		for(i =0; i< arrs.length;i++){
			if(struct[arrs[i]]){
				arrName = arrs[i];
				cells = struct[arrName];
			}
		}
		if(cells){
			if(typeof(cells) == "string"){
				if(this.structure[cells]){
					struct[arrName] = this._getViewConfig(this.structure[cells],config);
					cells = struct[arrName];
				}
			}

			for(i=0; i< cells.length;i++){
				found = null;
				if(typeof(cells[i]) == "string"){
					found = id = cells[i];

					if(this.structure[id]){
						var view = webix.extend({},this.structure[id]);
						cells[i] = this._getViewConfig(view,config);

						cells[i].id = id;
						if(view.oninit){
							this.$ready.push(view.oninit);
						}
					}
					else
						cells[i] = { };
				}
				this._getCells(cells[i],config);
				if (found){
					if(config.on && config.on["onViewInit"]){
						config.on["onViewInit"].apply(this,[found,cells[i]]);
					}
					webix.callEvent("onViewInit",[found,cells[i],this]);
				}
			}
		}
	},
	_createContext: function(){
		if(this.structure["actions"]){
			var popup = webix.copy(this.structure["actions"]);
			var structure = popup.config || popup;
			if(typeof(structure) == "function")
				structure = structure.call(this);
			this._getCells(structure,this.config);
			this._contextMenu = webix.ui(structure);
			this.attachEvent("onDestruct",function(){
				this._contextMenu.destructor();
			});
			if(popup.oninit){
				this.$ready.push(popup.oninit);
			}
		}
	},
	getMenu: function(){
		return this._contextMenu;
	},
	getPath: function(id){
		id = id||this.getCursor();
		var item = null;
		var path = [];
		while(id && this.getItem(id)){
			item = this.getItem(id);
			path.push(id);
			id = this.getParentId(id);
		}
		return path.reverse();
	},
	getPathNames: function(id){
		id = id||this.getCursor();
		var item = null;
		var path = [];
		while(id && this.getItem(id)){
			item = this.getItem(id);
			path.push({id:id, value:this.config.templateName(item)});
			id = this.getParentId(id);
		}
		return path.reverse();
	},
	setPath: function(id){
		var pId = id;
		while(pId && this.getItem(pId)){
			this.callEvent("onPathLevel",[pId]);
			pId = this.getParentId(pId);
		}
		if(this.getItem(id)){
			this.setCursor(id);
			this.callEvent("onPathComplete",[id]);
		}else{
			// dynamic loading
			var folders = this._getParentFolders(id);
			this.openFolders(folders).then( webix.bind(function(){
				this.setCursor(id);
				this.callEvent("onPathComplete",[id]);
			},this));
		}

	},
	_getLocation: function(obj){
		var location, path;
		if(this.getItem(obj.id)){
			if(obj.parent){
				path = this.getPathNames(obj.parent);
			}
			else{
				path = this.getPathNames(obj.id);
			}
			path.shift();
			path.pop();
			var names = [];
			for(var i=0; i < path.length;i++){
				names.push(path[i].value);
			}
			location = "/"+names.join("/");
		}
		else if(obj.location){
			location = obj.location;
		}
		else{
			var parts = obj.id.split("/");
			parts.pop();
			location = "/"+parts.join("/");
		}
		return location;
	},
	_changeCursor: function(step){
		if(this._cursorHistory.length>1){
			var index = this._historyCursor + step;
			if(index>-1 && index < this._cursorHistory.length){
				this._historyIgnore = true;
				this.setCursor(this._cursorHistory[index]);
				this._historyCursor = index;
			}
		}
		return this.getCursor();
	},
	getSearchData: function(id,value){
		var found = [];
		this.data.each(function(obj){
			var text = this.config.templateName(obj);
			if(text.toLowerCase().indexOf(value.toLowerCase())>=0){
				found.push(webix.copy(obj));
			}
		},this,true,id);
		return found;
	},
	_loadSearchData: function(url, id, value){
		var params =  { action:"search", source: id, text: value};
		if(this.callEvent("onBeforeSearchRequest",[id, params])){
			var callback = {
				success: webix.bind(function(text,response){
					this.hideProgress();
					var data = this.data.driver.toObject(text, response);
					this._parseSearchData(data);
				},this),
				error: webix.bind(function(){
					this.hideProgress();
				},this)
			};
			if (url.load)
				return url.load(null, callback, params);
		}
	},
	_parseSearchData: function(data){

		this.callEvent("onShowSearchResults",[]);
		this.$searchResults = true;
		if(this.$$(this.config.mode).filter){
			this.$$(this.config.mode).clearAll();
			this.$$(this.config.mode).parse(data);
		}
	},
	showSearchResults: function(value){
		var id = this.getCursor();
		if(this.config.handlers["search"]){
			this._loadSearchData(this.config.handlers["search"], id, value);
		}
		else{
			var data = 	this.getSearchData(id, value);
			this._parseSearchData(data);
		}

	},
	hideSearchResults: function(){
		if(this.$searchResults){
			this.callEvent("onHideSearchResults",[]);
			this.$searchResults = false;
			var id = this.getCursor();
			this._cursor = null;
			this.setCursor(id);
		}
	},
	goBack: function(step){
		step = (step?(-1)*Math.abs(step):-1);
		return this._changeCursor(step);
	},
	goForward: function(step){
		return this._changeCursor(step||1);
	},
	levelUp: function(id){
		id = id||this.getCursor();
		if(id){
			id = this.getParentId(id);
			this.setCursor(id);
		}
	},
	markCopy: function(ids){
		if(ids){
			if(!webix.isArray(ids)){
				ids = [ids];
			}
			this._moveData = ids;
			this._copyFiles = true;
		}
	},
	markCut: function(ids){
		if(ids){
			if(!webix.isArray(ids)){
				ids = [ids];
			}
			this._moveData = ids;
			this._copyFiles = false;
		}
	},
	pasteFile: function(id){
		if(webix.isArray(id)){
			id = id[0];
		}
		if(id){
			id = id.toString();
			if(this.data.branch[id]&&this.getItem(id).type == "folder"){
				if(this._moveData){
					if(this._copyFiles){
						this.copyFile(this._moveData,id);
					}
					else
						this.moveFile(this._moveData,id);
				}
			}
		}
	},
	download:function(id){
		var url = this.config.handlers.download;
		if (url)
			webix.send(url, { action:"download", source: id });
	},
	fileExists: function(name,target,id){
		var result = false;
		this.data.eachChild(target, webix.bind(function(obj){
			if(name == obj.value&&!(id && obj.id==id)){
				result = obj.id;
			}
		},this));
		return result;
	},
	_setFSId: function(item){
		var newId = this.getParentId(item.id)+"/"+item.value;
		if(item.id != newId)
			this.changeId( item.id, newId );
	},
	_changeChildIds: function(id){
		this.data.eachSubItem(id,function(item){
			if(item.value)
				this._setFSId(item);
		});
	},
	_callbackRename: function(id, value){
		var item = this.getItem(id);
		if(item.value != value){
			item.value = value;
			this.refreshCursor();
			this.callEvent("onItemRename", [id]);
		}
	},
	_moveFile: function(source,target,copy){
		var action = (copy?"copy":"move"),
			ids = [];
		for(var i=0; i<source.length; i++){
			var newId = this.move(source[i],0,this,{parent:target,copy:copy?true:false});
			ids.push(newId);
		}
		this.refreshCursor();
		var url = this.config.handlers[action];
		if (url){
			this._makeSaveRequest(url,{ action: action, source:source.join(","), temp: ids.join(","), target: target.toString() },function(requestData,responseData){
				if(responseData && webix.isArray(responseData)){
					var ids = requestData.temp.split(",");
					for(var i=0;i < responseData.length;i++){
						if(responseData[i].id && (responseData[i].id!=ids[i]) && this.data.pull[ids[i]]){
							this.data.changeId(ids[i],responseData[i].id);
							if(this._settings.fsIds)
								this._changeChildIds(responseData[i].id);
							if(responseData[i].value){
								this._callbackRename(responseData[i].id,responseData[i].value);
							}
						}
					}
				}
			});
		}
	},
	copyFile: function(source, target){
		this.moveFile(source, target, true);
	},
	moveFile:function(source, target, copy){
		var i, id, result;
		if(typeof(source) == "string"){
			source = source.split(",");
		}
		if(!webix.isArray(source)){
			source = [source];
		}
		if(!target){
			target = this.getCursor();
		}
		else if(!this.data.branch[target]&&this.getItem(target.toString()).type!="folder"){
			target = this.getParentId(target);
		}

		result = true;
		target = target.toString();

		for(i=0; i<source.length; i++){
			id = source[i].toString();
			result = result&&this._isMovingAllowed(id,target);

		}
		if(result){
			this._moveFile(source,target,copy?true:false);
		}
		else{
			this.callEvent(copy?"onCopyError":"onMoveError", []);
		}
	},
	deleteFile:function(ids,callback){
		if(typeof(ids) == "string"){
			ids = ids.split(",");
		}
		if(!webix.isArray(ids)){
			ids = [ids];
		}
		for(var i=0; i<ids.length; i++){
			var id = ids[i];
			if(this.$$(this.config.mode).isSelected(id))
				this.$$(this.config.mode).unselect(id);
			if(id == this.getCursor())
				this.setCursor(this.getFirstId());
			if(id)
				this.remove(id);
		}
		this.refreshCursor();

		var url = this.config.handlers["remove"];
		if (url){
			if(callback)
				callback = webix.bind(callback,this);
			this._makeSaveRequest(url,{ action:"remove", source:ids.join(",") }, callback);
		}
		else if(callback){
			callback.call(this);
		}

	},
	_createFolder: function(obj,target){
		this.add(obj, 0, target);
		obj.source = obj.value;
		obj.target = target;
		this.refreshCursor();
		var url = this.config.handlers["create"];
		if (url){
			obj.action = "create";
			this._makeSaveRequest(url,obj,function(requestData,responseData){
				if(responseData.id){
					if(requestData.id != responseData.id)
						this.data.changeId(requestData.id,responseData.id);
					if(this.config.fsIds)
						this._changeChildIds(responseData.id);
					if(responseData.value){
						this._callbackRename(responseData.id,responseData.value);
					}
				}
			});
		}
	},
	createFolder: function(target){
		if(typeof(target) == "string"){
			target = target.split(",");
		}
		if(webix.isArray(target)){
			target = target[0];
		}
		if(target){
			target = ""+target;
			var item = this.getItem(target);
			if(!this.data.branch[target] && (item.type != "folder")){
				target = this.getParentId(target);
			}
			var obj = this.config.templateCreate(item);

			target = ""+target;
			this._createFolder(obj,target);
		}
	},
	editFile: function(id){
		if(webix.isArray(id)){
			id = id[0];
		}
		if(this.getActiveView()&&this.getActiveView().edit)
			this.getActiveView().edit(id);

	},


	renameFile: function(id,name,field){
		var item = this.getItem(id);
		field = (field||"value");
		item[field] = name;
		this.refreshCursor();
		this.callEvent("onFolderSelect",[this.getCursor()]);

		var url = this.config.handlers.rename;
		if (url){
			var obj = { source:id, action:"rename", target: name};
			this._makeSaveRequest(url,obj,function(requestData,responseData){
				if(responseData.id){
					if(requestData.source != responseData.id)
						this.data.changeId(requestData.source,responseData.id);
					if(responseData.value){
						this._callbackRename(responseData.id,responseData.value);
					}
				}
			});
		}
	},
	_isMovingAllowed: function(source,target){
		while(target){
			if(target==source || (!this.data.branch[target]&&this.getItem(target.toString()).type != "folder")){
				return false;
			}
			target = this.getParentId(target);
		}
		return true;
	},
	_showSaveMessage: function(message){
		this._saveMessageDate = new Date();
		if (!this._saveMessage){
			this._saveMessage = webix.html.create("DIV",{ "class":"webix_fmanager_save_message"},"");
			this._viewobj.style.position = "relative";
			webix.html.insertBefore(this._saveMessage, this._viewobj);
		}
		var msg = "";
		if (typeof message == "string")
			msg = message;
		else if (!message) {
			msg = webix.i18n.filemanager.saving;
		} else{
			msg = webix.i18n.filemanager.errorResponse;
		}

		this._saveMessage.innerHTML = msg;
	},
	_hideSaveMessage: function(){
		if (this._saveMessage){
			webix.html.remove(this._saveMessage);
			this._saveMessage = null;
		}
	},
	_makeSaveRequest: function(url,obj,callback){
		if(this.callEvent("onBeforeRequest",[url, obj])){
			this._showSaveMessage();
			if(url.load){
				var rCallback = {
					success: webix.bind(function(text,response){
						var data = this.data.driver.toObject(text, response);
						this._hideSaveMessage();
						if(this.callEvent("onSuccessResponse",[obj,data]) && callback){
							callback.call(this,obj,data);
						}
					},this),
					error: webix.bind(function(result){

						if(this.callEvent("onErrorResponse", [obj,result])){
							this._errorHandler(result);
						}
					},this)
				};
				url.load(null, rCallback, webix.copy(obj));
			}
		}
	},
	getActiveView: function(){
		return this._activeView||this.$$("tree")||null;
	},
	getActive: function(){
		var selected = this.getSelectedFile();
		return selected?selected:this.getCursor();
	},
	/*
	 * returns the name of the folder selected in Tree
	 * */
	getCurrentFolder: function(){
		return this.$$("tree").getSelectedId();
	},
	/*
	* returns a string or an array with selected file(folder) name(s)
	* */
	getSelectedFile: function(){
		var result = null,
			selected = this.$$(this.config.mode).getSelectedId();

		if(selected){
			if(!webix.isArray(selected))
				result = selected.toString();
			else{
				result = [];
				for(var i=0; i < selected.length; i++){
					result.push(selected[i].toString());
				}
			}
		}

		return result;
	},
	_runFile: function(id){
		id = id.toString();
		var item = this.getItem(id);
		if(item){
			if(this.data.branch[id] || (item.type == "folder")){
				if(this.callEvent("onBeforeLevelDown",[id])){
					this.setCursor(id);
					this.callEvent("onAfterLevelDown",[id]);
				}
			}
			else if(this.callEvent("onBeforeRun",[id])){
				this.download(id);
				this.callEvent("onAfterRun",[id]);
			}
		}
		else{
			if(this.$$(this.config.mode).filter){
				item = this.$$(this.config.mode).getItem(id);
				var folders = item&&item.parents?item.parents:this._getParentFolders(id);
				this.openFolders(folders).then( webix.bind(function(){
					this._runFile(id);
				},this));
			}
		}
	},
	_getParentFolders: function(id){
		var parts = id.split("/");
		var ids = [];

		for(var i=0; i< parts.length; i++){
			ids.push(parts.slice(0, i+1).join("/"));
		}

		return ids;
	},
	_getDynMode: function(){
		for(var mode in this.dataParser){
			if (this.config.handlers[mode]) {
				return mode;
			}
		}
		return null;
	},
	_openDynFolder: function(ids, mode, defer){
		var obj = this.getItem(ids[0]);
		this.showProgress();
		var url = this.config.handlers[mode];
		var callback = {
			success: webix.bind(function(text,response){
				this.hideProgress();
				var data = this.data.driver.toObject(text, response);
				if(this.callEvent("onBeforeDynParse", [obj, data, mode])){
					obj.open = true;
					this.dataParser[mode].call(this, obj, data);

					var lastId = ids.shift();
					if(ids.length && this.getItem(ids[0]).type == "folder"){
						this._openDynFolder(ids, mode, defer);
					}
					else{
						this.refreshCursor();
						defer.resolve(lastId);
					}
					this.callEvent("onAfterDynParse", [obj, data, mode]);
				}

			},this)
		};
		if (url.load)
			return url.load(null, callback,  { action: mode, source: ids[0]});
	},
	openFolders: function(folders){
		var dynMode, i, pItem;
		var defer = webix.promise.defer();
		dynMode = this._getDynMode();

		if(dynMode && folders.length){
			for(i =0; i < folders.length; i++){
				pItem = this.getItem(folders[i]);
				if(!(pItem && !pItem["webix_" + dynMode])){
					this._openDynFolder(folders.slice(i), dynMode, defer);
					return defer;
				}
				else{
					pItem.open = true;
					if(this.$$("tree"))
						this.$$("tree").refresh(folders[i]);
				}
			}
			defer.resolve(folders[i]);
		}
		else{
			defer.reject();
		}
		return defer;
	},
	_addElementHotKey: function(key, func, view){
		var keyCode = webix.UIManager.addHotKey(key, func, view);
		(view||this).attachEvent("onDestruct", function(){
			webix.UIManager.removeHotKey(keyCode, func, view);
		});
	},

	_errorHandler: function(){
		// reload data on error response
		var url = this.data.url;
		if(url){
			var driver = this.data.driver;
			this._showSaveMessage(true);
			var fmanager = this;
			webix.ajax().get(url, {success:function(text, response){
				var data = driver.toObject(text, response);
				if (data){
					data = driver.getDetails(driver.getRecords(data));
					fmanager.clearAll();
					fmanager.parse(data);
					fmanager.data.url = url;
				}
			},error:function(){}});
		}
	},
	_importSelectedBranch:  function(target, source, obj){
		var data = [].concat(webix.copy(source.data.getBranch(obj.id))).concat(obj.files || []);

		target.data.importData(data, true);
	},
	clearBranch: function(id){
		var branch = this.data.branch[id];

		if (this.data._filter_branch)
			branch = this.data._filter_branch[id];

		if(branch){
			var i = branch.length;
			while (i--) {
				var item = this.getItem(branch[i]);
				if(!this.data.branch[item.id] && item.type != "folder"){
					this.remove(item.id);
				}
			}
		}
	},
	parseData: function(data){
		this.parse(data);
		this.$skipDynLoading = true;
		this.refreshCursor();
		this.$skipDynLoading = false;
	},
	dataParser: {
		files: function(obj, data){
			if(this._settings.noFileCache){
				this.clearBranch(obj.id);
			}
			else
				obj.webix_files = 0;

			this.parseData(data);
		},
		branch : function(obj, data){
			if(this._settings.noFileCache){
				this.clearBranch(obj.id);
			}
			else{
				obj.webix_branch = 0;
				obj.webix_child_branch = 0;
			}

			this.parseData(data);
		}
	},
	loadDynData: function(url, obj, mode, open){
		this.showProgress();
		if(this.callEvent("onBeforeDynLoad", [url, obj, mode, open])){
			var callback = {
				success: webix.bind(function(text,response){
					this.hideProgress();
					var data = this.data.driver.toObject(text, response);
					if(open)
						obj.open = true;

					if(this.callEvent("onBeforeDynParse", [obj, data, mode])){
						this.dataParser[mode].call(this, obj, data);
						this.callEvent("onAfterDynParse", [obj, data, mode]);
					}
				},this),
				error: webix.bind(function(){
					this.hideProgress();
					this.callEvent("onDynLoadError",[]);
				},this)
			};
			if (url.load)
				return url.load(null, callback, { action: mode, source: obj.id});
		}
	},
	_setViewHandlers: function(modename){
		var view = this.$$(modename);
		var fmanager = this;

		view.attachEvent("onAfterSelect", function(id){
			fmanager.callEvent("onItemSelect",[id]);
		});

		this.data.attachEvent("onIdChange",function(oldId,newId){
			if(view.data.pull[oldId])
				view.data.changeId(oldId,newId);
		});

		// folder type definition
		this.$$(modename).data._scheme_init = webix.bind(function (obj) {
			var item = this.getItem(obj.id);
			if (item && item.$count) {
				obj.type = "folder";
			}
		}, this);

		// applying templates
		this.$$(modename).type.icons = this.config.icons;
		this.$$(modename).type.templateIcon = this.config.templateIcon;
		this.$$(modename).type.templateName = this.config.templateName;
		this.$$(modename).type.templateSize = this.config.templateSize;
		this.$$(modename).type.templateDate = this.config.templateDate;
		this.$$(modename).type.templateType = this.config.templateType;

		// double-click handlers
		this.$$(modename).attachEvent("onItemDblClick",webix.bind(this._runFile,this));

		// data binding
		this.data.attachEvent("onClearAll", webix.bind(function () {
			this.clearAll();
		}, this.$$(modename)));

		this.$$(modename).bind(this, "$data", webix.bind(function (obj, source) {

			if (!obj) return this.$$(modename).clearAll();


			if (!this.$searchResults) {
				/*var data = [].concat(webix.copy(source.data.getBranch(obj.id))).concat(obj.files || []);
				this.$$(modename).data.importData(data, true);*/

				if(!this.$skipDynLoading){
					var url;
					for(var mode in this.dataParser){
						if(!url && obj["webix_"+mode]) {
							url = this.config.handlers[mode];

							if (url) {
								this.loadDynData(url, obj, mode);
							}
						}
					}
				}
				// import child items
				this._importSelectedBranch(this.$$(modename), source, obj);
			}
		}, this));

		// focus and blur styling
		this.$$(modename).attachEvent("onFocus", function () {
			if (!this.getSelectedId()) {
				var id = this.getFirstId();
				if (id){

					this.select(id);
				}
			}
			fmanager._activeView = this;
			webix.html.removeCss(this.$view, "webix_blur");
		});
		this.$$(modename).attachEvent("onBlur", function () {
			if (!fmanager.getMenu() || !fmanager.getMenu().isVisible()) {
				webix.html.addCss(this.$view, "webix_blur");
			}
		});

		// link with context menu
		var menu = this.getMenu();
		if (menu && !this.config.readonly) {
			this.$$(modename).on_context["webix_view"] = function(e,id,trg){
				var id = this.locate(e.target|| e.srcElement);
				if(!id){
					menu._area = { obj:webix.$$(e)};
					menu.show(e);
					webix.html.preventEvent(e);
				}

			};
			menu.attachTo(this.$$(modename));

			this.$$(modename).attachEvent("onBeforeMenuShow", function (id) {
				var context = menu.getContext();
				menu.filter(function(obj){
					var res = true;
					if(!context.id && obj.batch == "item")
						res = false;

					if(fmanager.config.menuFilter)
						res =  res && fmanager.config.menuFilter(obj);

					return res;
				});

				if(menu.count() && context.id){
					webix.UIManager.setFocus(this);
					var sel = this.getSelectedId();
					var found = false;
					if(webix.isArray(sel)){
						for(var i =0; !found && i < sel.length; i++){
							if(""+sel[i] == ""+context.id)
								found = true;
						}
					}
					if(!found)
						this.select(context.id);
				}

				return menu.count()>0;
			});
		}

		this.$$(modename).attachEvent("onAfterMenuShow", function (id) {
			if(id){
				var selected = this.getSelectedId(true);
				var isSelected = false;
				for (var i = 0; ( i < selected.length) && !isSelected; i++) {
					if (selected[i].toString() == id.toString()) {
						isSelected = true;
					}
				}
				if (!isSelected)
					this.select(id.toString());

				webix.UIManager.setFocus(this);
			}
			else{
				this.unselect();
			}
		});

		// editing (rename)
		this.$$(modename).attachEvent("onBeforeEditStop", function (state, editor) {
			return this.getTopParentView().callEvent("onBeforeEditStop", [editor.id || editor.row, state, editor, this]);
		});
		this.$$(modename).attachEvent("onAfterEditStop", function (state, editor) {
			var view = this.getTopParentView();
			if (view.callEvent("onAfterEditStop", [editor.id || editor.row, state, editor, this])) {
				if(!editor.column || editor.column == "value")
					view.renameFile(editor.id || editor.row, state.value);
				else if(editor.column){
					view.getItem(editor.id || editor.row)[editor.column] = state.value;
				}
			}
		});

		// drag-n-drop
		this.$$(modename).attachEvent("onBeforeDrop", function (context) {
			var fmanager = this.getTopParentView();
			if (fmanager.callEvent("onBeforeDrop", [context])) {
				if (context.from) {    //from different component
					fmanager.moveFile(context.source, context.target);
				}
			}
			return false;
		});
		this.$$(modename).attachEvent("onBeforeDrag", function (context, e) {
			var fmanager = this.getTopParentView();
			return !fmanager.config.readonly&&fmanager.callEvent("onBeforeDrag", [context, e]);
		});
		this.$$(modename).attachEvent("onBeforeDragIn", function (context, e) {
			var fmanager = this.getTopParentView();
			return !fmanager.config.readonly&&fmanager.callEvent("onBeforeDragIn", [context, e]);
		});

		// enter hot key
		this._addElementHotKey("enter", webix.bind(function (view) {
			var selected = view.getSelectedId(true);
			for (var i = 0; i < selected.length; i++) {
				this._runFile(selected[i]);
			}
			webix.UIManager.setFocus(view);
			selected = view.getSelectedId(true);
			if (!selected.length) {
				var id0 = view.getFirstId();
				if (id0)
					view.select(id0);
			}
		}, this), this.$$(modename));

		//read-only
		if(this.config.readonly){
			this.$$(modename).define("drag",false);
			this.$$(modename).define("editable",false);
		}
	},
	_getDefaultSelection: function(){
		var selection =  this.config.defaultSelection;
		return selection?selection.call(this):this.getFirstChildId(0);
	},
	_getViewConfig: function(view,config){

		var viewConfig = view.config||view;
		return (typeof(viewConfig)=="function"?viewConfig.call(this,config):webix.copy(viewConfig));
	},
	_setDefaultElements : function(config){
		var newView, vName,
			newViews = config.structure;
		if(newViews){
			for(vName in newViews){
				if(newViews.hasOwnProperty(vName)){
					newView = webix.copy(newViews[vName]);
					if(this.structure[vName] && this.structure[vName].config){
						this.structure[vName].config = newView.config||newView;
					}
					else{
						this.structure[vName] = newView.config||newView;
					}
				}
			}
		}
	},
	defaults: {
		modes: ["files","table"],
		mode: "table",
		handlers: {},
		structure:{},
		fsIds: true,
		templateName: webix.template("#value#"),
		templateSize: function(obj){
			var value = obj.size;
			var labels = webix.i18n.filemanager.sizeLabels;
			var pow = 0;
			while(value/1024 >1){
				value = value/1024;
				pow++;
			}
			var isInt = (parseInt(value,10) == value);

			var format = webix.Number.numToStr({
				decimalDelimiter:webix.i18n.decimalDelimiter,
				groupDelimiter:webix.i18n.groupDelimiter,
				decimalSize : isInt?0:webix.i18n.groupSize
			});

			return format(value)+""+labels[pow];
		},
		templateType: function(obj){
			var types = webix.i18n.filemanager.types;
			return types&&types[obj.type]?types[obj.type]:obj.type;
		},
		templateDate: function(obj){
			var date = obj.date;
			if(typeof(date) != "object"){
				date = new Date(parseInt(obj.date,10)*1000);
			}
			return webix.i18n.fullDateFormatStr(date);
		},
		templateCreate: function(){
			return {value: "newFolder", type: "folder", date: new Date()};
		},
		templateIcon: function(obj,common){
			return "<span class='webix_icon webix_fmanager_icon fa-"+(common.icons[obj.type]||common.icons["file"])+"'></span>";
		},
		uploadProgress: {
			type:"top",
			delay:3000,
			hide:true
		},
		idChange: true,
		icons: {
			folder: "folder",
			doc: "file-word-o",
			excel: "file-excel-o",
			pdf: "file-pdf-o",
			pp: "file-powerpoint-o",
			text: "file-text-o",
			video: "file-video-o",
			image: "file-image-o",
			code: "file-code-o",
			audio: "file-audio-o",
			archive: "file-archive-o",
			file: "file-o"
		}
	}

}, webix.FileManagerUpload, webix.FileManagerStructure, webix.ProgressBar, webix.IdSpace, webix.ui.layout,webix.TreeDataMove, webix.TreeDataLoader, webix.DataLoader, webix.EventSystem, webix.Settings);