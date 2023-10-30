import "./App.css";
import { useState, useEffect, useRef } from "react";
import Maps from "./Maps";
import Swal from "sweetalert2";
import classes from "./App.module.css";

function App() {
  const [isTeacher, setIsTeacher] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  useEffect(() => {
    let isT = localStorage.getItem("school-info");
    if (isT) {
      setIsTeacher(true);
    }
  }, []);

  const onChange = (e) => {
    const {
      target: { name, value },
    } = e;
    if (name === "confirmText") {
      setConfirmText(value);
    }
  };

  const checkTeacher = (e) => {
    e.preventDefault();
    if (confirmText?.trim()?.length === 0) return;
    if (confirmText?.trim() === process.env.REACT_APP_IS_TEACHER) {
      localStorage.setItem("school-info", true);
      setIsTeacher(true);
    } else {
      Swal.fire(
        "인증오류",
        "인증문자를 정확하게 입력했는지 확인해주세요. 인디스쿨주소 https://indischool.com/boards/square/37363988 를 통해 확인하실 수 있습니다.",
        "error"
      );
    }
  };

  return (
    <>
      {!isTeacher && (
        <div className={classes["login-title"]}>
          {/* 이메일 로그인이면 보이는 뒤로 => 연동로그인도 보이는 화면으로 가는 왼쪽 화살표 */}

          <h2 className={classes["login-text"]}>{"교사인증"}</h2>

          {/* 교사인증 입력화면 */}
          <form onSubmit={checkTeacher} className={classes["login-form"]}>
            <input
              type="text"
              name="confirmText"
              required
              value={confirmText}
              onChange={onChange}
              className={classes["email-input"]}
            />

            {/* <p>* 이메일/연동 로그인 후 잠시 기다려주세요.</p> */}
            <input
              type="submit"
              value={"인증하기"}
              className={classes["login-btn2"]}
            />
          </form>
        </div>
      )}
      {isTeacher && <Maps />}
    </>
  );
}

export default App;
