// This one acts in the context of the panel in the Dev Tools
//
// Can use
// chrome.devtools.*
// chrome.extension.*

window.onload = function () {
    document.querySelector('.clear').addEventListener('click', clearEvents);
    document.querySelector('.search').addEventListener('keyup', filter);
}

var lastEventId = 0;

chrome.devtools.network.onRequestFinished.addListener(
    function(d) {
        if(d.request.url == 'https://api.amplitude.com/'){
            if(d.request.method == 'POST' && d.request.postData){
                const data = JSON.parse(decodeURIComponent(d.request.postData.params.filter(i=>i.name == 'e')[0].value))
                data.filter(i => i.event_type != '$identify').forEach(event => {
                    if(event.event_id > lastEventId){
                        drawEvent(event)
                        lastEventId = event.event_id
                        changeEventsLength()
                    }
                })
            }
        }
    }
);

var drawEvent = function(data){
    var searchValue = document.querySelector('.search').value.toLowerCase();
    var EventsElem = document.querySelector('.events');

    var EventElem = document.createElement("div");
	EventElem.classList.add("event");
    if(data.event_type.toLowerCase().indexOf(searchValue) != -1){
        EventElem.style.display = "flex";
    }else{
        EventElem.style.display = "none";
    }

    var TitleElem = document.createElement("p");
	TitleElem.classList.add("title");
    TitleElem.innerText = data.event_type;
    EventElem.append(TitleElem);

    var PropsElem = document.createElement("div");
	PropsElem.classList.add("props");
    EventElem.append(PropsElem);

    Object.keys(data.event_properties).forEach( key => {
        var PropElem = document.createElement("div");
        PropElem.classList.add("prop");
        
        var KeyElem = document.createElement("p");
        KeyElem.classList.add("key");
        KeyElem.innerText = key;
        PropElem.append(KeyElem);
    
        var ColonElem = document.createElement("p");
        ColonElem.innerText = ":";
        PropElem.append(ColonElem);
    
        var ValueElem = document.createElement("p");
        ValueElem.classList.add("value");
        ValueElem.innerText = data.event_properties[key];
        PropElem.append(ValueElem);

        PropsElem.append(PropElem);
    });

    EventsElem.prepend(EventElem);
}

var clearEvents = function(){
    var EventsElem = document.querySelector('.events');
    EventsElem.innerText = ''
}
var filter = function(){
    var searchValue = document.querySelector('.search').value.toLowerCase();
    var eventElem = document.querySelectorAll('.event');

    for(i = 0; i < eventElem.length; i++){
        title = eventElem[i].getElementsByClassName("title");
        if(title[0].innerText.toLowerCase().indexOf(searchValue) != -1){
            eventElem[i].style.display = "flex";
        }else{
            eventElem[i].style.display = "none";
        }
    }
    changeEventsLength()
}
var changeEventsLength = function(){
    var countElem = document.querySelector(".count");
    var eventElem = document.querySelectorAll('.event');
    var hideElem = document.querySelectorAll('.event[style="display: none;"]');
    if(hideElem.length == 0){
        countElem.innerHTML = eventElem.length;
    }else{
        countElem.innerHTML = eventElem.length - hideElem.length + "/" + eventElem.length;
    }
}