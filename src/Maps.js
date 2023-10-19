import React, { useEffect, useState, useRef } from "react";
import classes from "./Maps.module.css";
import schoolPng from "./img/schoolMarker.png";
import schoolClickedPng from "./img/schoolMarkerClicked.png";
import logoPng from "./img/logo192.png";

const { kakao } = window;

const SCHOOL_CATEGORY = ["초등", "중등", "고등"];

const Maps = () => {
  const [map, setMap] = useState(null);
  const [placeInfo, setPlaceInfo] = useState(null);
  const [placeName, setPlaceName] = useState(null);
  const [showWindow, setShowWindow] = useState(false);
  const [schoolInputValue, setSchoolInputValue] = useState("");
  const [searchedSchool, setSearchedSchool] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [nowCategory, setNowCategory] = useState("초등");
  const [ps, setPs] = useState(null);
  const [keywordResults, setKeywordResults] = useState([]);

  var currCategory = "초등";

  useEffect(() => {
    var mapContainer = document.getElementById("map"), // 지도를 표시할 div
      mapOption = {
        center: new kakao.maps.LatLng(37.4915986, 127.0227077), // 지도의 중심좌표
        level: 4, // 지도의 확대 레벨
      };

    // 지도를 생성합니다
    let new_map = new kakao.maps.Map(mapContainer, mapOption);
    setMap(new_map);
  }, []);

  useEffect(() => {
    if (!map) return;
    // 현재 선택된 카테고리를 가지고 있을 변수입니다

    // 장소 검색 객체를 생성합니다
    let new_ps = new kakao.maps.services.Places(map);

    setPs(new_ps);

    // 지도에 idle 이벤트를 등록합니다
    kakao.maps.event.addListener(map, "idle", searchPlaces);

    // 각 카테고리에 클릭 이벤트를 등록합니다
    addCategoryClickEvent();

    // 카테고리 검색을 요청하는 함수입니다
    function searchPlaces() {
      if (!currCategory) {
        return;
      }
      console.log(currCategory);
      // 지도에 표시되고 있는 마커를 제거합니다
      removeMarker();

      new_ps.categorySearch("SC4", placesSearchCB, { useMapBounds: true });
    }

    searchPlaces();

    // 장소검색이 완료됐을 때 호출되는 콜백함수 입니다
    function placesSearchCB(data, status, pagination) {
      if (status === kakao.maps.services.Status.OK) {
        // 정상적으로 검색이 완료됐으면 지도에 마커를 표출합니다
        displayPlaces(data);
        console.log("기존 여기");
        console.log(data);
        if (pagination.hasNextPage) {
          // 있으면 다음 페이지를 검색한다.
          // console.log("넘쳐");
          setShowWindow(true);

          // pagination.nextPage();
        }
      } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
        // 검색결과가 없는경우 해야할 처리가 있다면 이곳에 작성해 주세요\
        console.log("검색결과 없음");
      } else if (status === kakao.maps.services.Status.ERROR) {
        // 에러로 인해 검색결과가 나오지 않은 경우 해야할 처리가 있다면 이곳에 작성해 주세요
        console.log("검색 에러");
      }
    }

    // 지도에 마커를 표출하는 함수입니다
    function displayPlaces(places) {
      // 몇번째 카테고리가 선택되어 있는지 얻어옵니다
      // 이 순서는 스프라이트 이미지에서의 위치를 계산하는데 사용됩니다

      // console.log(places);

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
        makeMarkerWithEvent(pl);
      });
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

      currCategory = id;
      setNowCategory(id);
      searchPlaces();
    }

    return () => kakao.maps.event.removeListener(map, "idle", searchPlaces);
  }, [map]);

  // 지도 위에 표시되고 있는 마커를 모두 제거합니다
  function removeMarker() {
    let prev_markers = markers;
    console.log(prev_markers);
    for (var i = 0; i < prev_markers.length; i++) {
      prev_markers[i].setMap(null);
    }

    setMarkers([]);
  }

  /**  마커를 생성하고 지도 위에 마커를 표시하는 함수입니다*/
  function addMarker(position, pl_name) {
    var imageSrc = schoolPng, // 마커 이미지 url, 스프라이트 이미지를 씁니다
      imageSize = new kakao.maps.Size(27, 28), // 마커 이미지의 크기
      markerImage = new kakao.maps.MarkerImage(
        imageSrc,
        imageSize
        // imgOptions
      );

    let marker = new kakao.maps.Marker({
      position: position, // 마커의 위치
      image: markerImage,
    });

    marker.setMap(map); // 지도 위에 마커를 표출합니다

    marker.setTitle(pl_name); // 마우스 오버시 툴팁.

    let new_markers = markers;
    new_markers.push(marker); // 배열에 생성된 마커를 추가합니다
    new_markers = new_markers.filter((item, i) => {
      return (
        markers.findIndex((item2, j) => {
          return item.Gb === item2.Gb;
        }) === i
      );
    });

    setMarkers(new_markers);

    return marker;
  }

  /** 마커를 만들고 마커에 클릭 이벤트 넣기 */
  const makeMarkerWithEvent = (pl) => {
    var marker = addMarker(new kakao.maps.LatLng(pl.y, pl.x), pl?.place_name);

    // 마커와 검색결과 항목을 클릭 했을 때
    // 장소정보를 표출하도록 클릭 이벤트를 등록합니다
    (function (marker, place) {
      kakao.maps.event.addListener(marker, "click", function () {
        // 화면 가운데로 이동시키기, 지도의 확대 레벨에 따라 거리를 다르게 설정해야 함.
        moveToSchool(place);

        //학교 정보 상태에 저장하기
        let place_name = place.place_name;
        setPlaceName(place_name);
        setSearchedSchool((prev) => {
          let new_data = prev || [];
          if (new_data?.length >= 5) {
            new_data.shift();
          }
          new_data.push(place);
          return new_data;
        });
        setPlaceInfo(place);
      });
    })(marker, pl);

    //현재 클릭된 학교면 통통튀는 css를 위한 id  추가하기 (위치가 완전 중요)
    if (placeName === pl?.place_name) {
      let nowImg = document.querySelector(`img[title='${pl?.place_name}']`);
      nowImg.id = "pin-selected";
    }
  };

  useEffect(() => {
    if (!placeName) return;
    // 만약 현재 placeInfo가 null이 아니면 현재 선택된 학교 골라서 통통튀는 css 적용
    if (!placeInfo) return;
    let nowImg = document.querySelector(`img[title='${placeName}']`);
    if (!nowImg) return;
    nowImg.id = "pin-selected";
    nowImg.src = schoolClickedPng;
  }, [markers, placeInfo]);

  /** 이전을 누르면 작동하는, 이전에 검색했던 학교 보여주는 함수 */
  const beforePlaceInfo = (placeName) => {
    //현재 학교 효과, state에서 없애고
    removePlaceInfo(placeName);

    if (searchedSchool?.length < 2) return;

    //현재 학교의 searchedSchool에서의 인덱스 찾아서 이전 인덱스의 학교이름을 찾고 넣기
    let new_index;
    searchedSchool?.forEach((sch, index) => {
      if (sch.place_name === placeName) {
        new_index = index - 1;
      }
    });

    if (new_index < 0) return;

    let new_placeInfo = searchedSchool[+new_index];
    setPlaceInfo(new_placeInfo);
    setPlaceName(new_placeInfo.place_name);

    //새롭게 효과주고 state에 넣기 (마커에 없으면.. 마커를 추가하고 넣어줘야 하나)
    let nowImg = document.querySelector(
      `img[title='${new_placeInfo.place_name}']`
    );
    if (!nowImg) {
      // makeMarkerWithEvent(new_placeInfo);
      moveToSchool(new_placeInfo);
    } else {
      nowImg.id = "pin-selected";
      nowImg.src = schoolClickedPng;

      moveToSchool(new_placeInfo);
    }
  };

  /** 해당 학교로 pin위치 부드럽게 이동하기 */
  const moveToSchool = (place) => {
    var level = +map.getLevel();
    if (level === 1) {
      level = 1.3;
    } else if (level > 5) {
      map.setLevel(3);
      level = 3;
    }

    var new_level = 0.0008 * (level - 0.9);
    map.panTo(new kakao.maps.LatLng(place.y, +place.x - new_level));
  };

  /** 선택된 학교 없애기 */
  const removePlaceInfo = (placeName) => {
    // 이미지랑 통통튀는 효과 없애기
    let nowImg = document.querySelector(`img[title='${placeName}']`);
    if (!nowImg) return;
    nowImg.id = "";
    nowImg.src = schoolPng;
    setPlaceInfo(null);
    setPlaceName(null);
  };

  // 클릭한 마커에 대한 장소 상세정보를 커스텀 오버레이로 표시하는 함수입니다
  const displayPlaceInfo = () => {
    return (
      <>
        <div className={classes["search-div"]}>
          {searchFormHtml}
          <div className={classes["placeinfo"]} id={placeInfo.place_name}>
            {/* 이전에 검색한 학교 / 학교이름 / x 버튼 */}
            <div className={classes["flex-row-title"]}>
              {/* 이전 */}
              <div
                onClick={() => beforePlaceInfo(placeInfo.place_name)}
                title="이전 학교"
              >
                <i
                  className="fa-solid fa-arrow-left fa-lg"
                  style={{ color: "whitesmoke" }}
                ></i>
              </div>

              <div
                className={classes["title"]}
                // href={placeInfo.place_url}
                title={placeInfo.place_name}
              >
                {placeInfo.place_name}
              </div>

              {/* 초기화면 */}
              <div
                onClick={() => removePlaceInfo(placeInfo.place_name)}
                title="선택취소"
              >
                <i
                  className="fa-solid fa-xmark fa-lg"
                  style={{ color: "whitesmoke" }}
                ></i>
              </div>
            </div>
            {placeInfo.road_address_name ? (
              <>
                <span title={placeInfo.road_address_name}>
                  {placeInfo.road_address_name}
                </span>
                <span className="jibun" title={placeInfo.address_name}></span>
              </>
            ) : (
              <span title={placeInfo.address_name}>
                {placeInfo.address_name}
              </span>
            )}
            <span className="tel">{placeInfo.phone}</span>
          </div>
        </div>
        <div className="after"></div>
      </>
    );
  };

  useEffect(() => {
    if (showWindow) {
      const timeoutId = setTimeout(() => {
        setShowWindow(false);
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [showWindow]);

  /** 왼쪽 고정된 화면에서 학교를 선택하지 않았을 때 보여질 html부분 함수 */
  const displayInfoMain = () => {
    return (
      <>
        <div className={classes["search-div"]}>{searchFormHtml}</div>
      </>
    );
  };

  /** 학교 검색하고 보여주는 함수 */
  const searchingSchool = (e) => {
    e.preventDefault();

    // console.log(schoolInputValue);
    let keyword = schoolInputValue;

    if (!keyword.replace(/^\s+|\s+$/g, "")) {
      return false;
    }

    // kakao.maps.event.removeListener(map, "click", clickHandler);

    currCategory = "";

    setKeywordResults([]);

    //현재 클릭된 학교 없애기
    setPlaceInfo(null);
    setPlaceName("");

    ps.keywordSearch(keyword, keywordSearchHandler);

    // 장소검색이 완료됐을 때 호출되는 콜백함수 입니다
    function keywordSearchHandler(data, status, pagination) {
      if (status === kakao.maps.services.Status.OK) {
        // 정상적으로 검색이 완료됐으면
        // 검색 목록과 마커를 표출합니다
        // 지도에 표시되고 있는 마커를 제거합니다
        removeMarker();
        displayKeyPlaces(data);
        console.log("여기");

        // 페이지 번호를 표출합니다
        // displayPagination(pagination);
      } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
        return;
      } else if (status === kakao.maps.services.Status.ERROR) {
        return;
      }
    }

    // 검색 결과 목록과 마커를 표출하는 함수입니다
    function displayKeyPlaces(places) {
      var bounds = new kakao.maps.LatLngBounds();

      //병설유치원 전기차충전소 교무실... 지우기
      let new_places = places.filter(
        (pl) => !pl.place_name.includes("초등학교 ")
      );

      for (var i = 0; i < new_places.length; i++) {
        // LatLngBounds 객체에 좌표를 추가합니다
        var placePosition = new kakao.maps.LatLng(
          new_places[i].y,
          new_places[i].x
        );

        makeMarkerWithEvent(new_places[i]);

        // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기
        bounds.extend(placePosition);
      }

      setKeywordResults(new_places);

      // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
      map.setBounds(bounds);
    }
  };

  /** 키워드로 찾은 학교를 클릭하면 모든 markers다 지운 후에 현재 학교 그려주기! */
  const keywordSchoolClick = (place) => {
    removeMarker();

    makeMarkerWithEvent(place);

    moveToSchool(place);

    setPlaceInfo(place);
    setPlaceName(place.place_name);

    //학교 정보 상태에 저장하기
    let place_name = place.place_name;
    setPlaceName(place_name);
    setSearchedSchool((prev) => {
      let new_data = prev || [];
      if (new_data?.length >= 5) {
        new_data.shift();
      }
      new_data.push(place);
      return new_data;
    });
    setPlaceInfo(place);

    let nowImg = document.querySelector(`img[title='${place_name}']`);
    if (!nowImg) return;
    nowImg.id = "pin-selected";
    nowImg.src = schoolClickedPng;
  };

  /** 검색결과 항목을 Element로 반환하는 함수*/
  const getListItem = (places) => {
    // console.log(places);

    return (
      <div className={classes["listItem-div"]}>
        <div className={classes["listItem-result"]}>
          {places.map((pl, index) => (
            <li
              key={index}
              className={classes["listItem-li"]}
              onClick={() => {
                keywordSchoolClick(pl);
              }}
            >
              {/* 학교명 */}
              <h5 className={classes["nameH5"]}>{pl.place_name}</h5>
              {/* 주소 */}
              <div className={classes["text-gray"]}>
                {pl.road_address_name ? pl.road_address_name : pl.address_name}
              </div>
              {/* 전화번호 */}
              <div className={classes["text-gray"]}>{pl.phone}</div>
            </li>
          ))}
        </div>
        <div className={classes["scroll"]}></div>
      </div>
    );
  };

  // 학교 찾는 검색부분 html 코드
  const searchFormHtml = (
    <>
      <form onSubmit={searchingSchool} className={classes["search-form"]}>
        {/* 로고부분 */}
        <img src={logoPng} alt="search-logo" className={classes["logo"]} />

        {/* 검색 input태그 */}
        <input
          className={classes["search-input"]}
          type="text"
          value={schoolInputValue}
          onChange={(e) => setSchoolInputValue(e.target.value)}
          size="16"
          placeholder={"학교이름 검색"}
        />

        {/* 검색돋보기 버튼 */}
        <button type="submit" className={classes["search-btn"]}>
          <i
            className="fa-solid fa-magnifying-glass fa-xl"
            style={{ color: "#a3a3a3" }}
          ></i>
        </button>
      </form>
    </>
  );

  //초등 중등 고등 학교급 선택하는 부분
  const selectCategory = SCHOOL_CATEGORY.map((ct, index) => (
    <li
      id={ct}
      key={index}
      className={
        nowCategory === ct
          ? classes["nowCategory-clicked"]
          : classes["nowCategory"]
      }
    >
      {/* <i
      className="fa-solid fa-school-flag fa-lg"
      style={{ color: "#2e3e4b" }}
    ></i>
    <br /> */}
      {ct}
    </li>
  ));

  return (
    <>
      <div id="map" style={{ width: "100%", height: "100vh" }}></div>
      <ul id="category" className={classes["category"]}>
        {selectCategory}
      </ul>
      {/* 학교 정보가 보일 div  */}
      <div
        className={classes["placeinfo_wrap"]}
        onMouseDown={kakao.maps.event.preventMap}
        onTouchStart={kakao.maps.event.preventMap}
        // dangerouslySetInnerHTML={{ __html: placeInfo }}
      >
        {placeInfo && displayPlaceInfo()}
        {!placeInfo && displayInfoMain()}
        {!placeInfo &&
          keywordResults?.length > 0 &&
          getListItem(keywordResults)}
      </div>
      {/* 학교 정보가 너무 많을 경우, 축소 권장하는 modal */}
      {showWindow && (
        <div className={classes["window"]}>
          지도 안에 학교가 너무 많네요!
          <br />
          정확한 정보를 위해 지도를 확대해주세요!
        </div>
      )}
    </>
  );
};

export default Maps;
