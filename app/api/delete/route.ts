import { getServerSession } from "next-auth";
import { options } from "../auth/[...nextauth]/options";
import User from "@/models/userModel";

export async function DELETE(){
    const session = await getServerSession(options);
    if (!session) return new Response("error", { status: 500 });
    try {
        await User.deleteOne({username:session.user?.email});
        return new Response("sucess");
    } catch (error) {
        return new Response("error", { status: 500 });
    }
}