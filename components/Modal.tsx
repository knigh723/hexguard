import { FormEventHandler, useState, useRef } from "react";
import { IconContext } from "react-icons";
import { RiEyeFill, RiEyeCloseFill } from "react-icons/ri";
import SnackBar from "./Snackbar";
import { deriveAesKeyWithHKDF } from "@/utils/auk";
import secureLocalStorage from "react-secure-storage";
import { useSession } from "next-auth/react";
import { encryptMessage,sha256Hash } from "@/utils/encryption";

type userdata = {
  name: string;
  username: string;
  password: string;
  notes: string;
  website: string;
  organization:string;
};

export default function Modal(props: { setopen: Function; valutKey: string,category:string }) {
  const [Eyestate, setEyestate] = useState<boolean>(false);
  const [username, setusername] = useState<boolean>(true);
  const [password, setpassword] = useState<boolean>(true);
  const [name, setname] = useState<boolean>(true);
  console.log(props.category);
  const [data, setdata] = useState<userdata>({
    name: "",
    username: "",
    password: "",
    notes: "",
    website: "",
    organization:props.category
  });

  const { data: session } = useSession();

  const snackbarRef = useRef();

  const handleSubmit: FormEventHandler<HTMLButtonElement> = async (e) => {
    e.preventDefault();

    if (data.password) setpassword(true);
    if (data.username) setusername(true);
    if (data.name) setname(true);

    if (!data.username) return setusername(false);
    if (!data.password) return setpassword(false);
    if (!data.name) return setname(false);

    try {
      const secretKey: string | null = secureLocalStorage.getItem(
        `secretKey${session?.user?.email}`
      );
      if (!secretKey) throw new Error("secretKey not found");
    
      const vaultKey: ArrayBuffer = deriveAesKeyWithHKDF(secretKey);
      const iv = new TextEncoder().encode(await sha256Hash(vaultKey));
      console.log("Modal",iv);
      data.username = await encryptMessage(data.username, vaultKey, iv);
      data.name = await encryptMessage(data.name, vaultKey, iv);
      data.password = await encryptMessage(data.password, vaultKey, iv);
      data.notes = await encryptMessage(data.notes, vaultKey, iv);
      data.website = await encryptMessage(data.website, vaultKey, iv);      


      const response: Response = await fetch("/api/vault", {
        method: "POST",
        body:JSON.stringify(data),
        headers:{
          'Content-Type': 'application/json'
        }
      });

      if(response.ok){
        snackbarRef.current?.show({
          message: "Created successfully!",
          type: "success",
        });
        setTimeout(() => {
          props.setopen(false);
        }, 1000);
      }else{
        snackbarRef.current?.show({
          message: "Something went wrong",
          type: "fail",
        });
      }
    } catch (error) {
      console.log(error);
      snackbarRef.current?.show({
        message: "Something went wrong!",
        type: "fail",
      });
    }
  };
  return (
    <div className="bg-slate-400 fixed inset-0 z-50 bg-opacity-30 backdrop-blur-sm flex justify-center items-center py-2">
      <SnackBar ref={snackbarRef} />
      <div className="bg-accent rounded-lg w-[50%] space-y-6 h-full py-3 px-14 max-lg:w-[100%] max-lg:mx-20">
        <div className="text-4xl font-opensans">Add Item</div>
        <div className="grid gap-1 relative">
          <label htmlFor="name">
            Name
            {name ? (
              <></>
            ) : (
              <span className="ml-24 text-red-500">*Required</span>
            )}
          </label>
          <input
            type="text"
            id="name"
            className="input input-info"
            value={data?.name}
            onChange={(e) => setdata({ ...data, name: e.target.value })}
          />
          <label htmlFor="username">
            Username
            {username ? (
              <></>
            ) : (
              <span className="ml-16 text-red-500">*Required</span>
            )}
          </label>
          <input
            type="text"
            id="username"
            className="input input-info"
            value={data?.username}
            onChange={(e) => setdata({ ...data, username: e.target.value })}
          />
          <label htmlFor="password">
            Password
            {password ? (
              <></>
            ) : (
              <span className="ml-[4.2rem] text-red-500">*Required</span>
            )}
          </label>
          <input
            type={Eyestate ? "text" : "password"}
            id="password"
            className="input input-info"
            value={data?.password}
            onChange={(e) => setdata({ ...data, password: e.target.value })}
          />
          <IconContext.Provider
            value={{
              className:
                "text-2xl absolute right-8 top-[44%] rounded-full hover:shadow-xl",
            }}
          >
            <button onClick={() => setEyestate(!Eyestate)}>
              {Eyestate ? <RiEyeFill /> : <RiEyeCloseFill />}
            </button>
          </IconContext.Provider>
          <label htmlFor="notes">Notes</label>
          <textarea
            name="notes"
            id="notes"
            rows={3}
            style={{ resize: "none" }}
            className="textarea overflow-auto"
            value={data?.notes}
            onChange={(e) => setdata({ ...data, notes: e.target.value })}
          />
          <label htmlFor="password">Website</label>
          <input
            type="text"
            id="website"
            className="input input-info"
            value={data?.website}
            onChange={(e) => setdata({ ...data, website: e.target.value })}
          />
        </div>
        <div className="flex space-x-4">
          <button
            className="btn bg-neutral hover:bg-neutral text-neutral-content border-0 hover:scale-110"
            onClick={(e) => handleSubmit(e)}
          >
            Submit
          </button>
          <button
            className="btn bg-neutral hover:bg-neutral text-neutral-content border-0 hover:scale-110"
            onClick={() => props.setopen(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
