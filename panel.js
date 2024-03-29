// This one acts in the context of the panel in the Dev Tools
//
// Can use
// chrome.devtools.*
// chrome.extension.*

var isFold = new Boolean();
if (localStorage.getItem('isFold')) {
    isFold = localStorage.getItem('isFold') === 'true'
} else {
    isFold = true;
    localStorage.setItem('isFold', isFold);
}
var lastEventId = 0;
var events = {};
var status = "";

window.onload = function () {
    document.querySelector('.clear').addEventListener('click', clearEvents);
    document.querySelector('.view').addEventListener('click', toggleFold);
    document.querySelector('.search').addEventListener('keyup', filter);
    changeViewType()
}

chrome.tabs.onUpdated.addListener((id, info) => {
    if (info.status) {
        status = info.status
    }
    if (status == "loading") {
        document.querySelector(".loading").classList.remove("hide");
        document.querySelector(".event-length").classList.add("hide");
    } else {
        document.querySelector(".loading").classList.add("hide");
        document.querySelector(".event-length").classList.remove("hide");
    }
})

chrome.devtools.network.onRequestFinished.addListener(
    function (d) {
        if (d.request.url == 'https://api.amplitude.com/') {
            if (d.request.method == 'POST' && d.request.postData) {
                const data = JSON.parse(decodeURIComponent(d.request.postData.params.filter(i => i.name == 'e')[0].value))
                data.filter(i => i.event_type != '$identify').forEach(event => {
                    if (event.event_id > lastEventId) {
                        events[event.event_id] = event.event_properties;
                        drawEvent(
                            event.event_type,
                            event.event_properties,
                            event.event_id
                        )
                        lastEventId = event.event_id
                        changeEventsLength()
                    }
                })
            }
        } else if (d.request.url.indexOf('moyoplan.com/log') > -1) {
            const data = JSON.parse(d.request.postData.text)
            const eventId = Date.now()
            events[eventId] = data;
            drawEvent(
                "UBL_" + data.category + "_" + data.navigation,
                data,
                eventId,
                'ubl'
            )
            changeEventsLength()
        }
    }
);

var drawEvent = function (title, props, eventId, className) {
    var searchValue = document.querySelector('.search').value.toLowerCase();
    var EventsElem = document.querySelector('.events');

    var EventElem = document.createElement("div");
    EventElem.classList.add("event");
    className && EventElem.classList.add(className);
    EventElem.addEventListener("click", openProps)
    EventElem.setAttribute('event_id', eventId)
    if (title.toLowerCase().indexOf(searchValue) != -1) {
        EventElem.classList.remove("hide");
    } else {
        EventElem.classList.add("hide");
    }

    var TitleElem = document.createElement("p");
    TitleElem.classList.add("title");
    TitleElem.innerText = title;

    var PropsElem = document.createElement("div");
    PropsElem.classList.add("in-props");
    if (isFold) {
        PropsElem.classList.add("hide");
    }

    drawProps(PropsElem, props);

    EventElem.append(TitleElem);
    EventElem.append(PropsElem);
    EventsElem.prepend(EventElem);
}

var openProps = function (e) {
    var Elem = e.currentTarget;
    var id = Elem.getAttribute("event_id");
    clearProps()

    Elem.classList.add("selected");
    var PropsElem = document.querySelector('.props');
    drawProps(PropsElem, events[id]);
}

var drawProps = function (parentsElem, obj) {
    Object.keys(obj).forEach(key => {
        var PropElem = document.createElement("div");
        PropElem.classList.add("prop");

        var KeyElem = document.createElement("p");
        KeyElem.classList.add("key");
        KeyElem.innerText = key;
        PropElem.append(KeyElem);

        var ColonElem = document.createElement("p");
        ColonElem.classList.add("colon");
        ColonElem.innerText = ":";
        PropElem.append(ColonElem);

        var NullElem = document.createElement("p");
        NullElem.classList.add("null");
        NullElem.innerText = "null";

        var ValueElem = document.createElement("p");
        if (typeof obj[key] === 'object' && obj[key] != null) {
            var ObjElem = document.createElement("div");
            ObjElem.classList.add("obj");
            drawProps(ObjElem, obj[key]);
            ValueElem.append("{");
            PropElem.append(ValueElem);

            parentsElem.append(PropElem);
            parentsElem.append(ObjElem);
            parentsElem.append("}");
        } else {
            ValueElem.classList.add("value");
            ValueElem.innerText = obj[key];
            if (obj[key]) {
                PropElem.append(ValueElem);
            } else {
                PropElem.append(NullElem);
            }
            parentsElem.append(PropElem);
        }
    });
}

var clearProps = function () {
    var PropsElem = document.querySelector('.props');
    PropsElem.innerText = ''
    if (document.querySelector(".selected")) {
        document.querySelector(".selected").classList.remove("selected");
    }
}
var clearEvents = function () {
    var EventsElem = document.querySelector('.events');
    EventsElem.innerText = ''
    clearProps()
    changeEventsLength()
}
var filter = function () {
    var searchValue = document.querySelector('.search').value.toLowerCase();
    var EventElem = document.querySelectorAll('.event');

    for (i = 0; i < EventElem.length; i++) {
        title = EventElem[i].getElementsByClassName("title");
        if (title[0].innerText.toLowerCase().indexOf(searchValue) != -1) {
            EventElem[i].classList.remove("hide");
        } else {
            EventElem[i].classList.add("hide");
        }
    }
    changeEventsLength()
    clearProps()
}
var changeEventsLength = function () {
    var CountElem = document.querySelector(".count");
    var EventElem = document.querySelectorAll('.event');
    var HideElem = document.querySelectorAll('.event.hide');
    if (HideElem.length == 0) {
        CountElem.innerText = EventElem.length;
    } else {
        CountElem.innerText = EventElem.length - HideElem.length + "/" + EventElem.length;
    }
}
var toggleFold = function () {
    localStorage.setItem('isFold', !isFold);
    isFold = !isFold;
    changeViewType()
}
var changeViewType = function () {
    var Props = document.querySelectorAll(".in-props");
    clearProps()
    if (isFold) {
        document.querySelector(".view").innerText = "expand";
        document.querySelector(".props").classList.remove("hide");
        document.querySelector(".events").classList.remove("wide");
        for (var i = 0; i < Props.length; i++) {
            Props[i].classList.add("hide")
        }
    } else {
        document.querySelector(".view").innerText = "fold";
        document.querySelector(".props").classList.add("hide");
        document.querySelector(".events").classList.add("wide");
        for (var i = 0; i < Props.length; i++) {
            Props[i].classList.remove("hide")
        }
    }
}