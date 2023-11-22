import Image from "next/image";
import itemprofile from "@/assets/icons/itemprofile.svg";
import { useEffect, useState } from "react";
import { IconContext } from "react-icons";
import {
  RiEyeCloseFill,
  RiEyeFill,
  RiDeleteBin6Fill,
  RiEditLine,
  RiSave3Fill,
} from "react-icons/ri";
import { MdOutlineContentCopy } from "react-icons/md";
import { FcOk } from "react-icons/fc";
import { encryptMessage, sha256Hash } from "@/utils/encryption";
import { useRouter } from "next/navigation";
import { deriveAesKeyWithHKDF } from "@/utils/auk";

export default function DisplayItem(props) {
  const empty = {
    name: "",
    creationDate: "",
    updatedDate: "",
    organization: "",
    favourite: "",
    notes: "",
    login: {
      username: "",
      password: "",
      uri: "",
    },
  }
  const [Eyestate, setEyestate] = useState(false);
  const [isEditable, setEditable] = useState(true);
  const [iscopypass, setcopypass] = useState(false);
  const [iscopyusername, setcopyusername] = useState(false);
  const [cred, setcred] = useState(empty);


  const handleCopy = (copyfn: Function, data: string) => {
    copyfn(true);
    navigator.clipboard.writeText(data);
    setTimeout(() => {
      copyfn(false);
    }, 3000);
  };
  function getdomain(fullurl: string) {
    try {
      if (fullurl) {
        const url = new URL(fullurl);
        return `https://icon.horse/icon/${url.hostname.replace('www.','')}`;
      }
      return itemprofile;
    } catch (error) {
      return itemprofile;
    }
  }
  function getitembyid(id, vault) {
    for (let i = 0; i < vault.length; i++) {
      if (vault[i]._id === id) {
        return vault[i];
      }
    }
  }

  useEffect(() => {
    const vault = getitembyid(props.current, props.vault);
    setcred({...vault,login:{
      username:vault?.login.username,
      password:vault?.login.password,
      uri:vault?.login.uri
    }});
    console.log(cred);
  }, [props.current,isEditable,props.reload]);



  if (!props.current) return <div></div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-8">
        <Image src={getdomain(cred.login.uri)} alt="logo" width={60} height={60} />
        <h1 className="text-4xl font-semibold">{cred.name}</h1>
      </div>
      <div className="w-full">
        <label htmlFor="username" className="label">
          <span className="label-text text-info-content">Username</span>
        </label>
        <div className="flex border pe-4 rounded-lg ">
          <input
            type="text"
            id="username"
            className="input input-md w-full outline-none border-none focus:outline-none"
            value={cred.login.username}
            readOnly={isEditable ? true : false}
            
            onChange={(e) => {
              setcred({ ...cred, login:{...cred.login,username: e.target.value }});
            }}
          />
          <IconContext.Provider
            value={{
              className:
                "text-xl left-18 rounded hover:shadow-xl transition-all active:scale-50",
            }}
          >
            <button onClick={() => handleCopy(setcopyusername, cred.login.username)}>
              {iscopyusername ? <FcOk /> : <MdOutlineContentCopy />}
            </button>
          </IconContext.Provider>
        </div>
        <label htmlFor="password" className="label">
          <span className="label-text text-info-content">Password </span>
        </label>
        <div className="flex space-x-4 pe-4 border rounded-lg">
          <input
            type={Eyestate ? "text" : "password"}
            id="password"
            className="input input-md w-full focus:outline-none"
            value={cred.login.password}
            readOnly={isEditable ? true : false}
            onChange={(e) => {
              setcred({ ...cred, login:{...cred.login,password: e.target.value }});
            }}
            
          />
          <IconContext.Provider
            value={{
              className: "text-2xl rounded-full hover:shadow-xl",
            }}
          >
            <button onClick={() => setEyestate(!Eyestate)}>
              {Eyestate ? <RiEyeFill /> : <RiEyeCloseFill />}
            </button>
          </IconContext.Provider>
          <IconContext.Provider
            value={{
              className:
                "text-xl rounded hover:shadow-xl transition-all active:scale-50",
            }}
          >
            <button onClick={() => handleCopy(setcopypass, cred.login.password)}>
              {iscopypass ? <FcOk /> : <MdOutlineContentCopy />}
            </button>
          </IconContext.Provider>
        </div>
        <label htmlFor="website" className="label">
          <span className="label-text text-info-content">Website</span>
        </label>

        <input
          type="text"
          id="website"
          className="input input-bordered input-md w-full focus:outline-none"
          value={cred.login.uri}
          readOnly={isEditable ? true : false}
          onChange={(e) => {
            setcred({ ...cred, login:{...cred.login,uri: e.target.value } });
          }}
        />
      </div>
      <div className="space-y-4">
        <button className=" w-full btn btn-sm btn-error text-error-content flex justify-center items-center"
        onClick={async ()=>{
          const response = await fetch('/api/vault',{
            method:'DELETE',
            headers:{
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({id:cred._id})
          })
          if(response.ok){
            console.log('deleted successfully')
            props.setreload(!props.reload);
            props.setcurrent('');
          }
        }}
        >
          <IconContext.Provider value={{ className: "text-xl" }}>
            <RiDeleteBin6Fill />
          </IconContext.Provider>
          Delete
        </button>
        <button
          className={
            "flex justify-center items-center w-full btn btn-sm" +
            " " +
            (isEditable
              ? "btn-secondary text-secondary-content"
              : "btn-success text-success-content")
          }
          onClick={async () => {
            setEditable(!isEditable);
            if (!isEditable) {
              console.log(cred)
              const vaultKey: ArrayBuffer = deriveAesKeyWithHKDF(props.secKey);
              const iv = new TextEncoder().encode(await sha256Hash(vaultKey));
              cred.login.username = await encryptMessage(cred.login.username,vaultKey,iv);
              cred.login.password = await encryptMessage(cred.login.password,vaultKey,iv);
              cred.login.uri = await encryptMessage(cred.login.uri,vaultKey,iv);

              const response = await fetch("/api/vault", {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(cred),
              });
              if (response.ok) {
                console.log("done");
                props.setreload(!props.reload)
                console.log(!props.current)

              }
            }
          }}
        >
          <IconContext.Provider value={{ className: "text-xl" }}>
            {isEditable ? <RiEditLine /> : <RiSave3Fill />}
          </IconContext.Provider>
          {isEditable ? "Edit" : "Save"}
        </button>
      </div>
    </div>
  );
}
