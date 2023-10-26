import React, { useState } from "react";
import classes from "./AddBoard.module.css";
import Swal from "sweetalert2";

const AddBoard = (props) => {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  const inputHandler = (e) => {
    const {
      target: { name, value },
    } = e;
    if (name === "text") {
      // 제목은 최대 15글자
      if (value.length > 15) {
        Swal.fire(
          "글자수 초과",
          "제목은 최대 15자까지만 입력이 가능합니다.",
          "warning"
        );
        return;
      }
      setTitle(value);
    } else if (name === "textarea") {
      if (value.length > 1000) {
        Swal.fire(
          "글자수 초과",
          "내용은 최대 1000자까지만 입력이 가능합니다.",
          "warning"
        );
        return;
      }
      setText(value);
    }
  };

  const boardHandler = (e) => {
    e.preventDefault();
    props.addBoardHandler(title, text);
  };

  return (
    <form className={classes["div"]} onSubmit={boardHandler}>
      <div>
        <h2 className={classes["title"]}>글 등록</h2>
        <span className={classes["xmark"]} onClick={props.onClose} title="닫기">
          <i className="fa-solid fa-xmark fa-xl"></i>
        </span>
      </div>
      <span className={classes["rules"]}>
        <u>
          <b>
            {props.showBoard
              ? "나의 경험, 직접 들은 이번 학년도 내용"
              : "나의 경험, 직접 들은 지역 관련 내용"}
          </b>
        </u>
        을 위주로 적어주세요.
        <br /> 순화된 표현을 사용하여 공개된 곳에서 나와 우리를 지켜주세요.{" "}
      </span>
      <input
        type="text"
        name="text"
        className={classes["text-input"]}
        placeholder="제목"
        onChange={inputHandler}
        value={title}
        autoFocus
      />
      <textarea
        name="textarea"
        className={classes["textarea-input"]}
        placeholder="다른 사람을 특정지어 비방하거나 불쾌감을 유발하는 등의 부적절한 글은 삼가해주세요"
        onChange={inputHandler}
        value={text}
      />
      <button onClick={boardHandler} className={classes["save-btn"]}>
        등록하기
      </button>
    </form>
  );
};

export default AddBoard;
