// This one acts in the context of the panel in the Dev Tools
//
// Can use
// chrome.devtools.*
// chrome.extension.*

var isFold = new Boolean();
if(localStorage.getItem('isFold')){
    isFold = localStorage.getItem('isFold') === 'true'
}else{
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

chrome.tabs.onUpdated.addListener( (id, info) => {
    if(info.status){
        status = info.status
    }
    if(status == "loading"){
        document.querySelector(".loading").classList.remove("hide");
        document.querySelector(".event-length").classList.add("hide");
    }else{
        document.querySelector(".loading").classList.add("hide");
        document.querySelector(".event-length").classList.remove("hide");
    }
})

chrome.devtools.network.onRequestFinished.addListener(
    function(d) {
        if(d.request.url == 'https://api.amplitude.com/'){
            if(d.request.method == 'POST' && d.request.postData){
                const data = JSON.parse(decodeURIComponent(d.request.postData.params.filter(i=>i.name == 'e')[0].value))
                data.filter(i => i.event_type != '$identify').forEach(event => {
                    if(event.event_id > lastEventId){
                        events[event.event_id] = event.event_properties;
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
    EventElem.addEventListener( "click", drawProps)
    EventElem.setAttribute('event_id', data.event_id)
    if(data.event_type.toLowerCase().indexOf(searchValue) != -1){
        EventElem.classList.remove("hide");
    }else{
        EventElem.classList.add("hide");
    }

    var TitleElem = document.createElement("p");
	TitleElem.classList.add("title");
    TitleElem.innerText = data.event_type;

    var PropsElem = document.createElement("div");
	PropsElem.classList.add("in-props");
    console.log(isFold)
    if(isFold){
        console.log(isFold)
        PropsElem.classList.add("hide");
    }
    
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

    EventElem.append(TitleElem);
    EventElem.append(PropsElem);
    EventsElem.prepend(EventElem);
}

var drawProps = function(e){
    var Elem = e.currentTarget;
    var id = Elem.getAttribute("event_id");
    clearProps()
    
    Elem.classList.add("selected");
    var PropsElem = document.querySelector('.props');
    Object.keys(events[id]).forEach( key => {
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
        ValueElem.innerText = events[id][key];
        PropElem.append(ValueElem);

        PropsElem.append(PropElem);
    });
}

var clearProps = function(){
    var PropsElem = document.querySelector('.props');
    PropsElem.innerText = ''
    if(document.querySelector(".selected")){
        document.querySelector(".selected").classList.remove("selected");
    }
}
var clearEvents = function(){
    var EventsElem = document.querySelector('.events');
    EventsElem.innerText = ''
    clearProps()
    changeEventsLength()
}
var filter = function(){
    var searchValue = document.querySelector('.search').value.toLowerCase();
    var EventElem = document.querySelectorAll('.event');

    for(i = 0; i < EventElem.length; i++){
        title = EventElem[i].getElementsByClassName("title");
        if(title[0].innerText.toLowerCase().indexOf(searchValue) != -1){
            EventElem[i].classList.remove("hide");
        }else{
            EventElem[i].classList.add("hide");
        }
    }
    changeEventsLength()
    clearProps()
}
var changeEventsLength = function(){
    var CountElem = document.querySelector(".count");
    var EventElem = document.querySelectorAll('.event');
    var HideElem = document.querySelectorAll('.event.hide');
    if(HideElem.length == 0){
        CountElem.innerHTML = EventElem.length;
    }else{
        CountElem.innerHTML = EventElem.length - HideElem.length + "/" + EventElem.length;
    }
}
var toggleFold = function(){
    localStorage.setItem('isFold', !isFold);
    isFold = !isFold;
    changeViewType()
}
var changeViewType = function(){
    var Props = document.querySelectorAll(".in-props");
    clearProps()
    if(isFold){
        document.querySelector(".view").innerText = "expand";
        document.querySelector(".props").classList.remove("hide");
        document.querySelector(".events").classList.remove("wide");
        for (var i = 0; i < Props.length; i++) {
            Props[i].classList.add("hide")
        }
    }else{
        document.querySelector(".view").innerText = "fold";
        document.querySelector(".props").classList.add("hide");
        document.querySelector(".events").classList.add("wide");
        for (var i = 0; i < Props.length; i++) {
            Props[i].classList.remove("hide")
        }
    }
}