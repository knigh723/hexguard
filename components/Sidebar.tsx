"use client";

import { MdOutlineMoreVert } from "react-icons/md";
import { IconContext } from "react-icons";
import { FaCirclePlus } from "react-icons/fa6";
import Image from "next/image";
import { SidebarItems, VaultItems } from "./SidebarData";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import archive from "@/assets/icons/archive.svg";
import restore from "@/assets/icons/resotre.svg";
import profile from "@/assets/icons/profile.svg";
import { signOut, useSession } from "next-auth/react";
import { MdOutlineContentCopy } from "react-icons/md";
import { FcOk } from "react-icons/fc";
import secureLocalStorage from "react-secure-storage";


type propsitem = {
  email: string;
  image: string;
  id: string;
  vault:Object;
  setfavourite:Function;
  favourite:boolean;
  setcategory:Function;
};

export default function Sidebar(props: propsitem) {
  const [isOpen, setOpen] = useState<boolean>(true);
  const [iscopyusername, setcopyusername] = useState(false);
  const {data:session} = useSession()
  const [Key,setkey] = useState<string>(secureLocalStorage.getItem(`secretKey${session?.user?.email}`))
  const [current,setcurrent] =useState<number>(1);
  const [currentV,setcurrentV] =useState<number>(3);


  useEffect(()=>{
    setkey(secureLocalStorage.getItem(`secretKey${session?.user?.email}`))
  })

  const handleCopy = (copyfn: Function,data:string) => {
    copyfn(true);
    navigator.clipboard.writeText(data);
    setTimeout(() => {
      copyfn(false);
    }, 3000);
  };

  async function deleteAccout(){
    const res = await fetch('/api/delete',{
      method:'DELETE',
    })
    if(res.ok){
      signOut();
      secureLocalStorage.removeItem(`secretKey${session?.user?.email}`);
    }
  }
  const pathname: string = usePathname();

  return (
  
    <div className="h-screen shadow-2xl bg-neutral p-4 text-neutral-content grid gap-1 relative overflow-y-auto max-sm:w-[80%] z-[1]">
      <div className="flex self-start justify-between items-center w-full">
        <p className="font-bold text-xl text-accent">Hex Guard</p>
        <button className="btn btn-ghost btn-circle hover:bg-neutral-focus p-0">
          <IconContext.Provider
            value={{
              className: "hover:scale-[110%] text-lg",
            }}
          >
            <MdOutlineMoreVert />
          </IconContext.Provider>
        </button>
      </div>

      <div
        id="avatar"
        className="flex w-full self-start space-x-2 items-center"
      >
        <div className="avatar">
          <Image
            src={props.image || profile}
            alt="logo"
            height={30}
            width={30}
            style={{
              objectFit: "contain",
            }}
            className="rounded-lg"
          />
        </div>

        <div className="collapse collapse-arrow">
          <input type="checkbox" className="peer" />
          <div className="collapse-title">{props.email}</div>
          <div className="collapse-content peer-checked:bg-primary flex flex-col justify-center items-center">
            <p className="">
              <div className="flex justify-between">
              <p>Your Secret Key:</p>
                <IconContext.Provider
                  value={{
                    className:
                      "text-xl rounded hover:shadow-xl transition-all active:scale-50",
                  }}
                >
                  <button onClick={() => handleCopy(setcopyusername, Key)}>
                    {iscopyusername ? <FcOk /> : <MdOutlineContentCopy />}
                  </button>
                </IconContext.Provider>
                </div>
              <p className=" text-xs overflow-auto w-56">{Key}</p>
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg justify-center items-center flex flex-col space-y-1">
        {SidebarItems.map((map, key) => {
          return (
            <div
              className={`w-full flex btn btn-ghost rounded-lg px-5 py-1 items-center hover:bg-neutral-focus justify-start ${
                pathname == map.link ? "bg-neutral-focus" : ""
              } ${current === map.id ? "bg-neutral-focus text-neutral-content" : ""}`}
              key={key}
              onClick={() => {
                if(map.id == 2) props.setfavourite(!props.favourite);
                if(map.id == 1) props.setfavourite(false);
                setcurrent(map.id);
              }}
            >
              <Image
                src={map.icon}
                alt="logo"
                height={30}
                style={{
                  objectFit: "contain",
                }}
                className="rounded-lg me-4"
              />
              {map.title}
            </div>
          );
        })}
        <div
          className={`collapse collapse-arrow ${isOpen ? "collapse-open" : ""}`}
          onClick={() => {
            setOpen(!isOpen);
          }}
        >
          <div className="m-4 font-semibold flex justify-between">
            VAULTS
          </div>
          <div className="flex flex-col justify-center items-center">
            {VaultItems.map((map, key) => {
              return (
                <div
                  className={`w-full flex btn btn-ghost rounded-lg px-5 py-1 items-center hover:bg-neutral-focus justify-start ${
                    pathname == map.link ? "bg-neutral-focus" : ""
                  } ${currentV === map.id ? "bg-neutral-focus text-neutral-content" : ""}`}
                  key={key}
                  onClick={() => {
                    setcurrentV(map.id)
                    props.setcategory(map.title);
                    props.setfavourite(false);
                  }}
                >
                  <Image
                    src={map.icon}
                    alt="logo"
                    height={30}
                    style={{
                      objectFit: "contain",
                    }}
                    className="rounded-lg me-4"
                  />
                  {map.title}
                </div>
              );
            })}
          </div>
        </div>
        
      </div>
      <div className="self-end">
        <button className="modified-btn hover:bg-neutral-focus  flex items-center justify-normal"
        onClick={async ()=>await deleteAccout()}
        >
          <Image src={archive} alt="logo" />
          Delete Account
        </button>
        <button
          className="modified-btn hover:bg-neutral-focus flex items-center justify-normal"
          onClick={() => signOut()}
        >
          <Image src={restore} alt="logo" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
