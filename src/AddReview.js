import React, { useState } from "react";
import StarRatings from "react-star-ratings";
import classes from "./AddReview.module.css";

import Swal from "sweetalert2";

const AddReview = (props) => {
  const [mood, setMood] = useState(0);
  const [achieve, setAchieve] = useState(0);
  const [parents, setParents] = useState(0);
  const [principal, setPrincipal] = useState(0);
  const [text, setText] = useState("");

  const inputHandler = (e) => {
    e.preventDefault();
    const { value } = e.target;
    if (value.trim()?.length > 30) {
      Swal.fire(
        "글자수 초과",
        "한 줄 리뷰의 글자수를 초과했어요. 최대 30자까지 가능합니다.",
        "warning"
      );
      return;
    }
    setText(value);
  };

  const changeRating = (newRating, name) => {
    if (name === "mood") {
      setMood(newRating);
    } else if (name === "achieve") {
      setAchieve(newRating);
    } else if (name === "parents") {
      setParents(newRating);
    } else if (name === "principal") {
      setPrincipal(newRating);
    }
    console.log(newRating);
  };

  /** 리뷰 추가 함수 */
  const reviewHandler = () => {
    if (mood === 0 || achieve === 0 || parents === 0 || principal === 0) return;

    if (text?.trim()?.length === 0) {
      Swal.fire(
        "등록 실패",
        "한 줄 리뷰 내용이 없습니다. 리뷰를 작성해주세요!",
        "warning"
      );
      return;
    }

    props.addReviewHandler(mood, achieve, parents, principal, text);
  };

  return (
    <div className={classes["review-div"]}>
      <h2 className={classes["title"]}>{props.name} 리뷰</h2>
      <p className={classes["p"]}> * 학교당 1년에 한 건만 저장이 가능해요</p>
      {/* 별점 평가 부분 그리드*/}
      <div className={classes["options-div"]}>
        {props.options?.map((op) => (
          <div className={classes["option-div"]}>
            <span className={classes["span"]}>{op.title}</span>
            <span>
              <StarRatings
                rating={
                  op.param === "mood"
                    ? mood
                    : op.param === "achieve"
                    ? achieve
                    : op.param === "parents"
                    ? parents
                    : principal
                }
                starRatedColor="#ffc700"
                changeRating={changeRating}
                name={op.param}
                starDimension="20px"
                starSpacing="2px"
              />
            </span>
          </div>
        ))}
      </div>
      {/* 한줄 리뷰쓰기 */}
      <div>
        <input
          type="text"
          className={classes["text-input"]}
          placeholder="한 줄 리뷰 (전반적으로 가장 인상깊은 부분)"
          onChange={inputHandler}
          value={text}
        />
      </div>
      {/* 등록하기 버튼 */}
      <div className={classes["option-div"]}>
        <button onClick={reviewHandler} className={classes["save-btn"]}>
          등록하기
        </button>
      </div>
    </div>
  );
};

export default AddReview;
