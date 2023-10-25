import React, { useState } from "react";
import classes from "./AddBoard.module.css";
import Swal from "sweetalert2";

const EditNick = (props) => {
  const [nick, setNick] = useState(props.nickName || "");

  const inputHandler = (e) => {
    e.preventDefault();
    const { value } = e.target;
    if (value.trim()?.length > 10) {
      Swal.fire(
        "글자수 초과",
        "닉네임 글자수가 초과했어요. 수정해서 입력해주세요.",
        "warning"
      );
      return;
    }
    setNick(value);
  };

  const nickHandler = (e) => {
    e.preventDefault();
    props.addNickHandler(nick);
  };

  return (
    <form className={classes["div"]} onSubmit={nickHandler}>
      <div>
        <h2 className={classes["title"]}>
          닉네임 {props.isNew ? "등록" : "수정"}
        </h2>
        <span className={classes["xmark"]} onClick={props.onClose} title="닫기">
          <i className="fa-solid fa-xmark fa-xl"></i>
        </span>
      </div>
      <span className={classes["rules2"]}>
        <u>
          <b>이전에 사용하지 않던 닉네임</b>
        </u>
        을 적어주세요.
        <br /> 다른 사용자와 중복되지 않는 닉네임만 가능합니다.{" "}
      </span>
      <input
        type="text"
        name="text"
        className={classes["text-input"]}
        placeholder="닉네임(최대 10글자)"
        onChange={inputHandler}
        value={nick}
        autoFocus
      />

      <button
        onClick={nickHandler}
        className={classes["save-btn"]}
        style={{ width: "400px" }}
      >
        등록하기
      </button>
    </form>
  );
};

export default EditNick;
