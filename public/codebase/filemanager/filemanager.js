/*
@license
webix UI v.3.2.4
This software is covered by Webix Trial License.
Usage without proper license is prohibited.
(c) XB Software Ltd.
*/
webix.type(webix.ui.tree, {
    name: "FileTree",
    css: "webix_fmanager_tree",
    icon: function(t) {
        return t.webix_child_branch && !t.$count ? "<div class='webix_tree_child_branch webix_tree_close'></div>" : t.$count ? t.open ? "<div class='webix_tree_open'></div>" : "<div class='webix_tree_close'></div>" : "<div class='webix_tree_none'></div>"
    },
    folder: function(t) {
        return t.$count && t.open ? "<div class='webix_icon icon fa-folder-open'></div>" : "<div class='webix_icon icon fa-folder'></div>"
    }
}), webix.type(webix.ui.dataview, {
    name: "FileView",
    css: "webix_fmanager_files",
    height: 110,
    margin: 10,
    width: 150,
    template: function(t, e) {
        var i = t.type || "file";
        i = e.icons[i] || e.icons.file;
        var s = "webix_fmanager_data_icon",
            n = e.templateName(t, e);
        return "<div class='webix_fmanager_file'><div class='" + s + "'>" + e.templateIcon(t, e) + "</div>" + n + "</div>"
    }
}), webix.i18n.filemanager = {
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
    sizeLabels: ["B", "KB", "MB", "GB"],
    saving: "Saving...",
    errorResponse: "Error: changes were not saved!",
    replaceConfirmation: "The folder already contains files with such names. Would you like to replace existing files ?",
    createConfirmation: "The folder with such a name already exists. Would you like to replace it ?",
    renameConfirmation: "The file with such a name already exists. Would you like to replace it ?",
    yes: "Yes",
    no: "No",
    types: {
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
}, webix.protoUI({
    name: "filetree"
}, webix.EditAbility, webix.ui.tree), webix.protoUI({
    name: "fileview"
}, webix.EditAbility, webix.ui.dataview), webix.protoUI({
    name: "filetable",
    $dragHTML: function(t) {
        var e = "<div class='webix_dd_drag webix_fmanager_drag' >",
            i = this.getColumnIndex("value");
        return e += "<div style='width:auto'>" + this.config.columns[i].template(t, this.type) + "</div>", e + "</div>"
    }
}, webix.ui.datatable), webix.protoUI({
    name: "path",
    defaults: {
        layout: "x",
        separator: ",",
        scroll: !1
    },
    $skin: function() {
        this.type.height = webix.skin.$active.buttonHeight || webix.skin.$active.inputHeight
    },
    $init: function() {
        this.$view.className += " webix_path"
    },
    value_setter: function(t) {
        return this.setValue(), t
    },
    setValue: function(t) {
        this.clearAll(), t && ("string" == typeof t && (t = t.split(this.config.separator)), this.parse(webix.copy(t)))
    },
    getValue: function() {
        return this.serialize()
    }
}, webix.ui.list), webix.FileManagerStructure = {
    structure: {
        actions: {
            config: function() {
                var t = this.config.templateName;
                return {
                    view: "contextmenu",
                    width: 200,
                    padding: 0,
                    autofocus: !1,
                    css: "webix_fmanager_actions",
                    template: function(e, i) {
                        var s = t(e, i);
                        return "<span class='webix_icon fa-" + e.icon + "'></span>" + s
                    },
                    data: "actionsData"
                }
            },
            oninit: function() {
                var t = this.getMenu();
                t.$q = !1, t && (t.attachEvent("onItemClick", webix.bind(function(e, i) {
                    var s = this.getMenu().getItem(e),
                        n = this[s.method] || this[e];
                    if (n) {
                        var r = this.getActive();
                        if (this.callEvent("onbefore" + (s.method || e), [r])) {
                            ("upload" != e || !webix.isUndefined(XMLHttpRequest) && !webix.isUndefined((new XMLHttpRequest).upload)) && (t.Uq(!0), t.hide());
                            var a = [r];
                            "upload" == e && (i = webix.html.pos(i), a.push(i)), webix.delay(function() {
                                n.apply(this, a), this.callEvent("onafter" + (s.method || e), [])
                            }, this)
                        }
                    }
                }, this)), t.attachEvent("onBeforeShow", function(t) {
                    this.filter(""), this.hide();
                    var e = this.getContext();
                    return e && e.obj ? e.obj.callEvent("onBeforeMenuShow", [e.id, t]) : !0
                }))
            }
        },
        actionsData: {
            config: function() {
                return [{
                    id: "copy",
                    batch: "item",
                    method: "markCopy",
                    icon: "copy",
                    value: webix.i18n.filemanager.copy
                }, {
                    id: "cut",
                    batch: "item",
                    method: "markCut",
                    icon: "cut",
                    value: webix.i18n.filemanager.cut
                }, {
                    id: "paste",
                    method: "pasteFile",
                    icon: "paste",
                    value: webix.i18n.filemanager.paste
                }, {
                    $template: "Separator"
                }, {
                    id: "create",
                    method: "createFolder",
                    icon: "folder-o",
                    value: webix.i18n.filemanager.create
                }, {
                    id: "remove",
                    batch: "item",
                    method: "deleteFile",
                    icon: "times",
                    value: webix.i18n.filemanager.remove
                }, {
                    id: "edit",
                    batch: "item",
                    method: "editFile",
                    icon: "edit",
                    value: webix.i18n.filemanager.rename
                }, {
                    id: "upload",
                    method: "uploadFile",
                    icon: "upload",
                    value: webix.i18n.filemanager.upload
                }]
            }
        },
        mainLayout: {
            type: "clean",
            rows: "mainRows"
        },
        mainRows: ["toolbar", "bodyLayout"],
        toolbar: {
            css: "webix_fmanager_toolbar",
            paddingX: 10,
            paddingY: 5,
            margin: 7,
            cols: "toolbarElements"
        },
        toolbarElements: ["menu", {
            id: "menuSpacer",
            width: 65
        }, {
            margin: 2,
            cols: ["back", "forward"]
        }, "up", "path", "search", "modes"],
        menu: {
            config: {
                view: "button",
                type: "iconButton",
                css: "webix_fmanager_back",
                icon: "bars",
                width: 37
            },
            oninit: function() {
                this.$$("menu") && (this.$$("menu").attachEvent("onItemClick", webix.bind(function() {
                    this.callEvent("onBeforeMenu", []) && (this.getMenu().nh = {
                        obj: this.getActiveView(),
                        id: this.getActive()
                    }, this.getMenu().show(this.$$("menu").$view), this.callEvent("onAfterMenu", []))
                }, this)), this.config.readonly && (this.$$("menu").hide(), this.$$("menuSpacer") && this.$$("menuSpacer").hide()))
            }
        },
        back: {
            config: {
                view: "button",
                type: "iconButton",
                css: "webix_fmanager_back",
                icon: "angle-left",
                width: 37
            },
            oninit: function() {
                this.$$("back") && this.$$("back").attachEvent("onItemClick", webix.bind(function() {
                    this.callEvent("onBeforeBack", []) && (this.goBack(), this.callEvent("onAfterBack", []))
                }, this))
            }
        },
        forward: {
            config: {
                view: "button",
                type: "iconButton",
                css: "webix_fmanager_forward",
                icon: "angle-right",
                width: 37
            },
            oninit: function() {
                this.$$("forward") && this.$$("forward").attachEvent("onItemClick", webix.bind(function() {
                    this.callEvent("onBeforeForward", []) && (this.goForward(), this.callEvent("onAfterForward", []))
                }, this))
            }
        },
        up: {
            config: {
                view: "button",
                type: "iconButton",
                css: "webix_fmanager_up",
                icon: "level-up",
                disable: !0,
                width: 37
            },
            oninit: function() {
                this.$$("up") && this.$$("up").attachEvent("onItemClick", webix.bind(function() {
                    this.callEvent("onBeforeLevelUp", []) && (this.levelUp(), this.callEvent("onAfterLevelUp", []))
                }, this))
            }
        },
        path: {
            config: {
                view: "path",
                borderless: !0
            },
            oninit: function() {
                this.$$("path") && (this.attachEvent("onFolderSelect", webix.bind(function(t) {
                    this.$$("path").setValue(this.getPathNames(t))
                }, this)), this.$$("path").attachEvent("onItemClick", webix.bind(function(t) {
                    var e = this.$$("path").getIndexById(t),
                        i = this.$$("path").count() - e - 1;
                    if (this.$searchResults && this.hideSearchResults(), i) {
                        for (t = this.getCursor(); i;) t = this.getParentId(t), i--;
                        this.setCursor(t)
                    }
                    this.callEvent("onAfterPathClick", [t])
                }, this)), this.data.attachEvent("onClearAll", webix.bind(function() {
                    this.clearAll()
                }, this.$$("path"))))
            }
        },
        search: {
            config: {
                view: "search",
                gravity: .3,
                css: "webix_fmanager_search"
            },
            oninit: function() {
                var t = this.$$("search");
                t && (this.attachEvent("onHideSearchResults", function() {
                    t.setValue("")
                }), this.attachEvent("onBeforeCursorChange", function() {
                    this.$searchResults && this.hideSearchResults()
                }), t.attachEvent("onTimedKeyPress", webix.bind(function() {
                    if (9 != this.cx) {
                        var e = t.getValue();
                        e ? this.callEvent("onBeforeSearch", [e]) && (this.showSearchResults(e), this.callEvent("onAfterSearch", [e])) : this.$searchResults && this.hideSearchResults()
                    }
                }, this)), t.attachEvent("onKeyPress", function(t) {
                    this.cx = t
                }), this.attachEvent("onAfterModeChange", function() {
                    this.$searchResults && this.showSearchResults(t.getValue())
                }))
            }
        },
        bodyLayout: {
            css: "webix_fmanager_body",
            cols: "bodyCols"
        },
        bodyCols: ["tree", {
            view: "resizer",
            width: 2
        }, "modeViews"],
        tree: {
            config: {
                width: 251,
                view: "filetree",
                id: "tree",
                select: !0,
                filterMode: {
                    showSubItems: !1,
                    openParents: !1
                },
                type: "FileTree",
                navigation: !0,
                scroll: !0,
                editor: "text",
                editable: !0,
                editaction: !1,
                drag: !0,
                tabFocus: !0,
                onContext: {}
            },
            oninit: function() {
                var t = this.$$("tree");
                if (t) {
                    var e = this;
                    t.type.icons = this.config.icons, t.sync(this, function() {
                        this.filter(function(t) {
                            return t.$count || "folder" == t.type
                        })
                    }), t.on_click.webix_tree_child_branch = function(t, i) {
                        var s = e.config.handlers.branch;
                        s && e.loadDynData(s, this.getItem(i), "branch", !0)
                    }, this.attachEvent("onAfterDynParse", function(e, i, s) {
                        "branch" == s && e.open && t.open(e.id)
                    }), t.attachEvent("onAfterSelect", function(t) {
                        e.callEvent("onFolderSelect", [t])
                    }), this.attachEvent("onAfterCursorChange", function(e) {
                        e && (t.select(e), t.showItem(e))
                    }), t.attachEvent("onItemClick", function() {
                        e.$searchResults && e.hideSearchResults()
                    }), this.attachEvent("onItemRename", function(e) {
                        t.refresh(e)
                    }), t.attachEvent("onItemDblClick", function(t) {
                        this.isBranchOpen(t) ? this.close(t) : this.open(t)
                    }), t.attachEvent("onBlur", function() {
                        e.getMenu() && e.getMenu().isVisible() || webix.html.addCss(this.$view, "webix_blur")
                    }), t.attachEvent("onFocus", webix.bind(function() {
                        this.dx = t, webix.html.removeCss(t.$view, "webix_blur"), this.$$(this.config.mode).unselect()
                    }, this)), this.attachEvent("onPathLevel", function() {}), this.attachEvent("onPathComplete", function(e) {
                        t.showItem(e)
                    }), this.config.readonly || (this.getMenu() && this.getMenu().attachTo(t), t.attachEvent("onBeforeMenuShow", function(t) {
                        var i = e.getMenu();
                        return i.filter(function(i) {
                            var s = !0;
                            return t != e.getFirstChildId(0) || i.batch && -1 != i.batch.indexOf("root") || (s = !1), e.config.menuFilter && (s = s && e.config.menuFilter(i)), s
                        }), this.select(t), webix.UIManager.setFocus(this), i.count() > 0
                    })), t.attachEvent("onBeforeEditStop", webix.bind(function(e, i) {
                        return this.callEvent("onBeforeEditStop", [i.id, e, i, t])
                    }, this)), t.attachEvent("onAfterEditStop", webix.bind(function(e, i) {
                        this.callEvent("onAfterEditStop", [i.id, e, i, t]) && this.renameFile(i.id, e.value)
                    }, this)), t.attachEvent("onBeforeDrag", function(t, i) {
                        return !e.config.readonly && e.callEvent("onBeforeDrag", [t, i])
                    }), t.attachEvent("onBeforeDragIn", function(t, i) {
                        return !e.config.readonly && e.callEvent("onBeforeDragIn", [t, i])
                    }), t.attachEvent("onBeforeDrop", function(t, i) {
                        return e.callEvent("onBeforeDrop", [t, i]) && t.from && (e.moveFile(t.source, t.target), e.callEvent("onAfterDrop", [t, i])), !1
                    });
                    var i = function() {
                        t && webix.UIManager.setFocus(t)
                    };
                    this.attachEvent("onAfterBack", i), this.attachEvent("onAfterForward", i), this.attachEvent("onAfterLevelUp", i), this.attachEvent("onAfterPathClick", i), this.config.readonly && (t.define("drag", !1), t.define("editable", !1))
                }
            }
        },
        modeViews: {
            config: function(t) {
                var e = [];
                if (t.modes)
                    for (var i = 0; i < t.modes.length; i++) e.push(t.modes[i]);
                return {
                    animate: !1,
                    cells: e
                }
            },
            oninit: function() {
                this.$$(this.config.mode) && this.$$(this.config.mode).show(), this.attachEvent("onBeforeCursorChange", function() {
                    return this.$$(this.config.mode).unselect(), !0
                });
                var t = this.config.modes;
                if (t)
                    for (var e = 0; e < t.length; e++) this.$$(t[e]) && this.$$(t[e]).filter && this.ex(t[e])
            }
        },
        modes: {
            config: function(t) {
                var e = 0,
                    i = this.structure.modeOptions;
                if (i)
                    for (var s = 0; s < i.length; s++) i[s].width && (e += i[s].width + (i.length ? 1 : 0));
                var n = {
                    view: "segmented",
                    options: "modeOptions",
                    css: "webix_fmanager_modes",
                    value: t.mode
                };
                return e && (n.width = e + 4), n
            },
            oninit: function() {
                this.$$("modes") && this.$$("modes").attachEvent("onBeforeTabClick", webix.bind(function(t) {
                    var e = this.$$("modes").getValue();
                    return this.callEvent("onBeforeModeChange", [e, t]) && this.$$(t) ? (this.config.mode = t, this.$$(t).show(), this.callEvent("onAfterModeChange", [e, t]), !0) : !1
                }, this))
            }
        },
        modeOptions: [{
            id: "files",
            width: 32,
            value: '<span class="webix_fmanager_mode_option webix_icon fa-th"></span>'
        }, {
            id: "table",
            width: 32,
            value: '<span class="webix_fmanager_mode_option webix_icon fa-list-ul"></span>'
        }],
        files: {
            config: {
                view: "fileview",
                type: "FileView",
                select: "multiselect",
                editable: !0,
                editaction: !1,
                editor: "text",
                editValue: "value",
                drag: !0,
                navigation: !0,
                tabFocus: !0,
                onContext: {}
            }
        },
        table: {
            config: {
                view: "filetable",
                css: "webix_fmanager_table",
                columns: "columns",
                editable: !0,
                editaction: !1,
                select: "multiselect",
                drag: !0,
                navigation: !0,
                resizeColumn: !0,
                tabFocus: !0,
                onContext: {}
            },
            oninit: function() {
                this.$$("table") && (this.attachEvent("onHideSearchResults", function() {
                    this.$$("table").isColumnVisible("location") && this.$$("table").hideColumn("location")
                }), this.attachEvent("onShowSearchResults", function() {
                    this.$$("table").isColumnVisible("location") || this.$$("table").showColumn("location")
                }), this.$$("table").attachEvent("onBeforeEditStart", function(t) {
                    return "object" != typeof t ? (this.edit({
                        row: t,
                        column: "value"
                    }), !1) : !0
                }))
            }
        },
        columns: {
            config: function() {
                var t = webix.i18n.filemanager,
                    e = this;
                return [{
                    id: "value",
                    header: t.name,
                    fillspace: 3,
                    template: function(t, e) {
                        var i = e.templateName(t, e);
                        return e.templateIcon(t, e) + i
                    },
                    sort: "string",
                    editor: "text"
                }, {
                    id: "date",
                    header: t.date,
                    fillspace: 2,
                    template: function(t, e) {
                        return e.templateDate(t, e)
                    },
                    sort: "date"
                }, {
                    id: "type",
                    header: t.type,
                    fillspace: 1,
                    sort: "string",
                    template: function(t, e) {
                        return e.templateType(t)
                    }
                }, {
                    id: "size",
                    header: t.size,
                    fillspace: 1,
                    css: {
                        "text-align": "right"
                    },
                    template: function(t, e) {
                        return "folder" == t.type ? "" : e.templateSize(t)
                    },
                    sort: "int"
                }, {
                    id: "location",
                    header: t.location,
                    fillspace: 2,
                    template: function(t) {
                        return e.WB(t)
                    },
                    sort: "string",
                    hidden: !0
                }]
            }
        },
        upload: {
            config: function() {
                var t = {};
                return t = webix.isUndefined(XMLHttpRequest) || webix.isUndefined((new XMLHttpRequest).upload) ? {
                    view: "uploader",
                    css: "webix_upload_select_ie",
                    type: "iconButton",
                    icon: "check",
                    label: webix.i18n.filemanager.select,
                    formData: {
                        action: "upload"
                    }
                } : {
                    view: "uploader",
                    apiOnly: !0,
                    formData: {
                        action: "upload"
                    }
                }
            },
            oninit: function() {
                this.XB()
            }
        }
    }
}, webix.FileManagerUpload = {
    px: function() {
        var t = webix.copy(this.structure.upload),
            e = this.qx(t, this.config);
        e && (webix.isUndefined(XMLHttpRequest) || webix.isUndefined((new XMLHttpRequest).upload) ? this.YB(webix.copy(e)) : (this.rx = webix.ui(e), this.attachEvent("onDestruct", function() {
            this.rx.destructor()
        })), t.oninit && t.oninit.call(this))
    },
    YB: function(t) {
        if (!t) var e = webix.copy(this.structure.upload),
            t = this.qx(e, this.config);
        this.Ix = webix.ui({
            view: "popup",
            padding: 0,
            width: 250,
            body: t
        }), this.rx = this.Ix.getBody(), this.attachEvent("onDestruct", function() {
            this.Ix.destructor()
        })
    },
    getUploader: function() {
        return this.rx
    },
    gx: function() {
        return this.hx || this.getCursor()
    },
    uploadFile: function(t, e) {
        this.data.branch[t] || "folder" == this.getItem(t).type || (t = this.getParentId(t)), this.hx = t, this.Ix ? (this.Ix.destructor(), this.YB(), this.XB(), this.Ix.show(e, {
            x: 20,
            y: 5
        })) : this.rx && this.rx.fileDialog()
    },
    XB: function() {
        var t = this.getUploader();
        if (t) {
            t.config.upload = this.config.handlers.upload;
            var e = this.config.modes;
            if (e && !this.config.readonly)
                for (var i = 0; i < e.length; i++) this.$$(e[i]) && t.addDropZone(this.$$(e[i]).$view);
            t.attachEvent("onBeforeFileAdd", webix.bind(function(e) {
                var i = "" + this.gx();
                return t.config.formData.target = i, this.callEvent("onBeforeFileUpload", [e])
            }, this)), t.attachEvent("onAfterFileAdd", webix.bind(function(e) {
                this.hx = null, e.oldId = e.id, this.add({
                    id: e.id,
                    value: e.name,
                    type: e.type,
                    size: e.size,
                    date: Math.round((new Date).valueOf() / 1e3)
                }, -1, t.config.formData.target), this.config.uploadProgress && this.showProgress(this.config.uploadProgress), this.refreshCursor()
            }, this)), t.attachEvent("onUploadComplete", webix.bind(function() {
                this.Ix && (this.getMenu().hide(), this.Ix.hide())
            }, this)), t.attachEvent("onFileUpload", webix.bind(function(t) {
                t.id.replace("\\\\", "\\");
                t.oldId && this.data.changeId(t.oldId, t.id), t.value && (this.getItem(t.id).value = t.value), this.getItem(t.id).type = t.type, this.refreshCursor(), this.hideProgress()
            }, this)), t.attachEvent("onFileUploadError", webix.bind(function(t, e) {
                this.ix(e), this.hideProgress()
            }, this))
        }
    }
}, webix.protoUI({
    name: "filemanager",
    $init: function(t) {
        this.$view.className += " webix_fmanager", webix.extend(this.data, webix.TreeStore, !0), webix.extend(t, this.defaults), this.data.provideApi(this, !0), this.jx = webix.extend([], webix.PowerArray, !0), this.Pw(t), this.$ready.push(this.kx), webix.UIManager.tabControl = !0, webix.extend(t, this.zv(t))
    },
    handlers_setter: function(t) {
        for (var e in t) {
            var i = t[e];
            if ("string" == typeof i)
                if (-1 != i.indexOf("->")) {
                    var s = i.split("->");
                    i = webix.proxy(s[0], s[1])
                } else "upload" != e && "download" != e && (i = webix.proxy("post", i));
            t[e] = i
        }
        return t
    },
    kx: function() {
        this.lx(), this.attachEvent("onAfterLoad", function() {
            if (!this.config.disabledHistory) {
                var t = window.location.hash;
                t && 0 === t.indexOf("#!/") && this.setPath(t.replace("#!/", ""))
            }
            this.getCursor() || this.setCursor(this.Rw())
        }), this.attachEvent("onFolderSelect", function(t) {
            this.setCursor(t)
        }), this.attachEvent("onAfterCursorChange", function(t) {
            this.$$(this.config.mode) && this.$$(this.config.mode).editStop(), this.mx || (this.nx || this.jx.splice(1), this.jx[this.nx] != t && (20 == this.jx.length && this.jx.splice(0, 1), this.jx.push(t), this.nx = this.jx.length - 1)), this.mx = !1, this.config.disabledHistory || this.ox(t)
        }), this.attachEvent("onBeforeDragIn", function(t) {
            var e = t.target;
            if (e)
                for (var i = t.source, s = 0; s < i.length; s++)
                    for (; e;) {
                        if (e == i[s]) return !1;
                        e = this.getParentId(e)
                    }
            return !0
        }), this.px()
    },
    ox: function(t) {
        t = t || this.getCursor(), window.history && window.history.replaceState ? window.history.replaceState({
            webix: !0,
            id: this.config.id,
            value: t
        }, "", "#!/" + t) : window.location.hash = "#!/" + t
    },
    zv: function(t) {
        var e = this.structure.mainLayout,
            i = webix.extend({}, e.config || e);
        return this.Sw(i, t), t.on && t.on.onViewInit && t.on.onViewInit.apply(this, [t.id || "mainLayout", i]), webix.callEvent("onViewInit", [t.id || "mainLayout", i, this]), i
    },
    updateStructure: function() {
        var t = this.zv(),
            e = this.mc ? "rows" : "cols";
        this.define(e, t[e]), this.reconstruct()
    },
    Sw: function(t, e) {
        var i, s, n, r, a = "",
            h = ["rows", "cols", "elements", "cells", "columns", "options", "data"];
        for (n = 0; n < h.length; n++) t[h[n]] && (a = h[n], i = t[a]);
        if (i)
            for ("string" == typeof i && this.structure[i] && (t[a] = this.qx(this.structure[i], e), i = t[a]), n = 0; n < i.length; n++) {
                if (s = null, "string" == typeof i[n])
                    if (s = r = i[n], this.structure[r]) {
                        var o = webix.extend({}, this.structure[r]);
                        i[n] = this.qx(o, e), i[n].id = r, o.oninit && this.$ready.push(o.oninit)
                    } else i[n] = {};
                this.Sw(i[n], e), s && (e.on && e.on.onViewInit && e.on.onViewInit.apply(this, [s, i[n]]), webix.callEvent("onViewInit", [s, i[n], this]))
            }
    },
    lx: function() {
        if (this.structure.actions) {
            var t = webix.copy(this.structure.actions),
                e = t.config || t;
            "function" == typeof e && (e = e.call(this)), this.Sw(e, this.config), this.sx = webix.ui(e), this.attachEvent("onDestruct", function() {
                this.sx.destructor()
            }), t.oninit && this.$ready.push(t.oninit)
        }
    },
    getMenu: function() {
        return this.sx
    },
    getPath: function(t) {
        t = t || this.getCursor();
        for (var e = null, i = []; t && this.getItem(t);) e = this.getItem(t), i.push(t), t = this.getParentId(t);
        return i.reverse()
    },
    getPathNames: function(t) {
        t = t || this.getCursor();
        for (var e = null, i = []; t && this.getItem(t);) e = this.getItem(t), i.push({
            id: t,
            value: this.config.templateName(e)
        }), t = this.getParentId(t);
        return i.reverse()
    },
    setPath: function(t) {
        for (var e = t; e && this.getItem(e);) this.callEvent("onPathLevel", [e]), e = this.getParentId(e);
        if (this.getItem(t)) this.setCursor(t), this.callEvent("onPathComplete", [t]);
        else {
            var i = this.ZB(t);
            this.openFolders(i).then(webix.bind(function() {
                this.setCursor(t), this.callEvent("onPathComplete", [t])
            }, this))
        }
    },
    WB: function(t) {
        var e, i;
        if (this.getItem(t.id)) {
            i = this.getPathNames(t.parent ? t.parent : t.id), i.shift(), i.pop();
            for (var s = [], n = 0; n < i.length; n++) s.push(i[n].value);
            e = "/" + s.join("/")
        } else if (t.location) e = t.location;
        else {
            var r = t.id.split("/");
            r.pop(), e = "/" + r.join("/")
        }
        return e
    },
    tx: function(t) {
        if (this.jx.length > 1) {
            var e = this.nx + t;
            e > -1 && e < this.jx.length && (this.mx = !0, this.setCursor(this.jx[e]), this.nx = e)
        }
        return this.getCursor()
    },
    getSearchData: function(t, e) {
        var i = [];
        return this.data.each(function(t) {
            var s = this.config.templateName(t);
            s.toLowerCase().indexOf(e.toLowerCase()) >= 0 && i.push(webix.copy(t))
        }, this, !0, t), i
    },
    $B: function(t, e, i) {
        var s = {
            action: "search",
            source: e,
            text: i
        };
        if (this.callEvent("onBeforeSearchRequest", [e, s])) {
            var n = {
                success: webix.bind(function(t, e) {
                    this.hideProgress();
                    var i = this.data.driver.toObject(t, e);
                    this._B(i)
                }, this),
                error: webix.bind(function() {
                    this.hideProgress()
                }, this)
            };
            if (t.load) return t.load(null, n, s)
        }
    },
    _B: function(t) {
        this.callEvent("onShowSearchResults", []), this.$searchResults = !0, this.$$(this.config.mode).filter && (this.$$(this.config.mode).clearAll(), this.$$(this.config.mode).parse(t))
    },
    showSearchResults: function(t) {
        var e = this.getCursor();
        if (this.config.handlers.search) this.$B(this.config.handlers.search, e, t);
        else {
            var i = this.getSearchData(e, t);
            this._B(i)
        }
    },
    hideSearchResults: function() {
        if (this.$searchResults) {
            this.callEvent("onHideSearchResults", []), this.$searchResults = !1;
            var t = this.getCursor();
            this.ib = null, this.setCursor(t)
        }
    },
    goBack: function(t) {
        return t = t ? -1 * Math.abs(t) : -1, this.tx(t)
    },
    goForward: function(t) {
        return this.tx(t || 1)
    },
    levelUp: function(t) {
        t = t || this.getCursor(), t && (t = this.getParentId(t), this.setCursor(t))
    },
    markCopy: function(t) {
        t && (webix.isArray(t) || (t = [t]), this.ux = t, this.vx = !0)
    },
    markCut: function(t) {
        t && (webix.isArray(t) || (t = [t]), this.ux = t, this.vx = !1)
    },
    pasteFile: function(t) {
        webix.isArray(t) && (t = t[0]), t && (t = t.toString(), this.data.branch[t] && "folder" == this.getItem(t).type && this.ux && (this.vx ? this.copyFile(this.ux, t) : this.moveFile(this.ux, t)))
    },
    download: function(t) {
        var e = this.config.handlers.download;
        e && webix.send(e, {
            action: "download",
            source: t
        })
    },
    fileExists: function(t, e, i) {
        var s = !1;
        return this.data.eachChild(e, webix.bind(function(e) {
            t != e.value || i && e.id == i || (s = e.id)
        }, this)), s
    },
    aC: function(t) {
        var e = this.getParentId(t.id) + "/" + t.value;
        t.id != e && this.changeId(t.id, e)
    },
    Kx: function(t) {
        this.data.eachSubItem(t, function(t) {
            t.value && this.aC(t)
        })
    },
    bC: function(t, e) {
        var i = this.getItem(t);
        i.value != e && (i.value = e, this.refreshCursor(), this.callEvent("onItemRename", [t]))
    },
    Lx: function(t, e, i) {
        for (var s = i ? "copy" : "move", n = [], r = 0; r < t.length; r++) {
            var a = this.move(t[r], 0, this, {
                parent: e,
                copy: i ? !0 : !1
            });
            n.push(a)
        }
        this.refreshCursor();
        var h = this.config.handlers[s];
        h && this.xx(h, {
            action: s,
            source: t.join(","),
            temp: n.join(","),
            target: e.toString()
        }, function(t, e) {
            if (e && webix.isArray(e))
                for (var i = t.temp.split(","), s = 0; s < e.length; s++) e[s].id && e[s].id != i[s] && this.data.pull[i[s]] && (this.data.changeId(i[s], e[s].id), this.s.fsIds && this.Kx(e[s].id), e[s].value && this.bC(e[s].id, e[s].value))
        })
    },
    copyFile: function(t, e) {
        this.moveFile(t, e, !0)
    },
    moveFile: function(t, e, i) {
        var s, n, r;
        for ("string" == typeof t && (t = t.split(",")), webix.isArray(t) || (t = [t]), e ? this.data.branch[e] || "folder" == this.getItem(e.toString()).type || (e = this.getParentId(e)) : e = this.getCursor(), r = !0, e = e.toString(), s = 0; s < t.length; s++) n = t[s].toString(), r = r && this.wx(n, e);
        r ? this.Lx(t, e, i ? !0 : !1) : this.callEvent(i ? "onCopyError" : "onMoveError", [])
    },
    deleteFile: function(t, e) {
        "string" == typeof t && (t = t.split(",")), webix.isArray(t) || (t = [t]);
        for (var i = 0; i < t.length; i++) {
            var s = t[i];
            this.$$(this.config.mode).isSelected(s) && this.$$(this.config.mode).unselect(s), s == this.getCursor() && this.setCursor(this.getFirstId()), s && this.remove(s)
        }
        this.refreshCursor();
        var n = this.config.handlers.remove;
        n ? (e && (e = webix.bind(e, this)), this.xx(n, {
            action: "remove",
            source: t.join(",")
        }, e)) : e && e.call(this)
    },
    Mx: function(t, e) {
        this.add(t, 0, e), t.source = t.value, t.target = e, this.refreshCursor();
        var i = this.config.handlers.create;
        i && (t.action = "create", this.xx(i, t, function(t, e) {
            e.id && (t.id != e.id && this.data.changeId(t.id, e.id), this.config.fsIds && this.Kx(e.id), e.value && this.bC(e.id, e.value))
        }))
    },
    createFolder: function(t) {
        if ("string" == typeof t && (t = t.split(",")), webix.isArray(t) && (t = t[0]), t) {
            t = "" + t;
            var e = this.getItem(t);
            this.data.branch[t] || "folder" == e.type || (t = this.getParentId(t));
            var i = this.config.templateCreate(e);
            t = "" + t, this.Mx(i, t)
        }
    },
    editFile: function(t) {
        webix.isArray(t) && (t = t[0]), this.getActiveView() && this.getActiveView().edit && this.getActiveView().edit(t)
    },
    renameFile: function(t, e, i) {
        var s = this.getItem(t);
        i = i || "value", s[i] = e, this.refreshCursor(), this.callEvent("onFolderSelect", [this.getCursor()]);
        var n = this.config.handlers.rename;
        if (n) {
            var r = {
                source: t,
                action: "rename",
                target: e
            };
            this.xx(n, r, function(t, e) {
                e.id && (t.source != e.id && this.data.changeId(t.source, e.id), e.value && this.bC(e.id, e.value))
            })
        }
    },
    wx: function(t, e) {
        for (; e;) {
            if (e == t || !this.data.branch[e] && "folder" != this.getItem(e.toString()).type) return !1;
            e = this.getParentId(e)
        }
        return !0
    },
    Ox: function(t) {
        this.Px = new Date, this.Qx || (this.Qx = webix.html.create("DIV", {
            "class": "webix_fmanager_save_message"
        }, ""), this.x.style.position = "relative", webix.html.insertBefore(this.Qx, this.x));
        var e = "";
        e = "string" == typeof t ? t : t ? webix.i18n.filemanager.errorResponse : webix.i18n.filemanager.saving, this.Qx.innerHTML = e
    },
    Rx: function() {
        this.Qx && (webix.html.remove(this.Qx), this.Qx = null)
    },
    xx: function(t, e, i) {
        if (this.callEvent("onBeforeRequest", [t, e]) && (this.Ox(), t.load)) {
            var s = {
                success: webix.bind(function(t, s) {
                    var n = this.data.driver.toObject(t, s);
                    this.Rx(), this.callEvent("onSuccessResponse", [e, n]) && i && i.call(this, e, n)
                }, this),
                error: webix.bind(function(t) {
                    this.callEvent("onErrorResponse", [e, t]) && this.ix(t)
                }, this)
            };
            t.load(null, s, webix.copy(e))
        }
    },
    getActiveView: function() {
        return this.dx || this.$$("tree") || null
    },
    getActive: function() {
        var t = this.getSelectedFile();
        return t ? t : this.getCursor()
    },
    getCurrentFolder: function() {
        return this.$$("tree").getSelectedId()
    },
    getSelectedFile: function() {
        var t = null,
            e = this.$$(this.config.mode).getSelectedId();
        if (e)
            if (webix.isArray(e)) {
                t = [];
                for (var i = 0; i < e.length; i++) t.push(e[i].toString())
            } else t = e.toString();
        return t
    },
    yx: function(t) {
        t = t.toString();
        var e = this.getItem(t);
        if (e) this.data.branch[t] || "folder" == e.type ? this.callEvent("onBeforeLevelDown", [t]) && (this.setCursor(t), this.callEvent("onAfterLevelDown", [t])) : this.callEvent("onBeforeRun", [t]) && (this.download(t), this.callEvent("onAfterRun", [t]));
        else if (this.$$(this.config.mode).filter) {
            e = this.$$(this.config.mode).getItem(t);
            var i = e && e.parents ? e.parents : this.ZB(t);
            this.openFolders(i).then(webix.bind(function() {
                this.yx(t)
            }, this))
        }
    },
    ZB: function(t) {
        for (var e = t.split("/"), i = [], s = 0; s < e.length; s++) i.push(e.slice(0, s + 1).join("/"));
        return i
    },
    cC: function() {
        for (var t in this.dataParser)
            if (this.config.handlers[t]) return t;
        return null
    },
    dC: function(t, e, i) {
        var s = this.getItem(t[0]);
        this.showProgress();
        var n = this.config.handlers[e],
            r = {
                success: webix.bind(function(n, r) {
                    this.hideProgress();
                    var a = this.data.driver.toObject(n, r);
                    if (this.callEvent("onBeforeDynParse", [s, a, e])) {
                        s.open = !0, this.dataParser[e].call(this, s, a);
                        var h = t.shift();
                        t.length && "folder" == this.getItem(t[0]).type ? this.dC(t, e, i) : (this.refreshCursor(), i.resolve(h)), this.callEvent("onAfterDynParse", [s, a, e])
                    }
                }, this)
            };
        return n.load ? n.load(null, r, {
            action: e,
            source: t[0]
        }) : void 0
    },
    openFolders: function(t) {
        var e, i, s, n = webix.promise.defer();
        if (e = this.cC(), e && t.length) {
            for (i = 0; i < t.length; i++) {
                if (s = this.getItem(t[i]), !s || s["webix_" + e]) return this.dC(t.slice(i), e, n), n;
                s.open = !0, this.$$("tree") && this.$$("tree").refresh(t[i])
            }
            n.resolve(t[i])
        } else n.reject();
        return n
    },
    Bt: function(t, e, i) {
        var s = webix.UIManager.addHotKey(t, e, i);
        (i || this).attachEvent("onDestruct", function() {
            webix.UIManager.removeHotKey(s, e, i)
        })
    },
    ix: function() {
        var t = this.data.url;
        if (t) {
            var e = this.data.driver;
            this.Ox(!0);
            var i = this;
            webix.ajax().get(t, {
                success: function(s, n) {
                    var r = e.toObject(s, n);
                    r && (r = e.getDetails(e.getRecords(r)), i.clearAll(), i.parse(r), i.data.url = t)
                },
                error: function() {}
            })
        }
    },
    eC: function(t, e, i) {
        var s = [].concat(webix.copy(e.data.getBranch(i.id))).concat(i.files || []);
        t.data.importData(s, !0)
    },
    clearBranch: function(t) {
        var e = this.data.branch[t];
        if (this.data.Mg && (e = this.data.Mg[t]), e)
            for (var i = e.length; i--;) {
                var s = this.getItem(e[i]);
                this.data.branch[s.id] || "folder" == s.type || this.remove(s.id)
            }
    },
    parseData: function(t) {
        this.parse(t), this.$skipDynLoading = !0, this.refreshCursor(), this.$skipDynLoading = !1
    },
    dataParser: {
        files: function(t, e) {
            this.s.noFileCache ? this.clearBranch(t.id) : t.webix_files = 0, this.parseData(e)
        },
        branch: function(t, e) {
            this.s.noFileCache ? this.clearBranch(t.id) : (t.webix_branch = 0, t.webix_child_branch = 0), this.parseData(e)
        }
    },
    loadDynData: function(t, e, i, s) {
        if (this.showProgress(), this.callEvent("onBeforeDynLoad", [t, e, i, s])) {
            var n = {
                success: webix.bind(function(t, n) {
                    this.hideProgress();
                    var r = this.data.driver.toObject(t, n);
                    s && (e.open = !0), this.callEvent("onBeforeDynParse", [e, r, i]) && (this.dataParser[i].call(this, e, r), this.callEvent("onAfterDynParse", [e, r, i]))
                }, this),
                error: webix.bind(function() {
                    this.hideProgress(), this.callEvent("onDynLoadError", [])
                }, this)
            };
            if (t.load) return t.load(null, n, {
                action: i,
                source: e.id
            })
        }
    },
    ex: function(t) {
        var e = this.$$(t),
            i = this;
        e.attachEvent("onAfterSelect", function(t) {
            i.callEvent("onItemSelect", [t])
        }), this.data.attachEvent("onIdChange", function(t, i) {
            e.data.pull[t] && e.data.changeId(t, i)
        }), this.$$(t).data.qf = webix.bind(function(t) {
            var e = this.getItem(t.id);
            e && e.$count && (t.type = "folder")
        }, this), this.$$(t).type.icons = this.config.icons, this.$$(t).type.templateIcon = this.config.templateIcon, this.$$(t).type.templateName = this.config.templateName, this.$$(t).type.templateSize = this.config.templateSize, this.$$(t).type.templateDate = this.config.templateDate, this.$$(t).type.templateType = this.config.templateType, this.$$(t).attachEvent("onItemDblClick", webix.bind(this.yx, this)), this.data.attachEvent("onClearAll", webix.bind(function() {
            this.clearAll()
        }, this.$$(t))), this.$$(t).bind(this, "$data", webix.bind(function(e, i) {
            if (!e) return this.$$(t).clearAll();
            if (!this.$searchResults) {
                if (!this.$skipDynLoading) {
                    var s;
                    for (var n in this.dataParser) !s && e["webix_" + n] && (s = this.config.handlers[n], s && this.loadDynData(s, e, n))
                }
                this.eC(this.$$(t), i, e)
            }
        }, this)), this.$$(t).attachEvent("onFocus", function() {
            if (!this.getSelectedId()) {
                var t = this.getFirstId();
                t && this.select(t)
            }
            i.dx = this, webix.html.removeCss(this.$view, "webix_blur")
        }), this.$$(t).attachEvent("onBlur", function() {
            i.getMenu() && i.getMenu().isVisible() || webix.html.addCss(this.$view, "webix_blur")
        });
        var s = this.getMenu();
        s && !this.config.readonly && (this.$$(t).on_context.webix_view = function(t, e) {
            var e = this.locate(t.target || t.srcElement);
            e || (s.nh = {
                obj: webix.$$(t)
            }, s.show(t), webix.html.preventEvent(t))
        }, s.attachTo(this.$$(t)), this.$$(t).attachEvent("onBeforeMenuShow", function() {
            var t = s.getContext();
            if (s.filter(function(e) {
                    var s = !0;
                    return t.id || "item" != e.batch || (s = !1), i.config.menuFilter && (s = s && i.config.menuFilter(e)), s
                }), s.count() && t.id) {
                webix.UIManager.setFocus(this);
                var e = this.getSelectedId(),
                    n = !1;
                if (webix.isArray(e))
                    for (var r = 0; !n && r < e.length; r++) "" + e[r] == "" + t.id && (n = !0);
                n || this.select(t.id)
            }
            return s.count() > 0
        })), this.$$(t).attachEvent("onAfterMenuShow", function(t) {
            if (t) {
                for (var e = this.getSelectedId(!0), i = !1, s = 0; s < e.length && !i; s++) e[s].toString() == t.toString() && (i = !0);
                i || this.select(t.toString()), webix.UIManager.setFocus(this)
            } else this.unselect()
        }), this.$$(t).attachEvent("onBeforeEditStop", function(t, e) {
            return this.getTopParentView().callEvent("onBeforeEditStop", [e.id || e.row, t, e, this])
        }), this.$$(t).attachEvent("onAfterEditStop", function(t, e) {
            var i = this.getTopParentView();
            i.callEvent("onAfterEditStop", [e.id || e.row, t, e, this]) && (e.column && "value" != e.column ? e.column && (i.getItem(e.id || e.row)[e.column] = t.value) : i.renameFile(e.id || e.row, t.value))
        }), this.$$(t).attachEvent("onBeforeDrop", function(t) {
            var e = this.getTopParentView();
            return e.callEvent("onBeforeDrop", [t]) && t.from && e.moveFile(t.source, t.target), !1
        }), this.$$(t).attachEvent("onBeforeDrag", function(t, e) {
            var i = this.getTopParentView();
            return !i.config.readonly && i.callEvent("onBeforeDrag", [t, e])
        }), this.$$(t).attachEvent("onBeforeDragIn", function(t, e) {
            var i = this.getTopParentView();
            return !i.config.readonly && i.callEvent("onBeforeDragIn", [t, e])
        }), this.Bt("enter", webix.bind(function(t) {
            for (var e = t.getSelectedId(!0), i = 0; i < e.length; i++) this.yx(e[i]);
            if (webix.UIManager.setFocus(t), e = t.getSelectedId(!0), !e.length) {
                var s = t.getFirstId();
                s && t.select(s)
            }
        }, this), this.$$(t)), this.config.readonly && (this.$$(t).define("drag", !1), this.$$(t).define("editable", !1))
    },
    Rw: function() {
        var t = this.config.defaultSelection;
        return t ? t.call(this) : this.getFirstChildId(0)
    },
    qx: function(t, e) {
        var i = t.config || t;
        return "function" == typeof i ? i.call(this, e) : webix.copy(i)
    },
    Pw: function(t) {
        var e, i, s = t.structure;
        if (s)
            for (i in s) s.hasOwnProperty(i) && (e = webix.copy(s[i]), this.structure[i] && this.structure[i].config ? this.structure[i].config = e.config || e : this.structure[i] = e.config || e)
    },
    defaults: {
        modes: ["files", "table"],
        mode: "table",
        handlers: {},
        structure: {},
        fsIds: !0,
        templateName: webix.template("#value#"),
        templateSize: function(t) {
            for (var e = t.size, i = webix.i18n.filemanager.sizeLabels, s = 0; e / 1024 > 1;) e /= 1024, s++;
            var n = parseInt(e, 10) == e,
                r = webix.Number.numToStr({
                    decimalDelimiter: webix.i18n.decimalDelimiter,
                    groupDelimiter: webix.i18n.groupDelimiter,
                    decimalSize: n ? 0 : webix.i18n.groupSize
                });
            return r(e) + "" + i[s]
        },
        templateType: function(t) {
            var e = webix.i18n.filemanager.types;
            return e && e[t.type] ? e[t.type] : t.type
        },
        templateDate: function(t) {
            var e = t.date;
            return "object" != typeof e && (e = new Date(1e3 * parseInt(t.date, 10))), webix.i18n.fullDateFormatStr(e)
        },
        templateCreate: function() {
            return {
                value: "newFolder",
                type: "folder",
                date: new Date
            }
        },
        templateIcon: function(t, e) {
            return "<span class='webix_icon webix_fmanager_icon fa-" + (e.icons[t.type] || e.icons.file) + "'></span>"
        },
        uploadProgress: {
            type: "top",
            delay: 3e3,
            hide: !0
        },
        idChange: !0,
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
}, webix.FileManagerUpload, webix.FileManagerStructure, webix.ProgressBar, webix.IdSpace, webix.ui.layout, webix.TreeDataMove, webix.TreeDataLoader, webix.DataLoader, webix.EventSystem, webix.Settings);

//# sourceMappingURL=./filemanager.js.map