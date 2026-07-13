var maptype = 'acmap_s';
var timespan = 0;
var dummycounter = 0;
var basetime = defaultbasetime = getBasetimeFromHash();
var timeoffset = 0;
var step = 2;
var initial_js_time = (new Date()).getTime();
var initial_last_updates;
var periodicCheckbox;
var timeDelay = 0;

function OnLoad() {
    periodicCheckbox = $('#periodic');
    $('#slider').slider({ min: -3600, max: 0, step: 20, slide: onSlide, change: update });
    if (defaultbasetime > 0) {
        periodicCheckbox.removeAttr('checked');
    }
    update();
    setInterval(periodicUpdate, step * 1000);
    document.onkeydown = onKeyDown;
}

function doubleDigitStr(n) {
    return (n < 10 ? '0' + n : String(n));
}

function parseDate(str) {
    var m = String(str).match(/^#?(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})?(\d{2})?$/)
    if (m) {
        return new Date(m[1], parseInt(m[2], 10) - 1, m[3], m[4], m[5] || 0, m[6] || 0);
    }
    return;
}

function getBasetimeFromHash() {
    var hash = document.location.hash;
    if (hash) {
        var d = parseDate(hash);
        return (d ? d.getTime() : 0);
    }
    return 0;
}

function ymdhms(date) {
    var str = ''
    str += String(date.getFullYear());
    str += doubleDigitStr(date.getMonth() + 1);
    str += doubleDigitStr(date.getDate());
    str += doubleDigitStr(date.getHours());
    str += doubleDigitStr(date.getMinutes());
    str += doubleDigitStr(date.getSeconds() - date.getSeconds() % step);
    return str;
}

function onSlide(event, ui) {
    timeoffset = ui.value;
    onSliderChange()
}

function onSliderChange() {
    if (timeoffset < 0) {
        if (basetime == defaultbasetime) {
            if (basetime == 0) {
                basetime = new Date().getTime();
            }
        }
        $('#time').text(Math.floor(-timeoffset / 60) + '分' + (-timeoffset) % 60 + '秒前');
    } else {
        basetime = defaultbasetime;
        $('#time').text('最新');
    }
    $('.ui-slider-handle').unbind('keydown');
}

function onKeyDown(e) {
    if (e != null) {
        keycode = e.which;
    } else {
        // for IE
        keycode = event.keyCode
    }
    if (keycode == 37 && timeoffset > -3600) {
        timeoffset -= step;
        $('#slider').slider('option', 'value', timeoffset);
        onSliderChange();
        update();
    } else if (keycode == 39 && timeoffset < 0) {
        timeoffset += step;
        $('#slider').slider('option', 'value', timeoffset);
        onSliderChange();
        update();
    }
}

async function update() {
    var url = 'https://smi.lmoniexp.bosai.go.jp/data/map_img/RealTimeImg/' + maptype;
    basetime = new Date().getTime() + timeDelay - 2000;

    if (timeoffset == 0) {
        url += '/' + ymdhms(new Date(basetime)).substr(0, 8);
        url += '/' + ymdhms(new Date(basetime)) + '.' + maptype + ".gif";
    } else {
        url += '/' + ymdhms(new Date(basetime + timeoffset * 1000)).substr(0, 8);
        url += '/' + ymdhms(new Date(basetime + timeoffset * 1000)) + '.' + maptype + ".gif";
    }
    $('#map').attr('src', url);

}

function help() {
    window.open('http://www.kyoshin.bosai.go.jp/kyoshin/docs/kyoshinmonitor.html', null);
}

function reset() {
    timeoffset = 0;
    $('#slider').slider('option', 'value', timeoffset);
    $('#time').text('最新');
    periodicCheckbox.removeAttr('disabled');
    basetime = defaultbasetime;
    update();
}

function updateMaptype() {
    var kind = document.f.kind.value;
    maptype = kind + '_' + ($('#surface').attr('checked') ? 's' : 'b');
    $('#gauge').attr('src', './nied_' + kind + '_s_scale.png');
    update();
}

function periodicUpdate() {
    if (periodicCheckbox.attr('checked') && !periodicCheckbox.attr('disabled')) {
        update();
    }
}

$("#reload-btn").on('click', function() { 
    reset(); 
});
$("#kind").on('change', function() { 
    updateMaptype(); 
});
$("#surface").on('click', function() { 
    updateMaptype(); 
});
$("#borehole").on('click', function() { 
    updateMaptype();
});

OnLoad();
