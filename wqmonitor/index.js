let time, timeoffset = 0, map, eqlistnum = 0, iconlayer, weathertelop = "", telopsubstr = 1408;
const eqm_backColors = {
    "1": "rgb(70, 100, 110)",
    "2": "rgb(30, 110, 230)",
    "3": "rgb(0, 200, 200)",
    "4": "rgb(250, 250, 100)",
    "5-": "rgb(255, 180, 0)",
    "5+": "rgb(255, 120, 0)",
    "6-": "rgb(230, 0, 0)",
    "6+": "rgb(160, 0, 0)",
    "7": "rgb(150, 0, 150)",
    "fumei": "rgba(255, 255, 255, 0)"
},
    eqm_number = {
        "1": 0,
        "2": 1,
        "3": 2,
        "4": 3,
        "5-": 4,
        "5+": 5,
        "6-": 6,
        "6+": 7,
        "7": 8
    },
    iconcan = document.createElement("canvas"), iconctx = iconcan.getContext("2d"), eqlist = $("#eqlist"), shindoimages = {};
iconcan.width = 200, iconcan.height = 200;
for (const [num, backcolor] of Object.entries(eqm_backColors)) {
    iconctx.clearRect(0, 0, 200, 200);
    iconctx.fillStyle = backcolor;
    iconctx.strokeStyle = "#fff";
    iconctx.beginPath();
    iconctx.arc(100, 100, 98, 0, 2 * Math.PI);
    iconctx.fill();
    iconctx.lineWidth = 12;
    iconctx.stroke();
    shindoimages[num] = iconcan.toDataURL();
};
function syncntptime() {
    $.ajax({
        url: "https://api.wolfx.jp/ntp.json"
    })
        .done((r) => {
            timeoffset = r.timestamp - Date.now();
        })
}
function updateshindoimg() {
    const realtime = new Date(Date.now() + timeoffset - 1800);
    const year = realtime.getFullYear();
    const month = ('00' + (realtime.getMonth() + 1)).slice(-2);
    const date = ('00' + realtime.getDate()).slice(-2);
    const hour = ('00' + realtime.getHours()).slice(-2);
    const minute = ('00' + realtime.getMinutes()).slice(-2);
    const second = ('00' + realtime.getSeconds()).slice(-2);
    time = year + month + date + hour + minute + second;
    $("#shindoimg").attr("src", `http://www.kmoni.bosai.go.jp/data/map_img/RealTimeImg/jma_s/${time.substr(0, 8)}/${time}.jma_s.gif`);
}
function mapsetup() {
    map = L.map("eqmap").setView([38.40, 136], 5);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    iconlayer = L.layerGroup().addTo(map);
}
function updateeew() {
    $.ajax({ url: "https://api.wolfx.jp/jma_eew.json?" + Date.now() }).done((r) => {
        const title = r.Title, time = r.OriginTime, hypo = r.Hypocenter, maxi = r.MaxIntensity, mag = r.Magunitude, depth = r.Depth;
        $("#eewinfo").html(`${title}<br><br>発生時刻: ${time}<br><br>震源: ${hypo}<br><br>最大震度: ${maxi}<br><br>マグニチュード: ${mag}<br><br>深さ: ${depth}KM`);
    });
}
function updateeqinfo() {
    $.ajax({ url: "https://www.jma.go.jp/bosai/quake/data/list.json?" + Date.now() }).done((r) => {
        eqlistnum = 0;
        while (r[eqlistnum].ttl !== "震源・震度情報") {
            eqlistnum++;
        }
        eqlist.html("");
        r.forEach((eq, num) => {
            if (eq.ttl == "震源・震度情報") {
                const hypo = eq.anm, maxi = eq.maxi, mag = eq.mag, time = eq.at.substr(5).replace("T", " ").replace("+09:00", "");
                const $span = $("<span></span>", {
                    html: `<span style="font-weight: bold;">${hypo}</span><br>${time} M${mag} <span style='color: ${eqm_backColors[maxi]}'>最大震度${maxi}</span><hr>`,
                    class: "eqspan"
                });
                $span.on("click", function () {
                    drawshindoicon(r, num);
                });
                $span.css("cursor", "pointer");
                eqlist.append($span[0]);
            }
        });
        drawshindoicon(r, eqlistnum);
    })
}
function drawshindoicon(r, num) {
    $.ajax({ url: "https://www.jma.go.jp/bosai/quake/data/" + r[num].json }).done((r) => {
        iconlayer.clearLayers();
        r.Body.Intensity.Observation.Pref.forEach((pref, prefnum) => {
            pref.Area.forEach((area, areanum) => {
                area.City.forEach((city, citynum) => {
                    city.IntensityStation.forEach((int, intnum) => {
                        const marker = L.icon({
                            iconUrl: (int.Int.length > 2) ? shindoimages["fumei"] : shindoimages[int.Int],
                            iconSize: [16, 16],
                            iconAnchor: [8, 8],
                            shadowSize: [20, 20],
                            shadowAnchor: [10, 10]
                        });
                        L.marker([int.latlon.lat, int.latlon.lon], { icon: marker, zIndexOffset: (Number(int.Int.substr(0, 1)) * 10 + (int.Int.substr(1, 1) == "+") * 5) * 20 }).addTo(iconlayer).bindPopup(int.Name);
                        if (prefnum == 0 && areanum == 0 && citynum == 0 && intnum == 0) {
                            map.setView([int.latlon.lat, int.latlon.lon], 8);
                            const hypomarker = L.icon({
                                iconUrl: "images/hypo.gif",
                                iconSize: [32, 32],
                                iconAnchor: [16, 16]
                            });
                            L.marker([r.Body.Earthquake.Hypocenter.Area.Coordinate.substr(1, 4), r.Body.Earthquake.Hypocenter.Area.Coordinate.substr(6, 5)], { icon: hypomarker, zIndexOffset: 9999 }).addTo(iconlayer);
                        }
                    });
                });
            });
        });
    });
}
function updateweatherforecast() {
    $.ajax({ url: "https://www.jma.go.jp/bosai/forecast/data/forecast/010000.json" }).done((r) => {
        weathertelop = (r[0].srf.timeSeries[2].timeDefines[0].substr(5, 5).replace("-", "月")) + "日の天気:";
        r.forEach(e => {
            let name = e.srf.timeSeries[2].areas.area.name, mintemp = e.srf.timeSeries[2].areas.temps[0], maxtemp = e.srf.timeSeries[2].areas.temps[1];
            if (mintemp == maxtemp) mintemp = "--";
            weathertelop += name + " <span style='color: lightblue;'>" + mintemp + "</span>/<span style='color: #ffaaa7;'>" + maxtemp + "</span>" + "&nbsp;".repeat(10);
        });
        $("#weathertelop").html(weathertelop);
    });
}
updateweatherforecast();
syncntptime();
updateeqinfo();
updateeew("--", "--", "--", "--", "--");
setInterval(updateeqinfo, 1000 * 40);
setInterval(updateshindoimg, 1000);
setInterval(updateeew, 5000);
mapsetup();
$(window).on("load", function () {
    $("#mainwrapper").fadeOut(1000);
    $("ul#telop").liScroll({travelocity: 0.15});
});