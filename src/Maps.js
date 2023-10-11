import React, { useEffect, useState, useRef } from "react";

const Maps = () => {
  const [kakaoMap, setKakaoMap] = useState(null);
  const [moved, setMoved] = useState(false);
  const [schoolGroup, setSchoolGroup] = useState("");
  const [nowLocate, setNowLocate] = useState({
    lat: 33.450701,
    lon: 126.570667,
  });
  const mapRef = useRef();
  const { kakao } = window;

  useEffect(() => {
    let mapContainer = document.getElementById("map");
    let mapOption = {
      center: new kakao.maps.LatLng(nowLocate.lat, nowLocate.lon), // 지도의 중심좌표
      level: 3, // 지도의 확대 레벨
    };

    // 지도를 표시할 div와  지도 옵션으로  지도를 생성합니다
    var map = new kakao.maps.Map(mapContainer, mapOption);

    setKakaoMap(map);

    kakao.maps.event.addListener(map, "idle", schoolMarker);

    // HTML5의 geolocation으로 사용할 수 있는지 확인합니다
    if (navigator.geolocation) {
      // GeoLocation을 이용해서 접속 위치를 얻어옵니다
      navigator.geolocation.getCurrentPosition(function (position) {
        var lat = position.coords.latitude, // 위도
          lon = position.coords.longitude; // 경도

        setNowLocate({ lat, lon });
        // setMoved(true);
        //현재 위치를 얻어와서 이동시키기
        setCenter(map, lat, lon);
      });
    }
  }, []);

  useEffect(() => {
    if (!kakaoMap) return;
    // 지도가 이동, 확대, 축소로 인해 중심좌표가 변경되면 마지막 파라미터로 넘어온 함수를 호출하도록 이벤트를 등록합니다
    // 지도에 idle 이벤트를 등록합니다

    // kakao.maps.event.addListener(kakaoMap, "center_changed", function () {
    //   // 지도의  레벨을 얻어옵니다
    //   var level = kakaoMap.getLevel();

    //   // 지도의 중심좌표를 얻어옵니다
    //   var latlng = kakaoMap.getCenter();

    //   setNowLocate({ lat: latlng.getLat(), lon: latlng.getLng() });
    //   setMoved(true);
    // });
  }, [kakaoMap]);

  // useEffect(() => {
  //   if (!moved) return;

  //   schoolMarker();
  // }, [moved]);

  /** 학교급별로만 보이도록 설정하는 함수 */
  const groupingSchool = () => {
    return;
  };

  /** 현재 위치에서 학교들 마커로 찍어주는 함수 */
  const schoolMarker = () => {
    // 마커를 클릭하면 장소명을 표출할 인포윈도우 입니다
    var infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });

    // 장소 검색 객체를 생성합니다
    var ps = new kakao.maps.services.Places(kakaoMap);

    // 카테고리로 학교를 검색합니다
    ps.categorySearch("SC4", schoolSearch, { useMapBounds: true });
    // 키워드 검색 완료 시 호출되는 콜백함수 입니다
    function schoolSearch(data, status, pagination) {
      if (status === kakao.maps.services.Status.OK) {
        // 현재 지도에서 학교 목록들..!
        console.log(data);

        for (var i = 0; i < data.length; i++) {
          //스쿨 그룹에 따라.. 학교급별로 보여줌.
          if (schoolGroup === "초등") {
            if (!data[i]?.place_name?.includes("초등학")) return;
          } else if (schoolGroup === "중고등") {
            if (data[i]?.place_name?.includes("초등학")) return;
          }
          displayMarker(data[i]);
        }
      }
    }

    // 지도에 마커를 표시하는 함수입니다
    function displayMarker(place) {
      // 마커를 생성하고 지도에 표시합니다
      var marker = new kakao.maps.Marker({
        map: kakaoMap,
        position: new kakao.maps.LatLng(place.y, place.x),
      });

      // 마커에 클릭이벤트를 등록합니다
      kakao.maps.event.addListener(marker, "click", function () {
        // 마커를 클릭하면 장소명이 인포윈도우에 표출됩니다
        infowindow.setContent(
          '<div style="padding:10px;font-size:12px;">' +
            place.place_name +
            "</div>"
        );
        infowindow.open(kakaoMap, marker);
      });
    }

    setMoved(false);
  };

  //맵, 위도, 경도 보내면 위치로 이동
  function setCenter(map, lat, lon) {
    // 이동할 위도 경도 위치를 생성합니다
    let moveLatLon = new kakao.maps.LatLng(lat, lon);

    // 지도 중심을 이동 시킵니다
    map.setCenter(moveLatLon);
  }

  return (
    <div id="map" style={{ width: "100%", height: "500px" }} ref={mapRef}></div>
  );
};

export default Maps;
