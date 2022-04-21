// This one acts in the context of the panel in the Dev Tools
//
// Can use
// chrome.devtools.*
// chrome.extension.*

chrome.devtools.network.onRequestFinished.addListener(
    function(d) {
        if(d.request.url == 'https://api.amplitude.com/'){
            if(d.request.method == 'POST'){
                const data = JSON.parse(decodeURIComponent(d.request.postData.params.filter(i=>i.name == 'e')[0].value))[0]
                if(data.event_type != '$identify'){
                    drawEvent(data)
                }
            }
        }
    }
);

var drawEvent = function(data){
    var bodyElem = document.querySelector('body');

    var listElem = document.createElement("div");
	listElem.classList.add("list");

    var TitleElem = document.createElement("p");
	TitleElem.classList.add("title");
    TitleElem.innerHTML = data.event_type;
    listElem.append(TitleElem);

    var PropsElem = document.createElement("div");
	PropsElem.classList.add("props");
    listElem.append(PropsElem);

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

    bodyElem.prepend(listElem);
}