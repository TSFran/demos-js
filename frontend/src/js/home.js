_.templateSettings = {
    evaluate: /\{\{([\s\S]+?)\}\}/g,
    interpolate: /\{\{=([\s\S]+?)\}\}/g
};

yOSON.AppCore.addModule('adder', function (Sb) {
    var st = {
        formRegister: '#myForm',
        data: '.group_data',
        name: '#name',
        id: '#id',
        description: '#description',
        urlPicture: 'https://4aae76bac0e998c0806f-425f2f9f94637db78b7b534fb5acbdb3.ssl.cf1.rackcdn.com/2T3WFREV2JW437576/c2fb56d8e8302576fd4ac7741a6baf77.jpg',
        btnRegisterNewData: '#btnRegister'
    }

    var dom = {}

    var catchDom = () => {
        dom.data = $(st.data)
        dom.name = $(st.name, dom.data)
        dom.id = $(st.id, dom.data)
        dom.description = $(st.description, dom.data)
        dom.btnRegisterNewData = $(st.btnRegisterNewData, st.formRegister)
    }

    var suscribeEvents = () => {
        dom.btnRegisterNewData.on('click', events.clickRegisterNewData)
    }

    var events = {
        clickRegisterNewData() {
            var brandsReceived = {}
            fn.addData(brandsReceived)
        }
    }

    var fn = {
        addData(brandsReceived) {
            var elements = fn.searchInputElement()
            var brandsCollected = fn.getData(elements, brandsReceived)
            var newBrands = fn.setData(brandsCollected)
            fn.cleanData(brandsCollected)
        },

        searchInputElement() {
            return dom.data.find(':input')
        },

        getData(elements, brandsReceived) {
            elements.each(function (i, input) {
                brandsReceived['name'] = dom.name.val()
                brandsReceived['id'] = Date.now()
                brandsReceived['description'] = dom.description.val()
                brandsReceived['picture'] = st.urlPicture
            })

            return {
                brandsReceived: brandsReceived
            }
        },

        setData(brandsCollected) {
            Sb.trigger('Storage:create', "dataBrands", brandsCollected.brandsReceived)
            Sb.trigger('Render:renderBrandsStored')
        },

        cleanData(brandsCollected) {
            brandsCollected = {}
        }
    }

    var initialize = () => {
        catchDom()
        suscribeEvents()
    }

    return {
        init: initialize
    }
})

yOSON.AppCore.addModule('filter', function (Sb) {
    var st = {
        searchContainer: '#mySearch',
        searchBox: '#txtSearch',
        itemBox: '#txtResult',
        brands: []
    }

    var dom = {}

    var catchDom = () => {
        dom.searchBox = $(st.searchBox, st.searchContainer)
        dom.itemBox = $(st.itemBox, st.searchContainer)
    }

    var suscribeEvents = () => {
        dom.searchBox.on('keyup', events.keyupFilterBrandsByWords)
    }

    var events = {
        keyupFilterBrandsByWords(e) {
            var ele = $(e.target)
            fn.loadBrandsByWords(ele)
        }
    }

    var fn = {
        getBrands(callback) {
            callback(st.brands)
        },

        loadBrandsByWords(ele) {
            var q = ele.val()
            Sb.trigger('Storage:read', "dataBrands", function (data) {
                fn.showLoadOnRequest()
                fn.getRelatedBrands(data, q)
                st.brands = data
            })
        },

        showLoadOnRequest() {
            dom.searchBox.addClass("input_loading")
        },

        getRelatedBrands(data, q) {
            fn.filterBrands(data, q)
            fn.showBrandsFound()
            fn.hideLoadOnRequest()
            fn.isEmpty()
        },

        filterBrands(data, q) {
            var words = []
            var wordsFound = []
            words = fn.filterByWords(data, q)
            wordsFound = fn.getWords(words)
            fn.renderWords(wordsFound)
        },

        filterByWords(data, q) {
            var filterWords = data.filter(brands => brands.name.toLowerCase().includes(q))
            
            return filterWords
        },

        getWords(words) {
            var name = words.map(brands => brands.name)
            var id = words.map(brands => brands.id)

            return {
                name: name,
                id: id
            }
        },

        renderWords(wordsFound) {
            let html = _.template($("#tpl").html(),
                {
                    name: wordsFound.name,
                    id: wordsFound.id
                })
            dom.itemBox.html(html)
        },

        showBrandsFound() {
            dom.itemBox.slideDown("slow", function () {
                Sb.trigger('Render:catchDomAsync')
            })
        },

        hideLoadOnRequest() {
            dom.searchBox.removeClass("input_loading")
        },

        isEmpty() {
            if (dom.searchBox.val() === "") {
                dom.itemBox.empty()
                fn.hideBrandsNotFound()
            }
        },

        hideBrandsNotFound() {
            dom.itemBox.slideUp("slow")
        }
    }

    var initialize = () => {
        catchDom()
        suscribeEvents()
        Sb.events(['Filter:getBrands'], fn.getBrands, this)
    }

    return {
        init: initialize
    }
})

