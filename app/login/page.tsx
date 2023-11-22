"use client";

import google from "@/assets/icons/google.svg";
import github from "@/assets/icons/github.svg";
import Image from "next/image";
import { RiEyeCloseFill, RiEyeFill } from "react-icons/ri";
import { IconContext } from "react-icons";
import { useState, useRef, FormEventHandler } from "react";
import { useRouter } from "next/navigation";
import SnackBar from "@/components/Snackbar";
import { signIn } from "next-auth/react";
import secureLocalStorage from "react-secure-storage";

export default function Login() {
  const [eyestate, setEyestate] = useState(false);
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [blankusernames, setblankusernames] = useState<boolean>(false);
  const [blankpassword, setblankpassword] = useState<boolean>(false);
  const [processing, setprocessing] = useState<boolean>(false);
  const [secKey, setsecKey] = useState({ state: false, secretKey: "" });
  const [key, setkey] = useState<string>("");
  const [Email, setEmail] = useState<string>("");


  const router = useRouter();
  const snackbarRef = useRef();

  const handleSubmit: FormEventHandler<HTMLButtonElement> = async (e) => {
    e?.preventDefault();
    if (email == "") setblankusernames(true);
    if (email != "") setblankusernames(false);
    if (password != "") setblankpassword(false);
    if (password == "") return setblankpassword(true);
    //validate
    let regex = /^[a-z0-9A-Z]+@[a-z]+\.[a-z]{2,4}$/;
    let res = regex.test(email);
    if (!res) {
      snackbarRef.current?.show({ message: "Invalid email", type: "fail" });
    } else {
      const SecretKey = secureLocalStorage.getItem(`secretKey${email}`);
      console.log(SecretKey)
      if (!SecretKey)
        return snackbarRef.current?.show({
          message: "Cannot find secret key",
          type: "fail",
        });

      setprocessing(true);
      const worker = new Worker(new URL("@/public/worker.js", import.meta.url));
      console.log(password + SecretKey);
      worker.postMessage({
        username: email,
        password: password + SecretKey,
        action: "login",
      });

      worker.onmessage = async function (message) {
        try {
          const response = await signIn("credentials", {
            email: email,
            password: message.data.AccountUnlockKey,
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

            snackbarRef.current.show({
              message: "Logged in successfully!",
              type: "success",
            });
            setTimeout(() => {
              router.push("/dashboard");
            }, 1000);
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
    }
  };

  const handleSubmitOAuth = async (provider: string) => {
    try {
      setprocessing(true);
      const response = await signIn(provider,{callbackUrl:"/dashboard"});
      if (response?.error) {
        console.log(response.error);
        setprocessing(false);

        snackbarRef.current?.show({
          message: "Invalid credentials",
          type: "fail",
        });
      } else {
        setprocessing(false);
        
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
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
    <div className="h-screen p-28 justify-center items-center bg-blue-700 flex max-md:p-8">
      <SnackBar ref={snackbarRef} />

      {secKey.state && (
        <div className="bg-slate-900 fixed inset-0 z-50 bg-opacity-30 backdrop-blur-sm flex justify-center items-center py-2">
          <div className="bg-cyan-500 rounded-lg w-[50%] space-y-6 py-8 px-14 max-lg:w-[100%] max-lg:mx-20">
            <div className="text-4xl font-opensans">
              Enter your SecretKey{" "}
              
            </div>
            <div className="grid gap-1 relative">
            <label htmlFor="name">
                Email
                {Email ? (
                  <></>
                ) : (
                  <span className="ml-24 text-red-500">*Required</span>
                )}
              </label>
              <input
                type="text"
                id="name"
                className="input input-info"
                value={Email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label htmlFor="name">
                Secret Key
                {key ? (
                  <></>
                ) : (
                  <span className="ml-24 text-red-500">*Required</span>
                )}
              </label>
              <input
                type="text"
                id="name"
                className="input input-info"
                value={key}
                onChange={(e) => setkey(e.target.value)}
              />
            </div>
            <div className="flex space-x-4">
              <button
                className="btn bg-neutral hover:bg-neutral text-neutral-content border-0 hover:scale-110"
                onClick={() => {
                  if(Email && key){
                    secureLocalStorage.setItem(
                      `secretKey${Email}`,
                      key
                    );
                    setsecKey({ ...secKey, state: false });
                  }
                  
                }}
              >
                Submit
              </button>
              <button
                className="btn bg-neutral hover:bg-neutral text-neutral-content border-0 hover:scale-110"
                onClick={() => setsecKey({...secKey,state:false})}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {processing ? (
        <>
          <div className=" top-0 left-0 bottom-0 right-0 fixed w-full h-full bg-slate-400 opacity-60 z-10"></div>
          <span className="loading loading-dots z-10 w-32 fixed"></span>
        </>
      ) : (
        <></>
      )}

      <div className="w-[60%] h-[130%] rounded-2xl p-14 shadow-2xl bg-cyan-500 max-md:h-full max-md:w-full">
        <div className="h-full space-y-4">
          <h1 className=" text-4xl font-opensans">Sign In</h1>
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
              value={email}
              onChange={(e) => setemail(e.target.value)}
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
              value={password}
              onChange={(e) => setpassword(e.target.value)}
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
              Submit
            </button>
            <button
              className="btn bg-blue-700 border-0 text-primary-content hover:scale-110 hover:bg-blue-700"
              onClick={() => router.push("/register")}
            >
              Register
            </button>
            <button
              className="btn bg-blue-700 border-0 text-primary-content hover:scale-110 hover:bg-blue-700
              max-sm:mt-4 max-sm:ml-0"
              onClick={() => setsecKey({...secKey,state:!secKey.state})}
            >
              Set Secret Key
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
            Sign In with google
          </button>
          <button
            className="btn w-full bg-blue-700 border-0 text-primary-content hover:scale-110 hover:bg-blue-700 max-md:p-0"
            onClick={async (e) => {
              e.preventDefault();
              handleSubmitOAuth("github");
            }}
          >
            <Image src={github} alt="logo" width={30} />
            Sign In with github
          </button>
        </div>
      </div>
    </div>
  );
}
