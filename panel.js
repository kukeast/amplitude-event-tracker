// This one acts in the context of the panel in the Dev Tools
//
// Can use
// chrome.devtools.*
// chrome.extension.*

window.onload = function () {
    document.querySelector('.clear').addEventListener('click', clearEvents);
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
                    }
                })
            }
        }
    }
);

var drawEvent = function(data){
    var EventsElem = document.querySelector('.events');

    var EventElem = document.createElement("div");
	EventElem.classList.add("event");

    var TitleElem = document.createElement("p");
	TitleElem.classList.add("title");
    TitleElem.innerHTML = data.event_type;
    EventElem.append(TitleElem);

    var PropsElem = document.createElement("div");
	PropsElem.classList.add("props");
    EventElem.append(PropsElem);

    Object.keys(data.event_properties).forEach( key => {
        var PropElem = document.createElement("div");
        PropElem.classList.add("prop");
        
        var KeyElem = document.createElement("p");
        KeyElem.classList.add("key");
        KeyElem.innerHTML = key;
        PropElem.append(KeyElem);
    
        var ColonElem = document.createElement("p");
        ColonElem.innerHTML = ":";
        PropElem.append(ColonElem);
    
        var ValueElem = document.createElement("p");
        ValueElem.classList.add("value");
        ValueElem.innerHTML = data.event_properties[key];
        PropElem.append(ValueElem);

        PropsElem.append(PropElem);
    });

    EventsElem.prepend(EventElem);
}

var clearEvents = function(){
    var EventsElem = document.querySelector('.events');
    EventsElem.innerHTML = ''
}