let globe;
let data = {};
let currentType = "commercial";

// gecisi saglayan butonlarin tetikledigi fx
function changeDestinations(type) {
    if (type != currentType) {
        currentType = type;
        globe.arcsData(data[type].arc);
        globe.htmlElementsData(data[type].label);
    }
}

// Dil degisikligini saglayan fonksiyon
function changeLanguage(ths) {
    lang = ths.value;
    globe.htmlElementsData(data[currentType].label);
}

// destiyonlarin yer aldigi json yukleniyor
fetch("/assets/json/destinations-map.json")
    .then((res) => res.json())
    .then((res) => {
        // noktalarin uzerine gelince cikan sehir isimleri
        let label = document.getElementById("globeLabel");
        label.style.cssText =
            "background:#00AEC7; color:#fff; transform:translate(calc(-100% - 5px), -50%); border-radius:4px; height:16px; z-index:300; position:fixed; font-family:sans-serif; font-size:11px; text-align:right; padding:2px 8px; display:flex; line-height:16px;";
        label.style["pointer-events"] = "none";

        // destinasyon bilgisini three-globe koduna uygun hale getiriyoruz
        let arr = res.destinations;
        for (var i = 0; i < res.destinations.length; ++i) {
            let arr = res.destinations[i].data;

            const color = res.destinations[i].color;

            const arcData = [...arr.keys()].map((i) => ({
                lat: arr[i].lat,
                lng: arr[i].lng,
                title: arr[i].title,
                size: 1,
                startLat: 41.276789,
                startLng: 28.730032,
                endLat: arr[i].lat,
                endLng: arr[i].lng,
                color: [color, color],
            }));

            const labelData = [...arr.keys()].map((i) => ({
                lat: arr[i].lat,
                lng: arr[i].lng,
                title: arr[i].title,
                size: 1,
                markerColor: "#fff",
            }));

            data[res.destinations[i].type] = { arc: arcData, label: labelData };
        }

        // globe nesnesini olusturuyoruz
        globe = Globe()
            // genel ayarlar
            .backgroundColor("#ffffff")
            .globeMaterial(new THREE.MeshBasicMaterial({ color: 0xc1eff5 }))

            // noktaciklar va uzerlerine gelince isimlerin gorunmesi
            .htmlElementsData(data.commercial.label)
            .htmlElement((d) => {
                const elBG = currentType == "commercial" ? "#8C42D6" : "#F05A5C";
                const el = document.createElement("div");
                el.style.cssText = `width:10px; height:10px; background:${elBG}; border-radius:5px; opacity:.8`;

                el.style["pointer-events"] = "auto";
                el.style.cursor = "pointer";
                el.onmouseover = () => {
                    let rect = el.getBoundingClientRect();
                    label.style.top = rect.y + 5;
                    label.style.left = rect.x;
                    label.innerText = d.title[lang];

                    el.style.backgroundColor = "#F07E5A";
                    el.style.opacity = 1;
                    el.classList.add("ghover");
                };
                el.onmouseout =
                    window.ontouchmove =
                    el.onblur =
                    () => {
                        label.style.left = "-1000px";
                        let ghover = document.querySelector(".ghover");
                        if (ghover) {
                            ghover.classList.remove("ghover");
                            ghover.style.backgroundColor = elBG;
                            ghover.style.opacity = 0.8;
                        }
                    };

                return el;
            })

            // istanbuldan yayilan yaylar
            .arcsData(data.commercial.arc)
            .arcColor("color")
            .arcStroke(0.3)
            .arcDashLength(() => Math.random())
            .arcDashGap(() => Math.random())
            .arcDashAnimateTime(() => Math.random() * 2000 + 5000)(
                document.getElementById("globeViz")
            );

        // scroll ile zoom yapmayi engelliyoruz
        let controls = globe.controls();
        controls.enableZoom = false;
    });

// dunya haritasini ekliyoruz
fetch("/assets/json/atlas.json")
    .then((res) => res.json())
    .then((landTopo) => {
        globe
            .polygonsData(
                topojson.feature(landTopo, landTopo.objects.land).features
            )
            .polygonCapMaterial(
                new THREE.MeshBasicMaterial({
                    color: "#7DC2CB",
                    side: THREE.DoubleSide,
                })
            )
            .polygonSideColor(() => "rgba(0,0,0,0)");
    });