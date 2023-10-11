import "./App.css";
import { Map, MapMarker, MapTypeId } from "react-kakao-maps-sdk";
import { useState, useEffect, useRef } from "react";

function App() {
  const [nowLocation, setNowLoacation] = useState({
    // 지도의 초기 위치
    center: { lat: 37.566826, lng: 126.9786567 },
    // 지도 위치 변경시 panto를 이용할지에 대해서 정의
    isPanto: false,
  }); // 현재 위치를 저장할 상태
  const [mapTypeId, setMapTypeId] = useState();
  const [info, setInfo] = useState();
  const [markers, setMarkers] = useState([]);
  const [map, setMap] = useState();

  const mapRef = useRef();
  const { kakao } = window;

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(successHandler, errorHandler); // 성공시 successHandler, 실패시 errorHandler 함수가 실행된다.
  }, []);

  const successHandler = (response) => {
    // console.log(response); // coords: GeolocationCoordinates {latitude: 위도, longitude: 경도, …} timestamp: 1673446873903
    const { latitude, longitude } = response.coords;
    setNowLoacation({
      center: { lat: latitude, lng: longitude },
      isPanto: false,
    });
    console.log(kakao);
  };

  const errorHandler = (error) => {
    console.log(error);
    alert("위치 정보 사용을 허가해주세요!");
  };

  useEffect(() => {
    if (!map) return;
    const ps = new kakao.maps.services.Places();

    ps.keywordSearch("하남시청역 맛집", (data, status, _pagination) => {
      if (status === kakao.maps.services.Status.OK) {
        // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
        // LatLngBounds 객체에 좌표를 추가합니다
        const bounds = new kakao.maps.LatLngBounds();
        let markers = [];

        for (var i = 0; i < data.length; i++) {
          // @ts-ignore
          markers.push({
            position: {
              lat: data[i].y,
              lng: data[i].x,
            },
            content: data[i].place_name,
          });
          // @ts-ignore
          bounds.extend(new kakao.maps.LatLng(data[i].y, data[i].x));
        }
        setMarkers(markers);

        // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
        map.setBounds(bounds);
      }
    });
  }, [nowLocation]);

  return (
    <div className="App">
      <Map // 로드뷰를 표시할 Container
        center={nowLocation.center}
        isPanto={false}
        style={{
          width: "100%",
          height: "350px",
        }}
        level={3}
        onCreate={setMap}
      >
        {markers.map((marker) => (
          <MapMarker
            key={`marker-${marker.content}-${marker.position.lat},${marker.position.lng}`}
            position={marker.position}
            onClick={() => setInfo(marker)}
          >
            {info && info.content === marker.content && (
              <div style={{ color: "#000" }}>{marker.content}</div>
            )}
          </MapMarker>
        ))}
      </Map>
    </div>
  );
}

export default App;
