(async () => {
    const eqm_backColor = { "1": "rgb(142, 142, 155)", "2": "rgb(0, 170, 255)", "3": "rgb(0, 65, 255)", "4": "rgb(250, 160, 110)", "5-": "rgb(255, 120, 0)", "5+": "rgb(230, 90, 0)", "6-": "rgb(255, 40, 0)", "6+": "rgb(165, 0, 33)", "7": "rgb(180, 0, 104)" };
    const map = L.map('map').setView([37.90, 136], 5);
    const eqlayer = L.layerGroup().addTo(map);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);
    async function jmaeqlog() {
        const e = document.getElementById('eqlog');
        e.innerHTML = "";
        const data = await fetch('https://www.jma.go.jp/bosai/quake/data/list.json', { cache: "no-store" });
        const r = await data.json();
        for (const d of r) {
            if (d.ttl == "震源・震度情報" || d.ttl == "震源に関する情報" || d.ttl == "震度速報") {
                let text = "";
                const mag = d.mag;
                const time = d.eid.substr(6, 2) + "日" + d.eid.substr(8, 2) + "時" + d.eid.substr(10, 2) + "分発生";
                text = time + " " + d.anm + " 最大震度" + ((d.maxi !== "") ? d.maxi.replace('-', '弱').replace('+', '強') : "不明") + " M" + ((mag !== "") ? mag : "不明") + "<br>";
                e.innerHTML += text;
                if (d.ttl == "震源・震度情報") {
                    const latitude = Number(d.cod.substr(1, 4));
                    const longitude = Number(d.cod.substr(6, 5));
                    L.circle([latitude, longitude], {
                        radius: 1000 + mag * 5000,
                        color: eqm_backColor[d.maxi],
                        fillColor: eqm_backColor[d.maxi],
                        fillOpacity: 0.5
                    }).addTo(eqlayer).bindPopup(text);
                }
            }
        }
    }
    async function usgseqlog() {
        const e = document.getElementById('usgslog');
        e.innerHTML = "";
        const data = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson', { cache: "no-store" });
        const r = await data.json();
        for (const d of r.features) {
            const span = document.createElement('span');
            const mag = (Math.round(d.properties.mag * 10)) / 10;
            const fontcolor = (mag > 6.9) ? "#f00" : (mag > 5.9) ? "#ff0" : "#fff";
            span.style.color = fontcolor;
            span.innerHTML = d.properties.title + "<br>";
            e.append(span);
            L.circle([d.geometry.coordinates[1], d.geometry.coordinates[0]], {
                radius: 1000 + mag * 5000,
                color: '#fff',
                fillColor: '#fff',
                fillOpacity: 0.5
            }).addTo(eqlayer).bindPopup(d.properties.title);
        }
    }
    setInterval(async function () {
        eqlayer.clearLayers();
        await jmaeqlog();
        await usgseqlog();
    }, 60000);
    eqlayer.clearLayers();
    await jmaeqlog();
    await usgseqlog();
})();