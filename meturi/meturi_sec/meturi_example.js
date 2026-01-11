
const kakaoKey = "f302e156db3af4813a64bcd68ed84749"; 
const weatherKey = "1696875c7c169d0547f0c702a071ec08c0d9e916713ea9ccec8f7b2f7e5497ab"; 

var isLogined = false; 
var nickname = "추리"; 
var markers = []; 
var map;
var infowindow;
var locMarker; 
var ps;

Kakao.init(kakaoKey);


async function updateWeather(lat, lon) {
    const grid = dfs_xy_conv(lat, lon);
    const bDate = getBaseDate();
    const bTime = getBaseTime();
    const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?serviceKey=${weatherKey}&pageNo=1&numOfRows=10&dataType=JSON&base_date=${bDate}&base_time=${bTime}&nx=${grid.x}&ny=${grid.y}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const items = data.response.body.items.item;
        const pty = items.find(i => i.category === "PTY").obsrValue;
        const t1h = items.find(i => i.category === "T1H").obsrValue; 

        // 🌟 [추가] 날씨 코드표 매핑
        const ptyMap = {
            "0": "맑음/구름 ☀️",
            "1": "비 🌧️",
            "2": "비/눈 🌨️",
            "3": "눈 ❄️",
            "5": "빗방울 💧",
            "6": "빗방울/눈날림 🌦️",
            "7": "눈날림 🌨️"
        };

       
        document.getElementById('temp-val').innerText = t1h;
        document.getElementById('pty-val').innerText = ptyMap[pty] || "정보 없음";
        
    } catch (error) {
        console.error("날씨 데이터를 가져오는 중 에러 발생:", error);
    }
}



var mapContainer = document.getElementById('map'); 
var mapOption = { 
    center: new kakao.maps.LatLng(37.4849, 126.9301), 
    level: 3 
};

map = new kakao.maps.Map(mapContainer, mapOption); 
ps = new kakao.maps.services.Places(); 
infowindow = new kakao.maps.InfoWindow({zIndex:1});

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
        var lat = position.coords.latitude; 
        var lon = position.coords.longitude; 
        var locPosition = new kakao.maps.LatLng(lat, lon);
        
        updateWeather(lat, lon);
        map.setCenter(locPosition);
        
        locMarker = new kakao.maps.Marker({
            map: map,
            position: locPosition
        });
        
        infowindow.setContent(`<div style="padding:5px;font-size:12px;"> ${nickname}님 여기 계시네요!</div>`);
        infowindow.open(map, locMarker);
    });
}

function loginWithKakao() {
    Kakao.Auth.login({
        success: function(authObj) {
            Kakao.API.request({
                url: '/v2/user/me',
                success: function(res) {
                    isLogined = true; 
                    nickname = res.kakao_account.profile.nickname;
                    var profileImg = res.kakao_account.profile.thumbnail_image_url;
                    
                    
                    document.getElementById('kakao-login-btn').style.display = 'none';
                    const ui = document.getElementById('user-info');
                    ui.style.display = 'flex';
                    ui.innerHTML = `<img src="${profileImg}" width="30" style="border-radius:50%; margin-right:5px;"> <span>${nickname}님</span>`;
                    
                   
                    if (infowindow && locMarker) {
                        infowindow.setContent(`<div style="padding:5px;font-size:12px;"> ${nickname}님 여기 계시네요!</div>`);
                    }

                    alert(nickname + "님 환영합니다!");
                }
            });
        }
    });
}


function moveToCurrentLocation() {
    console.log("현위치 이동 버튼 클릭됨!"); 
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var loc = new kakao.maps.LatLng(position.coords.latitude, position.coords.longitude);
            
            map.panTo(loc); 
            
            updateWeather(position.coords.latitude, position.coords.longitude);
        }, function(err) {
            alert("위치 정보를 가져올 수 없습니다. 권한을 확인해주세요.");
        });
    } else {
        alert("이 브라우저에서는 GPS를 지원하지 않습니다.");
    }
}

function dfs_xy_conv(v1, v2) {
    const RE = 6371.00877, GRID = 5.0, SLAT1 = 30.0, SLAT2 = 60.0, OLON = 126.0, OLAT = 38.0, XO = 43, YO = 136;
    const DEGRAD = Math.PI / 180.0, re = RE / GRID, slat1 = SLAT1 * DEGRAD, slat2 = SLAT2 * DEGRAD, olon = OLON * DEGRAD, olat = OLAT * DEGRAD;
    let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
    sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
    let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
    sf = Math.pow(sf, sn) * Math.cos(slat1) / sn;
    let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
    ro = re * sf / Math.pow(ro, sn);
    let rs = {};
    let ra = Math.tan(Math.PI * 0.25 + (v1) * DEGRAD * 0.5);
    ra = re * sf / Math.pow(ra, sn);
    let theta = v2 * DEGRAD - olon;
    if (theta > Math.PI) theta -= 2.0 * Math.PI;
    if (theta < -Math.PI) theta += 2.0 * Math.PI;
    theta *= sn;
    rs['x'] = Math.floor(ra * Math.sin(theta) + XO + 0.5);
    rs['y'] = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);
    return rs;
}

function getBaseDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return year + month + day;
}

function getBaseTime() {
    const now = new Date();
    let hour = now.getHours();
    let min = now.getMinutes();
    if (min < 40) hour = (hour === 0) ? 23 : hour - 1;
    return String(hour).padStart(2, '0') + "00";
}