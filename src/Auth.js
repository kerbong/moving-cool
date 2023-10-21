import React, { useState, useEffect } from "react";
import classes from "./Maps.module.css";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { authService } from "./fbase";
import AuthTerms from "./AuthTerms";

import Swal from "sweetalert2";

const Auth = (props) => {
  const [loginScreen, setLoginScreen] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");

  const [showAgency, setShowAgency] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const failLogIn = (icon, title, text) => {
    Swal.fire({
      icon: icon,
      title: `${title}`,
      text: text,
      confirmButtonText: "확인",
      confirmButtonColor: "#2e3e4b",
      timer: 5000,
    });
  };

  const onChange = (e) => {
    const {
      target: { name, value },
    } = e;
    if (name === "email") {
      setEmail(value);
    } else if (name === "password") {
      setPassword(value);
    } else if (name === "passwordCheck") {
      setPasswordCheck(value);
    }
  };

  //비밀번호 확인 로직
  const checkPwHandler = () => {
    let isSame = false;
    if (passwordCheck === password) {
      isSame = true;
    }
    return isSame;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    let data;

    if (!loginScreen && !agreeTerms) {
      Swal.fire({
        icon: "warning",
        title: "가입 실패",
        text: "이용약관 및 개인정보제공 동의 내용을 확인해주세요!",
        confirmButtonText: "확인",
        confirmButtonColor: "#2e3e4b",
      });

      return;
    }

    //기존 유저의 로그인이면
    if (loginScreen) {
      //   setIsLoading(true);
      try {
        data = await signInWithEmailAndPassword(authService, email, password);
        //이메일 인증이 완료되지 않은 경우
        if (!authService.currentUser.emailVerified) {
          //   setIsLoading(false);
          failLogIn(
            "error",
            "이메일 인증 필요",
            "이메일 인증이 완료되지 않았습니다! 인증 후에 다시 로그인 해주세요. 문제가 지속될 경우 kerbong@gmail.com 으로 문의주세요."
          );
          authService.signOut();
          return;
        }
        // setIsLoading(false);
      } catch (error) {
        // setIsLoading(false);
        failLogIn(
          "error",
          "로그인 실패",
          "아이디/비밀번호를 확인해주세요! 문제가 지속될 경우 kerbong@gmail.com 으로 문의주세요."
        );
        return;
      }

      //정상 로그인 한 경우 로그인 창 없애기
      props.onClose();
    } else {
      //비밀번호가 다르면 회원가입 불가..!!
      if (!checkPwHandler()) {
        Swal.fire({
          icon: "error",
          title: `비밀번호 불일치`,
          text: `비밀번호가 일치하지 않습니다. 확인하시고 수정해주세요.`,
          confirmButtonText: "확인",
          confirmButtonColor: "#2e3e4b",
        });
        return;
      }

      try {
        // setIsLoading(true);
        data = await createUserWithEmailAndPassword(
          authService,
          email,
          password
        );

        try {
          // send verification mail.
          sendEmailVerification(authService.currentUser);
          authService.signOut();
          //   setIsLoading(false);
          failLogIn(
            "success",
            "인증메일 발송완료",
            "인증메일이 발송되었습니다. 인증메일 내부의 링크를 눌러 가입을 완료해주세요."
          );
        } catch {
          //   setIsLoading(false);
          console.log("에러");
        }
      } catch (error) {
        // setIsLoading(false);
        // console.log(error.message);
        let message = error.message;
        if (message.includes("email-already-in-use")) {
          failLogIn(
            "error",
            "이메일주소 확인",
            "이미 사용중인 이메일 주소입니다! 이메일 주소를 확인해주세요. 문제가 지속될 경우 kerbong@gmail.com 으로 문의주세요."
          );
        } else if (message.includes("invalid-email")) {
          failLogIn(
            "error",
            "이메일주소 확인",
            "유효하지 않은 이메일 주소입니다! 이메일 주소를 확인해주세요. 문제가 지속될 경우 kerbong@gmail.com 으로 문의주세요."
          );
        } else if (message.includes("weak-password")) {
          failLogIn(
            "error",
            "비밀번호 재설정",
            "비밀번호의 보안정도가 취약해요! 문자와 숫자, 특수문자 중 2가지 이상을 사용해주세요. 문제가 지속될 경우 kerbong@gmail.com 으로 문의주세요."
          );
        } else {
          failLogIn(
            "error",
            "회원가입 실패",
            "회원가입에 실패했습니다. 입력된 이메일, 비밀번호를 확인해주세요. 문제가 지속될 경우 kerbong@gmail.com 으로 문의주세요."
          );
        }

        return;
      }
    }
  };

  useEffect(() => {
    setPassword("");
  }, [loginScreen]);

  const agreeTermsHandler = () => {
    if (!agreeTerms) {
      setAgreeTerms(true);
      setShowAgency(false);
    } else {
      setAgreeTerms(false);
    }
  };

  return (
    <div
      className={classes["login-window"]}
      style={!loginScreen ? { height: "550px", top: "80px" } : {}}
    >
      {!showAgency && (
        <>
          <div className={classes["login-title"]}>
            {/* 이메일 로그인이면 보이는 뒤로 => 연동로그인도 보이는 화면으로 가는 왼쪽 화살표 */}
            <span style={{ width: "38px" }}></span>
            <span className={classes["login-text"]}>
              {loginScreen ? "로그인" : "회원가입"}
            </span>
            <span
              style={{ cursor: "pointer", padding: "10px" }}
              onClick={props.onClose}
              title="닫기"
            >
              <i className="fa-solid fa-xmark fa-xl"></i>
            </span>
          </div>
          {/* 로그인 버튼 */}
          <div className={classes["loginBtns-div"]}>
            {/* 회원가입부분 */}
            {!loginScreen ? (
              <>
                <form onSubmit={onSubmit} className={classes["login-form"]}>
                  <input
                    name="email"
                    type="email"
                    placeholder="사용할 이메일 주소"
                    required
                    value={email}
                    onChange={onChange}
                    className={classes["email-input"]}
                  />
                  <input
                    name="password"
                    type="password"
                    placeholder="비밀번호"
                    required
                    value={password}
                    onChange={onChange}
                    className={classes["email-input"]}
                  />

                  <input
                    name="passwordCheck"
                    type="password"
                    placeholder="비밀번호 확인"
                    required
                    value={passwordCheck}
                    onChange={onChange}
                    className={classes["email-input"]}
                  />

                  {/* 이용얀관 확인 및 동의함 버튼 */}
                  <div className={classes["authTerm-div"]}>
                    <div
                      className={classes["terms-div"]}
                      style={{ margin: "10px 0px" }}
                      onClick={() => {
                        setShowAgency(true);
                      }}
                      title="내용확인"
                    >
                      <span style={{ marginLeft: "10px" }}>
                        * 이용약관 및 개인정보제공동의
                      </span>
                      <span style={{ margin: "0 10px", color: "gray" }}>
                        <i className="fa-solid fa-chevron-down"></i>
                      </span>
                    </div>
                    {/* 동의함 버튼 */}
                    <div
                      className={classes["terms-div"]}
                      onClick={() => setAgreeTerms((prev) => !prev)}
                    >
                      <input
                        type="checkbox"
                        name="terms-checkbox"
                        checked={agreeTerms}
                        readOnly
                      />
                      <span> 동의함 </span>
                    </div>
                  </div>

                  <input
                    type="submit"
                    value={"가입"}
                    className={classes["login-btn2"]}
                  />
                </form>

                <p>* 가입버튼을 누른 후 잠시 기다려주세요.</p>
              </>
            ) : (
              <>
                {/* 로그인화면 */}
                <form onSubmit={onSubmit} className={classes["login-form"]}>
                  <input
                    name="email"
                    type="email"
                    placeholder="이메일 주소"
                    required
                    value={email}
                    onChange={onChange}
                    className={classes["email-input"]}
                  />
                  <input
                    name="password"
                    type="password"
                    placeholder="비밀번호"
                    required
                    value={password}
                    onChange={onChange}
                    className={classes["email-input"]}
                  />
                  {/* <p>* 이메일/연동 로그인 후 잠시 기다려주세요.</p> */}
                  <input
                    type="submit"
                    value={"로그인"}
                    className={classes["login-btn2"]}
                  />
                </form>
                {/* 연동로그인화면 */}
                {/* <button className={classes["login-btn"]} onClick={googleLogin}>
                  <i
                    className="fa-brands fa-google fa-lg"
                    style={{ color: "#4a92bc" }}
                  ></i>{" "}
                  구글 연동 로그인
                </button> */}
              </>
            )}
          </div>
          {/* 회원가입 버튼 */}
          <div
            className={classes["sign-text"]}
            onClick={() => {
              setLoginScreen((prev) => !prev);
            }}
          >
            <span>{loginScreen ? "회원  가입하기" : "로그인 하기"}</span>
          </div>
        </>
      )}

      {showAgency && (
        <>
          <div className={classes["terms-area"]}>
            <AuthTerms />
          </div>
          {/* 닫기버튼 */}
          <span
            className={classes["agency-close"]}
            onClick={() => setShowAgency(false)}
            title="닫기"
          >
            <i className="fa-solid fa-xmark fa-xl"></i>
          </span>
          {/* 동의함 부분 */}
          <div className={classes["terms-div"]} onClick={agreeTermsHandler}>
            <input
              type="checkbox"
              name="terms-checkbox"
              checked={agreeTerms}
              readOnly
            />
            <span> 동의하고 창닫기 </span>
          </div>
        </>
      )}
    </div>
  );
};

export default Auth;
