yOSON.AppCore.addModule('activeMenu', function (Sb) {
    var st = {
        menuItem: 'li a'
    }
    var dom = {}
    
    var catchDom = () => {
        dom.menuItem = $(st.menuItem)
    }

    var suscribeEvents = () => {
        dom.menuItem.on('click', events.clickActiveMenuItem)
    }

    var events = {
        clickActiveMenuItem(e) { 
            var ele = $(e.target)
            Sb.trigger('Storage:createIdMenu', "linkId", ele.parent().index())   
        }
    }
    
    var fn = {
        getIdMenu() {
            Sb.trigger('Storage:readIdMenu', "linkId", fn.addClassMenuById)
        },

        addClassMenuById(dataId) {
            $('.menus a').removeClass('active')
            $('.menus li a:eq(' + dataId + ')').addClass('active')
        }
    }

    var initialize = () => {
        catchDom()
        suscribeEvents()
        fn.getIdMenu()
    }

    return {
        init : initialize
    }
})

yOSON.AppCore.addModule('storageMenu', function (Sb) {
    var fn = {
        readStorage(name, callback) {
            var data = localStorage.getItem(name)
            callback(data)
        },

        createStorage(name, data) {
            localStorage.setItem(name, data)
        }
    }

    var initialize = () => {
        Sb.events(['Storage:readIdMenu'], fn.readStorage, this)
        Sb.events(['Storage:createIdMenu'], fn.createStorage, this)
    }

    return {
        init: initialize
    }
})


yOSON.AppCore.runModule('storageMenu')
yOSON.AppCore.runModule('activeMenu')