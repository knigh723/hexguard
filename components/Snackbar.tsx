import success from "@/assets/icons/tick.svg";
import fail from "@/assets/icons/fail.svg";
import Image from "next/image";
import React, { useState, forwardRef, useImperativeHandle } from "react";

type porpsItem = {
  type: string;
  message: string;
};

const SnackBar = forwardRef(({},ref) => {
  const [showsnackbar, setshowsnackbar] = useState(false);
  const [message, setmessage] = useState("");
  const [type, settype] = useState("");

  useImperativeHandle(ref, () => ({
    show(props:porpsItem) {
      setshowsnackbar(true)
      setmessage(props.message);
      settype(props.type);
      setTimeout(() => {
        setshowsnackbar(false)
      }, 3000);
    },
  }));
  return (
    <div
      className={
        "fixed top-6  px-4 py-1 flex items-center space-x-4 rounded-lg w-96 translate-x-[-50%] translate-y-[-50%] left-1/2" +
        " " +
        (type === "success" ? "bg-success" : "bg-error") +
        " " +
        (showsnackbar ? "visible" : "hidden")
      }
    >
      <div id="symbol">
        {type === "success" ? (
          <Image src={success} alt="logo" width={20} />
        ) : (
          <Image src={fail} alt="logo" width={20} />
        )}
      </div>
      <div id="message" className="font-semibold text-lg">
        {message}
      </div>
    </div>
  );
});

SnackBar.displayName = "Snackbar";

export default SnackBar;