yOSON.AppCore.addModule('render', function(Sb) {
    var st = {
        btnDelete: '.btn_delete',
        itemBox: '#txtResult',
        selectItem: '.list',
        resultTableByItem: '#myInfo',
        brands: [],
        tableStorage: '.storage_info'
    }

    var dom = {}

    var catchDom = () => {
        dom.btnDelete = $(st.btnDelete)
        dom.selectItem = $(st.selectItem, st.itemBox)
        dom.resultTableByItem = $(st.resultTableByItem)
        dom.itemBox = $(st.itemBox)
    }

    var suscribeEvents = () => {
        dom.btnDelete.on('click', events.clickEraseStorageData)
        dom.selectItem.on('click', events.clickShowBrandsInfoFound)
    }

    var events = {
        clickEraseStorageData(e) {
            var ele = $(e.target)
            var id = ele.data("id")
            Sb.trigger('Storage:erase', "dataBrands", id)
            fn.renderBrandsStored()
        },

        clickShowBrandsInfoFound(e) {
            Sb.trigger('Filter:getBrands', function (brands) {
                st.brands = brands
            })
            var ele = $(e.target)
            var id = ele.data("id")
            fn.filterBrandsById(id)
            fn.hideBrandsNotFound()
        }
    }

    var fn = {
        renderBrandsStored() {
            var data = JSON.parse(localStorage.getItem("dataBrands"))
            let htmlTable = _.template($("#table").html(),
                {
                    data: data
                })
            $(st.tableStorage).html(htmlTable)
            fn.catchDomAsync()
            Sb.trigger('Modal:view')
        },

        catchDomAsync(){
            catchDom()
            suscribeEvents()
        },

        filterBrandsById(id) {
            var brands = st.brands
            var filteredBrands = brands.filter(brands => brands.id == id)
            fn.renderBrandsFound(filteredBrands)
        },

        renderBrandsFound(filteredBrands) {
            let html = _.template($('#data').html(),
                {
                    name: filteredBrands[0].name,
                    id: filteredBrands[0].id,
                    descripcion: filteredBrands[0].description,
                    picture: filteredBrands[0].picture
                })
            dom.resultTableByItem.html(html)
        },

        hideBrandsNotFound() {
            dom.itemBox.slideUp("slow")
        }
    }

    var initialize = () => {
        fn.renderBrandsStored()
        Sb.events(['Render:catchDomAsync'], fn.catchDomAsync, this)
        Sb.events(['Render:renderBrandsStored'], fn.renderBrandsStored, this)
    }

    return {
        init : initialize
    }
})

yOSON.AppCore.addModule('storage', function (Sb) {
    var data = []

    var fn = {
        readStorage(name, callback) {
            var _data = JSON.parse(localStorage.getItem(name))
            callback(_data)
        },

        createStorage(name, data) {
            var _data = JSON.parse(localStorage.getItem(name)) || []
            _data.push(data)
            localStorage.setItem(name, JSON.stringify(_data))
        },

        eraseStorage(name, id) {
            var data = JSON.parse(localStorage.getItem(name))
            for (var i = 0; i < data.length; i++) {
                if (data[i].id === id) {
                    data.splice(i, 1)
                }
            }
            localStorage.setItem(name, JSON.stringify(data))
        }
    }

    var initialize = () => {
        Sb.events(['Storage:read'], fn.readStorage, this)
        Sb.events(['Storage:create'], fn.createStorage, this)
        Sb.events(['Storage:erase'], fn.eraseStorage, this)
    }

    return {
        init: initialize
    }
})

yOSON.AppCore.addModule('viewModal', function(Sb){
    var st = {
        btnViewModal: '.btn_view',
        btnClose: '.close',
        brandDescription : '#brandDescription'
    }

    var dom = {}
    
    var catchDom = () => {
        dom.btnViewModal = $(st.btnViewModal)
        dom.btnClose = $(st.btnClose)
        dom.brandDescription = $(st.brandDescription)
    }
    
    var suscribeEvents = () => {
        dom.btnViewModal.on('click', events.clickViewDescriptionModal)
        dom.btnClose.on('click', events.clickHideDescriptionModal)
    }

    var events = {
        clickViewDescriptionModal(e) {
            var ele = $(e.target)
            var id = ele.data('id')
            Sb.trigger('Storage:read', "dataBrands", function(data) {
                var descriptionFound = fn.searchDescriptionById(data, id)
                fn.renderDescriptionModal(descriptionFound) 
            })
            $('.modal').css('display','flex')
        },

        clickHideDescriptionModal() {
            $('.modal').css('display', 'none')
        }
    }

    var fn = {
        aync() {
            catchDom()
            suscribeEvents()
        },

        searchDescriptionById(data, id) {
            var dataFind = data.find(data => data.id == id)
            return dataFind
        },

        renderDescriptionModal(descriptionFound) {
            let htmlModal = _.template($("#modal").html(),
                {
                    data: descriptionFound
                })
            dom.brandDescription.html(htmlModal)
        }
    }

    var initialize = () => {
        catchDom()
        suscribeEvents()
        Sb.events(['Modal:view'], fn.aync, this)
    }

    return {
        init : initialize
    }
})


yOSON.AppCore.runModule('adder')
yOSON.AppCore.runModule('filter')
yOSON.AppCore.runModule('render')
yOSON.AppCore.runModule('storage')
yOSON.AppCore.runModule('viewModal')

