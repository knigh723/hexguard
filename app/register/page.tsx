"use client";

import google from "@/assets/icons/google.svg";
import github from "@/assets/icons/github.svg";
import Image from "next/image";
import { RiEyeCloseFill, RiEyeFill } from "react-icons/ri";
import { IconContext } from "react-icons";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import SnackBar from "@/components/Snackbar";
import secureLocalStorage from "react-secure-storage";
import { FormEventHandler } from "react";
import { getSession, signIn, useSession } from "next-auth/react";
import { genSecretKey } from "@/utils/auk";

type formdata = {
  username: string;
  password: string;
};

export default function Login() {
  const [eyestate, setEyestate] = useState<boolean>(false);
  const [data, setdata] = useState<formdata>({ username: "", password: "" });
  const [blankusernames, setblankusernames] = useState<boolean>(false);
  const [blankpassword, setblankpassword] = useState<boolean>(false);
  const [processing, setprocessing] = useState<boolean>(false);
  const router = useRouter();
  const snackbarRef = useRef();

  const handleSubmit: FormEventHandler<HTMLButtonElement> = async (e) => {
    e.preventDefault();
    if (data.username == "") setblankusernames(true);
    if (data.username != "") setblankusernames(false);
    if (data.password != "") setblankpassword(false);
    if (data.password == "") return setblankpassword(true);

    setprocessing(true);

    const worker = new Worker(new URL("@/public/worker.js", import.meta.url));

    worker.postMessage({
      username: data.username,
      password: data.password,
      action: "register",
    });

    worker.onmessage = async function (message) {
      console.log(message);

      try {
        if ("error" in message.data) throw new Error(message.data.error);

        const secretKey = message.data.secretKey;
        const AccountUnlockKey = message.data.AccountUnlockKey;

        const response: Response = await fetch("/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: data.username,
            id: secretKey[1],
            AccountUnlockKey: AccountUnlockKey,
          }),
        });
        const body = await response.json();
        if (response.ok) {
          if (body?.status == "ok") {
            setprocessing(false);

            snackbarRef?.current?.show({
              message: "created successfully. Redirecting ...",
              type: "success",
            });
            console.log(secretKey[0]);
            secureLocalStorage.setItem(
              `secretKey${data.username}`,
              secretKey[0]
            );
            setTimeout(() => {
              router.push("/login");
            }, 1000);
          }
        } else {
          console.log(body?.error);
          setprocessing(false);
          snackbarRef?.current?.show({ message: body?.error, type: "fail" });
        }
        setprocessing(false);
      } catch (error) {
        console.log(error);
        setprocessing(false);
        snackbarRef?.current?.show({ message: error.message, type: "fail" });
      }
    };
  };

  const handleSubmitOAuth = async (provider: string) => {
    try {
      setprocessing(true);
      const response = await signIn(provider, {
        redirect: false,
      });
      if (response?.error) {
        console.log(response.error);
        setprocessing(false);

        snackbarRef.current?.show({
          message: "Invalid credentials",
          type: "fail",
        });
      } else {
       
        setprocessing(false);

        router.push('/dashboard')
        
      }
    } catch (error) {
      console.log(error);
      setprocessing(false);
      snackbarRef.current?.show({
        message: error.message,
        type: "fail",
      });
      return;
    }
  };

  return (
    <div className="h-screen p-28 justify-center items-center bg-blue-700 flex max-md:p-8 ">
      <SnackBar ref={snackbarRef} />
      {processing ? (
        <>
          <div className=" top-0 left-0 bottom-0 right-0 fixed w-full h-full bg-slate-400 opacity-60 z-10"></div>
          <span className="loading loading-dots z-10 w-32 fixed">Loading</span>
        </>
      ) : (
        <></>
      )}

      <div className="w-[60%] h-[130%] rounded-2xl p-14 shadow-2xl bg-cyan-500 max-md:h-full max-md:w-full">
        <div className="h-full space-y-4">
          <h1 className=" text-4xl font-opensans">Sign Up</h1>
          <div className="space-y-1 relative">
            <label htmlFor="email" className="block text-lg">
              Email{" "}
              {blankusernames ? (
                <span className="text-error text-sm ml-8">Required*</span>
              ) : (
                ""
              )}
            </label>
            <input
              type="text"
              id="email"
              className="input input-bordered w-full"
              value={data.username}
              onChange={(e) => setdata({ ...data, username: e.target.value })}
            />
            <label htmlFor="password" className="block text-lg">
              Password{" "}
              {blankpassword ? (
                <span className="text-error text-sm ml-8">Required*</span>
              ) : (
                ""
              )}
            </label>

            <input
              type={eyestate ? "text" : "password"}
              id="password"
              className="input input-bordered w-full"
              value={data.password}
              onChange={(e) => setdata({ ...data, password: e.target.value })}
            />
            <button
              className="absolute right-4 bottom-4 focus:rounded-full"
              onClick={() => setEyestate(!eyestate)}
            >
              <IconContext.Provider value={{ className: "text-xl" }}>
                {eyestate ? <RiEyeFill /> : <RiEyeCloseFill />}
              </IconContext.Provider>
            </button>
          </div>
          <div className="space-x-4">
            <button
              className="btn bg-blue-700 border-0 text-primary-content hover:scale-110 hover:bg-blue-700"
              onClick={(e) => {
                handleSubmit(e);
              }}
            >
              Register
            </button>
            <button
              className="btn bg-blue-700 border-0 text-primary-content hover:scale-110 hover:bg-blue-700"
              onClick={() => router.push("/login")}
            >
              Login
            </button>
          </div>

          <div className="divider font-semibold">OR</div>
          <button
            className="btn w-full bg-blue-700 border-0 text-primary-content hover:scale-110 hover:bg-blue-700 max-md:p-0"
            onClick={async (e) => {
              e.preventDefault();
              handleSubmitOAuth("google");
            }}
          >
            <Image src={google} alt="logo" width={30} />
            Sign Up with google
          </button>
          <button
            className="btn w-full bg-blue-700 border-0 text-primary-content hover:scale-110 hover:bg-blue-700 max-md:p-0"
            onClick={async (e) => {
              e.preventDefault();
              handleSubmitOAuth("github");
            }}
          >
            <Image src={github} alt="logo" width={30} />
            Sign Up with github
          </button>
        </div>
      </div>
    </div>
  );
}
