import filetray from "@/assets/icons/file-tray.svg"
import star from "@/assets/icons/star.svg"
import home from "@/assets/icons/home.svg"
import work from "@/assets/icons/work.svg"


type item = {
    title:string,
    icon:string,
    link:string,
    id:number
}

export const SidebarItems: item[] = [
    {
        title: "All Items",
        icon: filetray,
        link: "/",
        id:1
    },{
        title: "Favourites",
        icon: star,
        link: "/favourites",
        id:2
    }
]

export const VaultItems: item[] = [
    {
        title:"Personal",
        icon:home,
        link: "/",
        id:3
    },{
        title:"Work",
        icon:work,
        link: "/work",
        id:4
    }
]