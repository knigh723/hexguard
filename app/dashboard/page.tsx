"use client";

import Sidebar from "@/components/Sidebar";
import { IconContext } from "react-icons";
import { useEffect, useState } from "react";
import Item from "@/components/Item";
import DisplayItem from "@/components/DisplayItem";
import { AiOutlineSearch } from "react-icons/ai";
import { IoMdAdd } from "react-icons/io";
import { HiMenuAlt2 } from "react-icons/hi";
import Modal from "@/components/Modal";
import { signOut, useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import secureLocalStorage from "react-secure-storage";
import { decryptMessage, sha256Hash } from "@/utils/encryption";
import { deriveAesKeyWithHKDF } from "@/utils/auk";

export default function Home() {
  const [drawer, setdrawer] = useState(false);
  const [openmodal, setopenmodal] = useState(false);
  const [secKey, setsecKey] = useState({ state: false, secretKey: "" });
  const [key, setkey] = useState<string>("");
  const [vault, setvault] = useState([]);
  const [current, setcurrent] = useState("");
  const [reload, setreload] = useState(false);
  const [loading, setloading] = useState(true);
  const [category, setcategory] = useState("Personal");
  const [favourite, setfavourite] = useState(false);
  const [search, setsearch] = useState("");
  const [searchres,setsearchres] = useState<Array<Object>>(vault);

  const router = useRouter();

  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });

  useEffect(() => {
    if (status == "authenticated") {
      try {
        const secretKey = secureLocalStorage.getItem(
          `secretKey${session.user?.email}`
        );
        if (!secretKey) {
          setsecKey({ ...secKey, state: true });
          throw new Error("Secret key not found");
        }
        setsecKey({ state: secKey.state, secretKey: secretKey });
      } catch (error) {
        console.log(error.message);
      }
    }
  }, [secKey.secretKey, session?.user?.email]);

  useEffect(() => {
    const getItems = async () => {
      const response = await fetch("/api/vault", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        let items = await response.json();
        const vaultKey: ArrayBuffer = deriveAesKeyWithHKDF(secKey.secretKey);
        const iv = new TextEncoder().encode(await sha256Hash(vaultKey));
        let name, username, password, uri, notes;
        console.log(items);
        for (let i = 0; i < items.length; i++) {
          name = await decryptMessage(vaultKey, items[i].name, iv);
          username = await decryptMessage(
            vaultKey,
            items[i].login.username,
            iv
          );
          password = await decryptMessage(
            vaultKey,
            items[i].login.password,
            iv
          );
          uri = await decryptMessage(vaultKey, items[i].login.uri, iv);
          notes = await decryptMessage(vaultKey, items[i].notes, iv);

          items[i].name = name;
          items[i].login.username = username;
          items[i].login.password = password;
          items[i].login.uri = uri;
          items[i].notes = notes;
        }

        setvault(items);
        console.log(items);
      }
    };
    if (status === "authenticated") {
      getItems().catch((error) => console.log(error));
      setloading(false);
    }
  }, [openmodal, session, reload]);

  const generateSecKey = () => {
    const worker = new Worker(new URL("@/public/worker.js", import.meta.url));

    worker.postMessage({
      action: "generate",
      id: session?.user?.id,
    });
    worker.onmessage = (message) => {
      if ("error" in message) {
        console.log(message);
        return false;
      }
      secureLocalStorage.setItem(
        `secretKey${session?.user?.email}`,
        message.data.secretKey[0]
      );
      setsecKey({ ...secKey, state: false });
      console.log("inside useff", secKey);
      router.refresh();
    };
  };

  function handlesearch(search: string): Array<Object> {
    const result = vault.filter((user) => {
      return (
        user &&
        (user.name.toLowerCase().includes(search) ||
          user.login.username.toLowerCase().includes(search) ||
          user.login.uri.toLowerCase().includes(search))
      );
    });
    return result;
  }

  return (
    <div className="flex lg:drawer-open w-screen">
      {secKey.state && (
        <div className="bg-slate-400 fixed inset-0 z-50 bg-opacity-30 backdrop-blur-sm flex justify-center items-center py-2">
          <div className="bg-accent rounded-lg w-[50%] space-y-6 py-8 px-14 max-lg:w-[100%] max-lg:mx-20">
            <div className="text-4xl font-opensans">
              Enter your SecretKey{" "}
              <p className="text-xl mt-6">
                OR Generate If Logged In for the First Time{" "}
              </p>
            </div>
            <div className="grid gap-1 relative">
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
                  secureLocalStorage.setItem(
                    `secretKey${session?.user?.email}`,
                    key
                  );
                  setsecKey({ ...secKey, state: false });
                }}
              >
                Submit
              </button>
              <button
                className="btn bg-neutral hover:bg-neutral text-neutral-content border-0 hover:scale-110"
                onClick={() => generateSecKey()}
              >
                Generate
              </button>
              <button
                className="btn bg-neutral hover:bg-neutral text-neutral-content border-0 hover:scale-110"
                onClick={() => signOut()}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className=" drawer-side w-[28%] max-lg:w-[100%]">
        <label
          htmlFor="my-drawer-2"
          aria-label="close sidebar"
          className="drawer-overlay"
          onClick={() => setdrawer(false)}
        ></label>

        <Sidebar
          email={session?.user?.email}
          id={session?.user?.id}
          image={session?.user?.image}
          vault={vault}
          setfavourite={setfavourite}
          favourite={favourite}
          setcategory={setcategory}
        />
      </div>
      <div className="h-screen flex flex-col w-full drawer-content">
        <div
          id="searchbar"
          className={
            "navbar border-b-2 max-sm:p-0" +
            " " +
            (drawer ? "max-lg:-z-10" : "")
          }
        >
          <div className="navbar-start w-full space-x-6 items-center">
            <div className="p-2 lg:hidden">
              <label
                htmlFor="my-drawer-2"
                className="btn btn-ghost drawer-button"
                onClick={() => setdrawer(true)}
              >
                <IconContext.Provider value={{ className: "text-4xl" }}>
                  <HiMenuAlt2 />
                </IconContext.Provider>
              </label>
            </div>
            <div className="input-group w-full">
              <button
                className="btn btn-sm"
                onClick={() => {
                  setsearchres(handlesearch(search));
                  console.log(searchres);
                }}
              >
                <IconContext.Provider value={{ className: "text-xl" }}>
                  <AiOutlineSearch />
                </IconContext.Provider>
              </button>
              <input
                type="text"
                placeholder="Search for items"
                className="input input-bordered focus:outline-none input-sm w-3/4"
                value={search}
                onChange={(e) => {
                  setsearch(e.target.value);
                  setsearchres(handlesearch(search));
                  console.log(searchres);
                }}
              />
            </div>
          </div>
          <div className="navbar-end max-sm:fixed max-sm:right-4 max-sm:bottom-8">
            <button
              className="me-14  btn btn-primary md:btn-sm btn-lg max-sm:btn-circle max-sm:m-0"
              onClick={() => setopenmodal(!openmodal)}
            >
              <IconContext.Provider
                value={{
                  className:
                    "text-xl text-primary-content max-sm:text-4xl max-sm:",
                }}
              >
                <IoMdAdd />
              </IconContext.Provider>
              <p className="text-primary-content max-sm:hidden">New Item</p>
            </button>
            {openmodal && (
              <Modal
                setopen={setopenmodal}
                valutKey={"vaultEncryptionKey"}
                category={category}
              />
            )}
          </div>
        </div>

        <div className="px-2 py-2 flex justify-evenly space-x-1 h-full overflow-auto">
          <div className=" grow w-[45%] space-y-4 overflow-y-auto ">
            <div className="overflow-auto py-4 px-2">
              <Item
                vault={vault}
                loading={loading}
                category={category}
                favourite={favourite}
                setreload={setreload}
                reload={reload}
                setcurrent={setcurrent}
                current={current}
                searchres={searchres}
                search={search}
              />
            </div>
          </div>
          <div className="divider divider-horizontal max-md:hidden"></div>
          <div className="grow w-[55%] h-full px-14 py-12  max-md:hidden">
            <DisplayItem
              current={current}
              setcurrent={setcurrent}
              vault={vault}
              secKey={secKey.secretKey}
              setreload={setreload}
              reload={reload}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
