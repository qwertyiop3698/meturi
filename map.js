// [1] 전역 변수 설정 (맨 위)
var isLogined = false; 
var markers = []; 

// [2] 카카오 SDK 초기화 (로그인용)
// * 대문자 Kakao 확인!
Kakao.init('f302e156db3af4813a64bcd68ed84749');
console.log("카카오 초기화 완료 여부:", Kakao.isInitialized());

// [3] 지도 생성 및 설정
var mapContainer = document.getElementById('map'), 
    mapOption = { 
        center: new kakao.maps.LatLng(37.4849, 126.9301), // 신림역 기준
        level: 4 
    };

var map = new kakao.maps.Map(mapContainer, mapOption); // 지도 객체 생성
var ps = new kakao.maps.services.Places(); // 장소 검색 객체
var infowindow = new kakao.maps.InfoWindow({zIndex:1}); // 인포윈도우

// [4] 앱 시작 시 현위치 잡기
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
        var lat = position.coords.latitude, lon = position.coords.longitude;
        map.setCenter(new kakao.maps.LatLng(lat, lon));
    });
}

// [5] 입력창 클릭 시 로그인 체크 (입구 컷)
function checkLoginBeforeSearch() {
    if (!isLogined) {
        document.getElementById('keyword').blur(); // 키보드 방지
        if (confirm("로그인이 필요한 서비스입니다.\n카카오 로그인을 진행할까요?")) {
            loginWithKakao();
        }
    }
}

// [6] 검색 함수 (이중 보안)
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

// [7] 검색 결과 목록 및 마커 표시
function displayPlaces(data) {
    var listEl = document.getElementById('search-list');
    listEl.innerHTML = ''; // 기존 리스트 초기화

    var bounds = new kakao.maps.LatLngBounds();

    for (var i = 0; i < Math.min(data.length, 50); i++) {
        var place = data[i];
        var marker = displayMarker(place);
        markers.push(marker);
        bounds.extend(new kakao.maps.LatLng(place.y, place.x));

        // 리스트 아이템 생성
        var itemEl = document.createElement('div');
        itemEl.className = 'list-item';
        itemEl.innerHTML = `
            <div class="place-name">${place.place_name}</div>
            <div class="place-info">${place.address_name}</div>
            <div class="place-dist">${place.distance}m</div>
        `;

        // 리스트 클릭 시 지도 이동
        (function(m, p) {
            itemEl.onclick = function() {
                map.panTo(new kakao.maps.LatLng(p.y, p.x));
                infowindow.setContent('<div style="padding:5px;">' + p.place_name + '</div>');
                infowindow.open(map, m);
            };
        })(marker, place);

        listEl.appendChild(itemEl);
    }
}

// 마커 생성 함수
function displayMarker(place) {
    var marker = new kakao.maps.Marker({
        map: map,
        position: new kakao.maps.LatLng(place.y, place.x) 
    });
    return marker;
}

// 마커 삭제 함수
function removeMarker() {
    for (var i = 0; i < markers.length; i++) { markers[i].setMap(null); }
    markers = [];
}

// [8] 카카오 로그인 실행
function loginWithKakao() {
    Kakao.Auth.login({
        success: function(authObj) {
            Kakao.API.request({
                url: '/v2/user/me',
                success: function(res) {
                    isLogined = true; // 로그인 성공 상태 전환
                    
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