import React, { useEffect, useState } from "react";
import classes from "./Maps.module.css";
import schoolPng from "./img/schoolMarker.png";
const { kakao } = window;

const Maps = () => {
  const [map, setMap] = useState(null);
  const [placeInfo, setPlaceInfo] = useState(null);

  useEffect(() => {
    var mapContainer = document.getElementById("map"), // 지도를 표시할 div
      mapOption = {
        center: new kakao.maps.LatLng(37.566826, 126.9786567), // 지도의 중심좌표
        level: 4, // 지도의 확대 레벨
      };

    console.log("ㅎㅎ");

    // 지도를 생성합니다
    let new_map = new kakao.maps.Map(mapContainer, mapOption);
    setMap(new_map);
  }, []);

  useEffect(() => {
    if (!map) return;
    var markers = [], // 마커를 담을 배열입니다
      currCategory = ""; // 현재 선택된 카테고리를 가지고 있을 변수입니다

    // 장소 검색 객체를 생성합니다
    var ps = new kakao.maps.services.Places(map);

    // 지도에 idle 이벤트를 등록합니다
    kakao.maps.event.addListener(map, "idle", searchPlaces);

    // 각 카테고리에 클릭 이벤트를 등록합니다
    addCategoryClickEvent();

    // 카테고리 검색을 요청하는 함수입니다
    function searchPlaces() {
      if (!currCategory) {
        return;
      }

      // 지도에 표시되고 있는 마커를 제거합니다
      removeMarker();

      ps.categorySearch("SC4", placesSearchCB, { useMapBounds: true });
    }

    // 장소검색이 완료됐을 때 호출되는 콜백함수 입니다
    function placesSearchCB(data, status, pagination) {
      if (status === kakao.maps.services.Status.OK) {
        // 정상적으로 검색이 완료됐으면 지도에 마커를 표출합니다
        displayPlaces(data);
      } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
        // 검색결과가 없는경우 해야할 처리가 있다면 이곳에 작성해 주세요
      } else if (status === kakao.maps.services.Status.ERROR) {
        // 에러로 인해 검색결과가 나오지 않은 경우 해야할 처리가 있다면 이곳에 작성해 주세요
      }
    }

    // 지도에 마커를 표출하는 함수입니다
    function displayPlaces(places) {
      // 몇번째 카테고리가 선택되어 있는지 얻어옵니다
      // 이 순서는 스프라이트 이미지에서의 위치를 계산하는데 사용됩니다
      console.log(places);
      console.log(currCategory);

      places?.forEach((pl) => {
        // if (pl?.category_name?.includes("초등")) return;
        if (currCategory === "초등") {
          if (!pl?.category_name?.includes("초등학교")) return;
        } else if (currCategory === "중등") {
          if (!pl?.category_name?.includes("중학교")) return;
        } else if (currCategory === "고등") {
          if (!pl?.category_name?.includes("고등학교")) return;
        }

        // 마커를 생성하고 지도에 표시합니다
        var marker = addMarker(
          new kakao.maps.LatLng(pl.y, pl.x),
          pl?.place_name
        );

        // 마커와 검색결과 항목을 클릭 했을 때
        // 장소정보를 표출하도록 클릭 이벤트를 등록합니다
        (function (marker, place) {
          kakao.maps.event.addListener(marker, "click", function () {
            // 화면 가운데로 이동시키기
            map.setCenter(new kakao.maps.LatLng(place.y, +place.x - 0.004));
            console.log(+place.x - 0.005);
            console.log(place.x);
            //학교 정보 띄워주기
            displayPlaceInfo(place);
          });

          //마우스 오버시 이벤트
          // kakao.maps.event.addListener(marker, "mouseover", function () {
          //   alert("marker mouseover!");
          // });
        })(marker, pl);
      });
    }

    // 마커를 생성하고 지도 위에 마커를 표시하는 함수입니다
    function addMarker(position, pl_name) {
      var imageSrc = schoolPng, // 마커 이미지 url, 스프라이트 이미지를 씁니다
        imageSize = new kakao.maps.Size(27, 28), // 마커 이미지의 크기
        markerImage = new kakao.maps.MarkerImage(
          imageSrc,
          imageSize
          // imgOptions
        ),
        marker = new kakao.maps.Marker({
          position: position, // 마커의 위치
          image: markerImage,
        });

      marker.setMap(map); // 지도 위에 마커를 표출합니다

      marker.setTitle(pl_name); // 마우스 오버시 툴팁.

      markers.push(marker); // 배열에 생성된 마커를 추가합니다

      return marker;
    }

    // 지도 위에 표시되고 있는 마커를 모두 제거합니다
    function removeMarker() {
      for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
      }
      markers = [];
    }

    // 클릭한 마커에 대한 장소 상세정보를 커스텀 오버레이로 표시하는 함수입니다
    function displayPlaceInfo(place) {
      var content =
        '<div class="placeinfo">' +
        '   <a class="title" href="' +
        place.place_url +
        '" target="_blank" title="' +
        place.place_name +
        '">' +
        place.place_name +
        "</a>";

      if (place.road_address_name) {
        content +=
          '    <span title="' +
          place.road_address_name +
          '">' +
          place.road_address_name +
          "</span>" +
          '  <span class="jibun" title="' +
          place.address_name +
          '">(지번 : ' +
          place.address_name +
          ")</span>";
      } else {
        content +=
          '    <span title="' +
          place.address_name +
          '">' +
          place.address_name +
          "</span>";
      }

      content +=
        '    <span class="tel">' +
        place.phone +
        "</span>" +
        "</div>" +
        '<div class="after"></div>';

      setPlaceInfo(content);
    }

    // 각 카테고리에 클릭 이벤트를 등록합니다
    function addCategoryClickEvent() {
      var category = document.getElementById("category"),
        children = category.children;

      for (var i = 0; i < children.length; i++) {
        children[i].onclick = onClickCategory;
      }
    }

    // 카테고리를 클릭했을 때 호출되는 함수입니다
    function onClickCategory() {
      var id = this.id,
        className = this.className;

      // placeOverlay.setMap(null);

      if (className !== "on") {
        currCategory = id;
        changeCategoryClass(this);
        searchPlaces();
      }
    }

    // 클릭된 카테고리에만 클릭된 스타일을 적용하는 함수입니다
    function changeCategoryClass(el) {
      var category = document.getElementById("category"),
        children = category.children,
        i;

      for (i = 0; i < children.length; i++) {
        children[i].className = "";
      }

      if (el) {
        el.className = "on";
      }
    }
  }, [map]);

  return (
    <>
      <div id="map" style={{ width: "100%", height: "100vh" }}></div>
      <ul id="category" className={classes["category"]}>
        <li id="초등">
          <span class="category_bg bank"></span>
          초등
        </li>
        <li id="중등">
          <span class="category_bg mart"></span>
          중등
        </li>
        <li id="고등">
          <span class="category_bg pharmacy"></span>
          고등
        </li>
      </ul>
      {/* 학교 정보가 보일 div  */}
      <div
        className={classes["placeinfo_wrap"]}
        onMouseDown={kakao.maps.event.preventMap}
        onTouchStart={kakao.maps.event.preventMap}
        dangerouslySetInnerHTML={{ __html: placeInfo }}
      ></div>
    </>
  );
};

export default Maps;
