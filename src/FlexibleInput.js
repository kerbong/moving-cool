import React, { useRef, useState, useEffect } from "react";
import classes from "./FlexibleInput.module.css";
import { getValue } from "@testing-library/user-event/dist/utils";

const FlexibleInput = React.forwardRef((props, ref) => {
  const noteRef = useRef(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    setValue("");
  }, []);

  useEffect(() => {
    setValue(props.defaultValue);
  }, [props.defaultValue]);

  const changeHandler = (e) => {
    e.preventDefault();
    setValue(noteRef.current.value);
  };

  useEffect(() => {
    handleResizeHeight();
  }, []);

  useEffect(() => {
    if (value?.trim()?.length === 0) return;
    if (props.getValueHandler) {
      props.getValueHandler(value);
    }
  }, [value]);

  const handleResizeHeight = (e) => {
    if (noteRef === null || noteRef.current === null) {
      return;
    }

    noteRef.current.style.height = "10px";
    noteRef.current.style.height = noteRef.current.scrollHeight - 16 + "px";
  };

  const submitHandler = (e) => {
    e.preventDefault();
    props.submitHandler(value);
    setValue("");
  };

  return (
    <form onSubmit={submitHandler} className={classes["form"]}>
      <textarea
        id={props.id}
        ref={noteRef}
        {...props.options}
        className={classes[props.className]}
        onKeyDown={() => handleResizeHeight(this)}
        onKeyUp={() => handleResizeHeight(this)}
        onClick={() => handleResizeHeight(this)}
        value={value || ""}
        onChange={changeHandler}
        placeholder={props.placeholder || ""}
      />
      <button onClick={submitHandler} className={classes["submitBtn"]}>
        {props.btnTitle || "추가"}
      </button>
    </form>
  );
});

export default FlexibleInput;
