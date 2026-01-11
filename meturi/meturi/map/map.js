
var isLogined = false; 
var markers = []; 


Kakao.init('f302e156db3af4813a64bcd68ed84749');
console.log("카카오 초기화 완료 여부:", Kakao.isInitialized());

var mapContainer = document.getElementById('map'); 
var mapOption = { 
    center: new kakao.maps.LatLng(37.4849, 126.9301), // GPS 실패 시 기본값 (신림역)
    level: 3 
};
// var markerPosition  = new kakao.maps.LatLng(33.450701, 126.570667); 

// // 마커를 생성합니다
// var marker = new kakao.maps.Marker({
//     position: markerPosition
// });

// // 마커가 지도 위에 표시되도록 설정합니다
// marker.setMap(map);

var map = new kakao.maps.Map(mapContainer, mapOption); 
var ps = new kakao.maps.services.Places(); 
var infowindow = new kakao.maps.InfoWindow({zIndex:1});


if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
        var lat = position.coords.latitude; 
        var lon = position.coords.longitude; 
        
        var locPosition = new kakao.maps.LatLng(lat, lon); 
        
        map.setCenter(locPosition);  
        var locMarker = new kakao.maps.Marker({
            map: map,
            position: locPosition
        });
        infowindow.setContent(`<div style="padding:5px;font-size:12px;"> ${nickname}님 여기 계시네요!</div>`);
        infowindow.open(map, locMarker);

        console.log("현위치로 지도 중심 이동 완료!");
    }, function(err) {
        console.error("GPS를 켜주시거나 권한을 허용해주세요.");
    });
}

function checkLoginBeforeSearch() {
    if (!isLogined) {
        document.getElementById('keyword').blur(); 
        if (confirm("로그인이 필요한 서비스입니다.\n카카오 로그인을 진행할까요?")) {
            loginWithKakao();
        }
    }
}

function searchPlaces() {
    if (!isLogined) {
        alert("로그인 후 이용 가능합니다.");
        return;
    }

    var keyword = document.getElementById('keyword').value;
    if (!keyword.trim()) { alert('검색어를 입력해주세요!'); return; }

    removeMarker();
    ps.keywordSearch(keyword, function(data, status, pagination) {
        if (status === kakao.maps.services.Status.OK) {
            displayPlaces(data);
        } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
            alert("검색 결과가 없습니다.");
        }
    }, { location: map.getCenter(), sort: kakao.maps.services.SortBy.DISTANCE });
}

    function displayPlaces(data) {
        var listEl = document.getElementById('search-list');
        listEl.innerHTML = ''; 

        var bounds = new kakao.maps.LatLngBounds();

        for (var i = 0; i < Math.min(data.length, 50); i++) {
            var place = data[i];
            
            var marker = displayMarker(place);
            markers.push(marker);
            bounds.extend(new kakao.maps.LatLng(place.y, place.x));

            var itemEl = document.createElement('div');
            itemEl.className = 'list-item';

            var distance = place.distance ? (place.distance > 1000 ? (place.distance / 1000).toFixed(1) + 'km' : place.distance + 'm') : '';

            itemEl.innerHTML = `
                <div class="place-name">${place.place_name}</div>
                <div class="place-info">${place.address_name}</div>
                <div class="place-dist">거리: ${distance}</div>
                <div style="margin-top:10px;">
                    <button class="btn" style="background:#FEE500; color:#3C1E1E; width:100%;" 
                            onclick="openWalkNav('${place.place_name}', '${place.y}', '${place.x}')">
                        🚶 도보 길찾기 시작
                    </button>
                </div>
            `;

            (function(m, p) {
                itemEl.addEventListener('click', function(e) {
                    if(e.target.tagName !== 'BUTTON') {
                        map.panTo(new kakao.maps.LatLng(p.y, p.x));
                        infowindow.setContent('<div style="padding:10px; font-size:12px;">' + p.place_name + '</div>');
                        infowindow.open(map, m);
                    }
                });
            })(marker, place);

            listEl.appendChild(itemEl);
        }
    }

        function openWalkNav(name, lat, lon) {
            const url = `https://map.kakao.com/link/to/${name},${lat},${lon}`;
            
            window.open(url, '_blank');
        }   

function displayMarker(place) {
    var marker = new kakao.maps.Marker({
        map: map,
        position: new kakao.maps.LatLng(place.y, place.x) 
    });
    return marker;
}


function removeMarker() {
    for (var i = 0; i < markers.length; i++) { markers[i].setMap(null); }
    markers = [];
}


function loginWithKakao() {
    Kakao.Auth.login({
        success: function(authObj) {
            Kakao.API.request({
                url: '/v2/user/me',
                success: function(res) {
                    isLogined = true; 
                    
                    const nickname = res.kakao_account.profile.nickname;
                    const profileImg = res.kakao_account.profile.thumbnail_image_url;
                    
                    document.getElementById('kakao-login-btn').style.display = 'none';
                    const ui = document.getElementById('user-info');
                    ui.style.display = 'flex';
                    ui.innerHTML = `<img src="${profileImg}" width="30" style="border-radius:50%; margin-right:5px;"> <span>${nickname}님</span>`;
                    
                    alert(nickname + "님 환영합니다! 이제 맛집을 찾아보세요.");
                    document.getElementById('keyword').focus(); 
                }
            });
        },
        fail: function(err) {
            alert('로그인에 실패했습니다.');
        }
    });
}

// 현위치 이동 버튼 기능
function moveToCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var loc = new kakao.maps.LatLng(position.coords.latitude, position.coords.longitude);
            map.panTo(loc);
        });
    }
}