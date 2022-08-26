var isNotTestCookies = [
    '_moyo_user_id',
    '_moyo_device_uuid',
    '_moyo_amp_device_id',
    '_moyo_user_trace',
    '_moyo_planFinder_request_params',
    '_moyo_planFinder_search_params',
    '_moyo_planFinder_ongoing_question',
    '_moyo_planFinder_show_result',
    '_moyo_planFinder_search_params_v2',
    '_moyo_planFinder_guide_shown',
    '_moyo_planFinder_survey_clicked',
    '_moyo_planFinder_research_record',
    '_moyo_planFinder_category_login_view',
    '_moyo_wishlist_tooltip_clicked',
    '_moyo_wishlist_plan_ids',
    '_moyo_client_ip',
    '_moyo_track_user_click_assign',
    '_moyo_internet_request_params',
    '_moyo_internet_popup_shown',
    '_moyo_plan_search_auto_save',
    '_moyo_plan_detail_guide_toggle',
    '_moyo_referral_event_code',
    '_moyo_referral_event_try_copy_link',
    '_moyo_has_pre_order_iphone14',
    '_moyo_has_pre_order_z4'
]
var url
var domain
window.onload = function () {
    document.querySelector('.clear').addEventListener('click', clearEvents);
}
chrome.identity.getProfileUserInfo(info => {
    if(info.email.includes('@moyoplan.com')){
        chrome.tabs.query({ active: true, currentWindow: true }, (tab) => {
            url = tab[0].url;
            domain = new URL(url).hostname;
            getCookies();
        });
    }
});

const getCookies = function(){
    chrome.cookies.getAll(
        { domain: domain },
        (cookie) => {
            drawCookies(
                cookie.filter(c => 
                    c.name.includes('_moyo_') && 
                    !isNotTestCookies.includes(c.name)
                )
            )
        }
    )
}

const drawCookies = function (cookies) {
    cookies.forEach(cookie => {
        var ContainerElem = document.querySelector('.container');

        var RowElem = document.createElement("div");
        RowElem.classList.add("row");

        var NameElem = document.createElement("p");
        NameElem.classList.add("name");
        NameElem.innerText = cookie.name;

        if(cookie.value == 'true' || cookie.value == 'false' ){
            var ValueElem = document.createElement("div");
            ValueElem.addEventListener("click", changeValue);
            ValueElem.setAttribute('type', 'boolean');
            ValueElem.innerText = cookie.value;
        }else{
            var ValueElem = document.createElement("input");
            ValueElem.addEventListener("blur", changeValue);
            ValueElem.setAttribute('type', 'text');
            ValueElem.defaultValue = cookie.value;
        }
        ValueElem.setAttribute('name', cookie.name);
        ValueElem.classList.add("value");

        RowElem.append(NameElem);
        RowElem.append(ValueElem);
        ContainerElem.prepend(RowElem);
    });
}

const changeValue = function(e){
    const elem = e.target;
    const type = elem.getAttribute('type');
    if(type == 'boolean'){
        const value = JSON.parse(elem.innerText);
        elem.innerText = !value;
        chrome.cookies.set({
            url: url, 
            name: elem.getAttribute('name'),
            value: (!value).toString()
        })
    }else if(type == 'text'){
        chrome.cookies.set({
            url: url, 
            name: elem.getAttribute('name'),
            value: elem.value
        })
    }
    chrome.tabs.reload()
}

var clearEvents = function () {
    var EventsElem = document.querySelectorAll('.name');
    EventsElem.forEach(el => {
        chrome.cookies.remove({
            url: url, 
            name: el.innerText
        })
    })
    chrome.tabs.reload(() => {
        document.querySelector('.container').innerText = ''
        getCookies();
    });
}