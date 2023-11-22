import Image from "next/image";
import itemprofile from "@/assets/icons/itemprofile.svg";
import blankstar from "@/assets/icons/blankstar.svg";
import star from "@/assets/icons/star.svg";
import {useState } from "react";

export default function Item(props) {
  let vault:Array<Object>;

  const [current, setcurrent] = useState(props.vault[0]?._id);
  const [fav,setfav] = useState(props.favourite);

  if(props.searchres.length > 0){
    vault = props.searchres;
  }
  if(props.searchres.length == 0 && props.search ){
    return <></>
  }
  if(!props.search) {
    vault = props.vault
  }; 

  function getdomain(fullurl: string) {
    try {
      if (fullurl) {
        const url = new URL(fullurl);   
        return `https://icon.horse/icon/${url.hostname.replace('www.','')}`;
      }
      return itemprofile
    } catch (error) {
      return itemprofile

    }
   
  }
  if(props.loading){
    return (
    <div className="flex justify-center items-center">
      <span className="loading loading-spinner w-10"></span>
    </div>)
  }
  return (
    
    <div className={"grid gap-4"}>
      
      {vault.map((item, key) => {
        if(props.favourite){
          if(item.favourite == true && item.organization === props.category){
          // console.log(true);
        return (          
          <div
            key={key}
            className={
              "flex space-x-4  px-4 py-2 rounded-lg shadow hover:bg-primary-focus hover:text-primary-content  active:scale-95 transition-all cursor-pointer" +
              " " +
              (current === item?._id ? "bg-primary text-primary-content" : "")
            }
            onClick={() => {
              setcurrent(item?._id);
              props.setcurrent(item?._id);
            }}
          >
            <div className="bg-slate-100 items-center flex w-12 justify-center rounded-lg">
              <Image
                src={getdomain(item?.login?.uri)}
                alt="logo"
                height={40}
                width={40}
              />
            </div>
            <div className="grow">
              <div className=" font-semibold">{item?.name}</div>
              <div>{item?.login?.username}</div>
            </div>
            
          </div>
        )}
        else{
          return (<></>);
        };
      }
      else{
        // console.log(false);
        if(item.organization === props.category){
        return (     

          <div
            key={key}
            className={
              "flex space-x-4  px-4 py-2 rounded-lg shadow hover:bg-primary-focus hover:text-primary-content  active:scale-95 transition-all cursor-pointer" +
              " " +
              (current === item?._id ? "bg-primary text-primary-content" : "")
            }
            onClick={() => {
              setcurrent(item?._id);
              props.setcurrent(item?._id);
            }}
          >
            <div className="bg-slate-100 items-center flex w-12 justify-center rounded-lg">
              <Image
                src={getdomain(item?.login?.uri)}
                alt="logo"
                height={40}
                width={40}
              />
            </div>
            <div className="grow">
              <div className=" font-semibold">{item?.name}</div>
              <div>{item?.login?.username}</div>
            </div>
            
            <button onClick={async ()=>{
              const response = await fetch('/api/favourite',{
                method:'PATCH',
                headers:{'Content-Type': 'application/json'},
                body:JSON.stringify({id:item._id,value:!fav})
              })
              if(!response.ok){
                alert("Something went wrong");
              }
              setfav(!fav);
              props.setreload(!props.reload);
              props.setcurrent(item?._id);


            }} className=" hover:scale-110">
              <Image
                src={item.favourite ? star : blankstar}
                alt="star"
                width={30}
                height={30}
              />
              </button>
            
          </div>
        )}
      }
      })
    }
    </div>
  )
}
