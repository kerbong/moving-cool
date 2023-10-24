import React, { useEffect, useState, useRef } from "react";
import classes from "./Maps.module.css";
import schoolPng from "./img/schoolMarker.png";
import schoolClickedPng from "./img/schoolMarkerClicked.png";
import logoPng from "./img/logo192.png";
import Auth from "./Auth";
import { authService, dbService } from "./fbase";
import Swal from "sweetalert2";
import { signOut } from "firebase/auth";
import AuthTerms from "./AuthTerms";
import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import Modal from "./Modal";
import AddBoard from "./AddBoard";
import EditNick from "./EditNick";
import FlexibleInput from "./FlexibleInput";
dayjs.locale("ko");
var relativeTime = require("dayjs/plugin/relativeTime");
dayjs.extend(relativeTime);

const SCHOOL_CATEGORY = ["초등", "중등", "고등"];

const Maps = (props) => {
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
  const [boards, setBoards] = useState([]);
  const [keyResultsPages, setKeyResultsPages] = useState(null);
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showAgency, setShowAgency] = useState(false);
  const [showAddBoard, setShowAddBoard] = useState(false);
  const [nickName, setNickName] = useState("");
  const [showBoard, setShowBoard] = useState(false);

  const { kakao } = window;

  var currCategory = "초등";

  /** 파이어베이스에서 학교 관련 내용 받아오는 함수 */
  const getNickName = async () => {
    if (!user?.uid) return;
    let nickRef = doc(dbService, "userData", user?.uid);

    onSnapshot(nickRef, (doc) => {
      setNickName("");

      if (doc.exists()) {
        setNickName(doc?.data()?.nickName);
      }
    });
  };

  //장소선택하면. 학교알리미에서 정보 받아오고 나눔 받기
  useEffect(() => {
    if (user) {
      getNickName();
    } else {
      setNickName("");
    }
  }, [user]);

  useEffect(() => {
    const subscribe = authService.onAuthStateChanged((user) => {
      // console.log("실행");
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscribe();
    };
  }, []);

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
      // console.log(currCategory);
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
        // console.log("기존 여기");
        // console.log(data);
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
    // console.log(prev_markers);
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

  /** 학교알리미에서 학교 정보들 받아오기 첫번째 param 장소, 두번째 apiType */
  const getSchoolInfoData = async (pl, type) => {
    // let schoolCode =
    //   currCategory === "초등" ? "02" : currCategory === "중등" ? "03" : "04";
    // const res = await fetch(
    //   `https://www.schoolinfo.go.kr/openApi.do?apiKey=${process.env.REACT_APP_SCHOOL_INFO_API}&apiType=${type}&pbanYr=2023&schulKndCode=${schoolCode}`
    // );
    // const data = await res.json();
    // console.log(data);
    //  나이스 오픈 api 학교정보 api 다운로드
    // let baseUrl =
    //   "https://open.neis.go.kr/hub/schoolInfo?Type=json&pIndex=1&pSize=1000&SCHUL_KND_SC_NM=초등학교";
    // let key = "&KEY=" + process.env.REACT_APP_NEIS_OPEN_API;
    // let filter = "&SCHUL_NM=하남초등학교";
    // const fetchData = async () => {
    //   const res = await fetch(baseUrl + key + filter);
    //   const result = res.json();
    //   console.log(result);
    //   return result;
    // };
    // fetchData()
    // fetchData().then((res) => {
    //   if (res?.schoolInfo) {
    //     console.log(res?.schoolInfo?.[1]?.row);
    //   } else {
    //     Swal.fire("검색오류", "학교명을 확인해주세요", "info");
    //   }
    // });
  };

  useEffect(() => {
    if (!placeName) return;
    // 만약 현재 placeInfo가 null이 아니면 현재 선택된 학교 골라서 통통튀는 css 적용
    if (!placeInfo) return;

    //그냥 이미지를 찾아서 모두 지우고, 다시 현재 위치에 그려주는 게 나을듯..!! dom을 조작해서 parentsNode를 저장해놓고... 거기에 추가하는게 나을듯.

    //해당하는 img를 모두 찾고, 마지막 것만 남기고 dom에서 삭제함.
    let nowImgAll = document.querySelectorAll(`img[title='${placeName}']`);
    //혹시 마커가 없으면??
    if (!nowImgAll) return;
    nowImgAll?.forEach((img, i) => {
      //마지막 요소
      if (i === nowImgAll?.length - 1) {
        img.id = "pin-selected";
        img.src = schoolClickedPng;
      } else {
        img.parentNode.removeChild(img);
      }
    });
  }, [markers, placeInfo]);

  /** 파이어베이스에서 학교 관련 내용 받아오는 함수 */
  const getFirebaseData = async () => {
    let docName = placeInfo.place_name + "*" + placeInfo.road_address_name;

    let boardRef = doc(dbService, "boards", docName);

    onSnapshot(boardRef, (doc) => {
      // setEvents([]);
      //기존에 있던 events들도 다 지우기
      setBoards([]);

      if (doc.exists()) {
        const sorted_datas = doc?.data()?.datas.sort(function (a, b) {
          return new Date(a.id) - new Date(b.id);
        });
        sorted_datas.reverse();
        //최신것부터 보여주기.. 내림차순으로

        setBoards(sorted_datas);
      }
    });
  };

  //장소선택하면. 학교알리미에서 정보 받아오고 나눔 받기
  useEffect(() => {
    if (!placeInfo) return;
    //게시판 창 띄우기
    setShowBoard(true);
    //선택된 학교의 알리미 정보 가져오기
    getSchoolInfoData(placeInfo, "09");
    getFirebaseData();
  }, [placeInfo]);

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

    var new_level = 0.003 * (level - 0.9);
    map.panTo(new kakao.maps.LatLng(place.y, +place.x - new_level));
  };

  /** 선택된 학교 없애기 */
  const removePlaceInfo = (placeName) => {
    setPlaceInfo(null);
    setPlaceName(null);
    // 이미지랑 통통튀는 효과 없애기
    let nowImg = document.querySelector(`img[title='${placeName}']`);
    if (!nowImg) return;
    nowImg.id = "";
    nowImg.src = schoolPng;
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

        setKeyResultsPages(pagination);
        displayKeyPlaces(data);

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
      let new_places = places.filter((pl) => !pl.place_name.includes(" "));

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

    // makeMarkerWithEvent(place);

    moveToSchool(place);

    setPlaceInfo(place);
    setPlaceName(place.place_name);

    console.log(markers);

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

    //선택된 학교 움직이도록?!
    // let nowImg = document.querySelector(`img[title='${place_name}']`);
    // if (!nowImg) return;
    // nowImg.id = "pin-selected";
    // nowImg.src = schoolClickedPng;
  };

  const keyPageHtml = () => {
    const pageHandler = (num) => {
      if (num !== keyResultsPages?.current) {
        keyResultsPages?.gotoPage(num);
      }
    };

    return (
      // {/* 다음페이지 이전페이지 */}
      <div className={classes["pages-div"]}>
        {keyResultsPages?.last > 1 && (
          <div>
            {new Array(keyResultsPages?.last)?.fill(1)?.map((num, i) => (
              <span
                key={i + 1}
                onClick={() => pageHandler(i + 1)}
                className={
                  keyResultsPages?.current === i + 1
                    ? classes["pageNum-now"]
                    : classes["pageNum"]
                }
              >
                {i + 1}
              </span>
            ))}
          </div>
        )}
      </div>
    );
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

  /** 게시판의 내용 최종 변경 함수 */
  const saveBoardsDoc = async (ref, datas) => {
    await setDoc(ref, { datas: datas });
  };

  /** 좋아요 하트 누르면 변경되는 함수 */
  const likeHandler = async (bd, rep) => {
    //로그인 되어 있지 않으면.. 로그인 화면 보여주기
    if (!checkLogin()) return;

    let docName = placeInfo.place_name + "*" + placeInfo.road_address_name;

    let boardRef = doc(dbService, "boards", docName);

    let new_boardDoc = boards?.filter((data) => {
      let new_data = data;
      if (data.id === bd.id && data.written === bd.written) {
        let new_bd = bd;
        if (rep) {
          //현재 좋아요 누른 상태면
          if (rep.like.includes(user?.uid)) {
            rep.like = rep.like?.filter((like) => like !== user?.uid);
            // rep.like = [];
          } else {
            rep.like.push(user?.uid);
          }

          new_bd.reply = new_bd.reply.filter((r) => {
            let new_r = r;
            if (r.id === rep.id && r.written === rep.written) {
              new_r = rep;
            }
            return new_r;
          });
          new_data = new_bd;
        } else {
          //현재 좋아요 누른 상태면
          if (new_bd.like.includes(user?.uid)) {
            new_bd.like = new_bd.like?.filter((like) => like !== user?.uid);
            // new_bd.like = [];
          } else {
            new_bd.like.push(user?.uid);
          }
          new_data = new_bd;
        }
      }
      return new_data;
    });

    // console.log(new_boardDoc);

    saveBoardsDoc(boardRef, new_boardDoc);
  };

  /**신고하기 저장하는 함수 */
  const reportSaveHandler = async (board) => {
    let docName = placeInfo.place_name + "*" + placeInfo.road_address_name;

    let boardRef = doc(dbService, "boards", docName);

    let new_boards = [];
    boards.forEach((bd) => {
      let new_bd = bd;
      if (bd.id === board.id && bd.written === board.written) {
        new_bd = board;
      }
      new_boards.push(new_bd);
    });

    // console.log(new_boards);

    await setDoc(boardRef, { datas: new_boards });
    Swal.fire(
      "신고완료",
      "신고가 완료되었습니다. 보내주신 의견이 반영되기 까지는 시간이 소요될 수 있으니 양해 바랍니다.",
      "success"
    );
  };

  /** 신고하기 확인하는 함수 */
  const reportCheck = (bd, rep) => {
    Swal.fire({
      title: "신고할까요?",
      text: "글에 부적절한 내용이 포함되어 있다고 생각되시면 확인 버튼을 눌러주세요! 보내주신 의견을 검토한 후에 반영됩니다.",
      confirmButtonText: "확인",
      showDenyButton: true,
      denyButtonText: "취소",
      denyButtonColor: "#89464f",
      confirmButtonColor: "#2e3e4b",
      icon: "question",
    }).then((result) => {
      if (result.isConfirmed) {
        let new_bd = bd;
        if (rep) {
          rep.report.push({
            uid: user.uid,
            time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
          });
          new_bd.reply = new_bd.reply.filter((r) => {
            let new_r = r;
            if (r.id === rep.id && r.written === rep.written) {
              new_r = rep;
            }
            return new_r;
          });
        } else {
          new_bd.report.push({
            uid: user.uid,
            time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
          });
        }

        reportSaveHandler(new_bd);
      }
    });
  };

  /** 넘치면 자르는 함수 */
  const truncateText = (text, maxLength) => {
    if (text?.length > maxLength) {
      let new_text = text?.substring(0, maxLength) + "...";
      new_text = (
        <>
          {new_text}{" "}
          <span
            className={classes["textShowMore"]}
            onClick={(e) => {
              e.target.parentNode.parentNode.innerText = text;
            }}
          >
            <u>더보기</u>
          </span>
        </>
      );
      return new_text;
    }

    return text;
  };

  /** 로그인 했는지 확인하고, 로그인 되어 있지 않으면 false 반환하는 함수 */
  const checkLogin = () => {
    let pass = true;
    if (!user) {
      setShowLogin(true);
      pass = false;
    }
    return pass;
  };

  /** 댓글 추가하기 함수  params( 텍스트, 원글 )  */
  const replyHandler = async (value, board) => {
    if (value?.trim()?.length === 0) return;

    //댓글 내용 value
    const data = {
      text: value,
      id: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      written: user.uid,
      nickName: nickName,
      like: [],
      report: [], //신고하면..
      to: "", // 원댓글에 처음 댓글이면 빈칸..
    };
    //원글의 reply에 넣어줌
    let new_board = board;
    new_board.reply.push(data);

    let docName = placeInfo.place_name + "*" + placeInfo.road_address_name;

    let boardRef = doc(dbService, "boards", docName);

    let new_boards = boards;
    new_boards = new_boards.filter((nb) => {
      let new_data = nb;
      if (nb.id === new_board.id && nb.written === new_board.written) {
        new_data = new_board;
      }
      return new_data;
    });

    await setDoc(boardRef, { datas: new_boards });
  };

  /** 학교 상세 정보 목록들 보여주는 부분 */
  const displayPlaceDesc = () => {
    return (
      <>
        {/* QnA */}
        <div className={classes["board-div"]}>
          <h4 className={classes["board-title"]}>
            게시판{boards?.length > 0 && <span>({boards?.length})</span>}
          </h4>
          {/* 게시판 내용 추가 버튼 */}
          <button
            onClick={() => {
              //로그인 되어 있지 않으면.. 로그인 화면 보여주기
              if (!checkLogin()) return;
              setShowAddBoard(true);
            }}
            className={classes["addBtn"]}
            title="글쓰기"
          >
            {" "}
            +
          </button>

          <ul style={{ padding: "5px 0" }}>
            {boards?.map((bd, index) => {
              //로그인하지 않은 상태면.. 최대 3개만 보여주고,
              if (!user && index > 2) return null;

              return (
                <li key={index} className={classes["board-li"]}>
                  <div className={classes["boardLi-title"]}>{bd.title}</div>
                  <div className={classes["boardLi-text"]}>
                    {truncateText(bd.text, 60)}
                  </div>

                  {/* 닉네임 며칠전 신고하기/ 좋아요    */}
                  <div className={classes["boardLi-bottom"]}>
                    <div style={{ display: "flex" }}>
                      {/* 닉네임 */}
                      <div>{bd.nickName}</div>

                      {/* 며칠전 */}
                      <div style={{ marginLeft: "15px" }}>
                        {dayjs(bd.id).fromNow()}
                      </div>
                      {/* 신고하기 */}
                      <div
                        style={{ marginLeft: "15px", cursor: "pointer" }}
                        onClick={() => reportCheck(bd)}
                        title="신고하기"
                      >
                        <i className="fa-solid fa-land-mine-on fa-sm"></i>
                      </div>
                    </div>
                    {/* 좋아요 */}
                    <div
                      style={{ marginLeft: "15px", cursor: "pointer" }}
                      onClick={() => likeHandler(bd)}
                    >
                      {bd.like.includes(user?.uid) ? (
                        <i
                          className="fa-solid fa-heart fa-sm"
                          style={{ color: "#ff1d1d96" }}
                        ></i>
                      ) : (
                        <i
                          className="fa-regular fa-heart fa-sm"
                          style={{ color: "#2e3e4b" }}
                        ></i>
                      )}{" "}
                      {bd.like.length}
                    </div>
                  </div>
                  {/* 게시글의 댓글 보여주기 */}
                  {bd?.reply?.length > 0 && (
                    <>
                      <hr />
                      {bd?.reply?.map((rep, ind) => (
                        <div key={ind} className={classes["reply-div"]}>
                          <i
                            className="fa-solid fa-reply fa-rotate-180"
                            style={{
                              color: "#3f4f6994",
                              marginRight: "10px",
                              marginTop: "5px",
                            }}
                          ></i>
                          <div style={{ width: "100%" }}>
                            <div>{truncateText(rep.text, 60)}</div>

                            {/* 닉네임 며칠전 신고하기/ 좋아요    */}
                            <div className={classes["boardLi-bottom"]}>
                              <div style={{ display: "flex" }}>
                                {/* 닉네임 */}
                                <div>{rep.nickName}</div>

                                {/* 며칠전 */}
                                <div style={{ marginLeft: "15px" }}>
                                  {dayjs(rep.id).fromNow()}
                                </div>
                                {/* 신고하기 */}
                                <div
                                  style={{
                                    marginLeft: "15px",
                                    cursor: "pointer",
                                  }}
                                  onClick={() => reportCheck(bd, rep)}
                                  title="신고하기"
                                >
                                  <i className="fa-solid fa-land-mine-on fa-sm"></i>
                                </div>
                              </div>
                              {/* 좋아요 */}
                              <div
                                style={{
                                  marginLeft: "15px",
                                  cursor: "pointer",
                                }}
                                onClick={() => likeHandler(bd, rep)}
                              >
                                {rep.like.includes(user?.uid) ? (
                                  <i
                                    className="fa-solid fa-heart fa-sm"
                                    style={{ color: "#ff1d1d96" }}
                                  ></i>
                                ) : (
                                  <i
                                    className="fa-regular fa-heart fa-sm"
                                    style={{ color: "#2e3e4b" }}
                                  ></i>
                                )}{" "}
                                {rep.like.length}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  {/* 댓글다는 부분 */}
                  <div className={classes["boardLi-bottom"]}>
                    <FlexibleInput
                      className={"board-reply"}
                      placeholder={
                        nickName
                          ? `${nickName}님 댓글을 남겨주세요.`
                          : "먼저 로그인 해주세요."
                      }
                      submitHandler={(v) => replyHandler(v, bd)}
                    />
                  </div>
                </li>
              );
            })}

            {/* 로그인하지 않은 상태면.. 로그인 버튼 보여주기 */}
            {!user && (
              <button
                className={classes["login-btn"]}
                style={{ width: "390px" }}
                onClick={() => setShowLogin(true)}
              >
                로그인하고 게시글 더보기
              </button>
            )}
          </ul>
        </div>
      </>
    );
  };

  /** 유저 로그인 하는 화면 보여주기 */
  const userHandler = () => {
    // 유저 있으면
    if (user) {
      setShowLogin(false);
      //로그아웃 swal
      Swal.fire({
        title: "로그아웃",
        text: "로그아웃 하시겠어요?",
        confirmButtonText: "확인",
        showDenyButton: true,
        denyButtonText: "취소",
        denyButtonColor: "#89464f",
        confirmButtonColor: "#2e3e4b",
        icon: "question",
      }).then((result) => {
        if (result.isConfirmed) {
          signOut(authService);
        } else {
        }
      });

      // 유저 로그인 안한 상태면
    } else {
      setShowLogin(true);
    }
  };

  /** 게시글 추가하는 함수 */
  const addBoardHandler = async (title, text) => {
    try {
      const data = {
        title,
        text,
        id: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        written: user.uid,
        nickName: nickName,
        like: [],
        report: [], //신고하면..
        reply: [],
      };

      //기존 자료에 추가하고 저장하기
      console.log(data);

      let docName = placeInfo.place_name + "*" + placeInfo.road_address_name;

      let boardRef = doc(dbService, "boards", docName);

      let new_boards = boards;
      new_boards.push(data);

      await setDoc(boardRef, { datas: new_boards });

      setShowAddBoard(false);
    } catch (error) {
      Swal.fire(
        "저장 실패",
        "오류가 생겼어요! 문제가 지속되실 경우 kerbong@gmail.com으로 알려주세요!",
        "warning"
      );
      return;
    }
  };

  const addNickHandler = async (nick) => {
    if (nick?.trim()?.length === 0) return;
    //저장되어있는 nick모두 불러와서 중복되는게 있는지 확인하고 저장
    const nickRef = doc(dbService, "userData", "nickNames");

    const nickDatas = await getDoc(nickRef);

    let new_nickDatas = nickDatas?.data().datas;

    if (new_nickDatas.includes(nick)) {
      Swal.fire(
        "닉네임 중복!",
        "이미 존재하는 닉네임이네요! 닉네임을 변경해주세요.",
        "warning"
      );
      return;
      // 새로운거면.. 저장하고
    } else {
      //만약 기존에 닉네임이 있었으면.. 기존꺼는 지우고 새거 넣고
      if (nickName?.length !== 0) {
        new_nickDatas = new_nickDatas?.filter((ni) => ni !== nickName);
      }

      new_nickDatas.push(nick);

      // nick 모음에 저장하기
      setDoc(nickRef, { datas: new_nickDatas });

      //개인 문서에 저장하기
      let userRef = doc(dbService, "userData", user?.uid);

      let userData = await getDoc(userRef);

      let new_data;
      if (userData.exists()) {
        new_data = {
          ...userData.data(),
        };
      } else {
        new_data = {
          board: [],
          reply: [],
        };
      }

      new_data["nickName"] = nick;

      // nick 모음에 저장하기
      setDoc(userRef, { ...new_data });
    }

    // userData - userUid   - nickName :  ,
    //                                -  board : [ { } ] ,
    //                                -   reply : [ { } ]
  };

  return (
    <>
      <div id="map" style={{ width: "100%", height: "100vh" }}></div>
      {/* 초등 중등 고등 카테고리 */}
      <ul id="category" className={classes["category"]}>
        {selectCategory}
      </ul>
      {/* 로그인버튼 부분 */}
      <button
        id="userLogin"
        className={classes["user-login"]}
        onClick={userHandler}
        title={user ? "로그아웃" : "로그인"}
      >
        {user ? (
          <i
            className="fa-solid fa-circle-user fa-xl"
            style={{ color: "#243147" }}
          ></i>
        ) : (
          <i
            className="fa-regular fa-circle-user fa-xl"
            style={{ color: "#9e9e9e" }}
          ></i>
        )}
      </button>

      {/* 학교 정보가 보일 div  */}
      <div
        className={classes["placeinfo_wrap"]}
        onMouseDown={kakao.maps.event.preventMap}
        onTouchStart={kakao.maps.event.preventMap}
        // dangerouslySetInnerHTML={{ __html: placeInfo }}
      >
        {/* 학교 요약정보 */}
        {placeInfo && displayPlaceInfo()}

        {!placeInfo && displayInfoMain()}
        {/* 검색결과 보여주는 곳 */}
        {!placeInfo &&
          keywordResults?.length > 0 &&
          getListItem(keywordResults)}
        {/* 페이지 보여주는 곳 */}
        {!placeInfo && keywordResults?.length > 0 && keyPageHtml()}
        {/* 이용약관부분 */}
        <div
          onClick={() => setShowAgency(true)}
          className={classes["map-agencyShow"]}
        >
          이용약관 및 개인정보처리방침 보기
        </div>
      </div>
      {/* 학교 정보가 너무 많을 경우, 축소 권장하는 modal */}
      {showWindow && (
        <div className={classes["window"]}>
          지도 안에 학교가 너무 많네요!
          <br />
          정확한 정보를 위해 지도를 확대해주세요!
        </div>
      )}

      {/* 학교선택하면.. 게시판 보여줄 부분 */}
      {placeInfo && showBoard && (
        <div
          className={classes["placeinfo_board"]}
          onMouseDown={kakao.maps.event.preventMap}
          onTouchStart={kakao.maps.event.preventMap}
        >
          {displayPlaceDesc()}
        </div>
      )}

      {/* 로그인 화면 어두운 배경 */}
      {showLogin && <div className={classes["loginBg"]}></div>}

      {/* 로그인하는 modal */}
      {showLogin && <Auth onClose={() => setShowLogin(false)} />}

      {/* 닉네임도 있고 게시판에 글 추가하는 modal */}
      {showAddBoard && nickName !== "" && (
        <Modal onClose={() => setShowAddBoard(false)} addStyle={"addBoard"}>
          <AddBoard
            onClose={() => setShowAddBoard(false)}
            addBoardHandler={(title, text) => addBoardHandler(title, text)}
          />
        </Modal>
      )}

      {/* 닉네임이 없는 , 게시판에 글 추가하는 modal */}
      {showAddBoard && nickName === "" && (
        <Modal onClose={() => setShowAddBoard(false)} addStyle={"editNick"}>
          <EditNick
            onClose={() => setShowAddBoard(false)}
            addNickHandler={addNickHandler}
            nickName={nickName}
          />
        </Modal>
      )}

      {/* 약관보기 */}
      {showAgency && (
        <div
          className={classes["login-window"]}
          style={{ height: "550px", top: "80px" }}
        >
          <span
            style={{ cursor: "pointer", padding: "10px" }}
            onClick={() => setShowAgency(false)}
            title="닫기"
          >
            <i className="fa-solid fa-xmark fa-xl"></i>
          </span>
          <div className={classes["terms-area"]}>
            <AuthTerms />
          </div>
        </div>
      )}
    </>
  );
};

export default Maps;
