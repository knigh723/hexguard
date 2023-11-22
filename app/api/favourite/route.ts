import ConnectToDB from "@/utils/db";
import User from "@/models/userModel";
import { options } from "../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";

export async function PATCH(req:Request, res:Response) {
    const session = await getServerSession(options);
    if (!session) return new Response("error", { status: 500 });
    const body = await req.json();
    try {
        await ConnectToDB();
        const id = body.id;
        await User.updateOne(
            {
                username:session?.user?.email,
                vault:{$elemMatch:{_id:id}}
            },{
                $set:{"vault.$.favourite":body.value}
            }
        )
        return new Response("success");
    } catch (error) {
        return new Response("error",{status:500});
    }
}