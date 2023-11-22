import ConnectToDB from "@/utils/db";
import User from "@/models/userModel";
import { randomUUID } from "crypto";

export async function GET() {
    await ConnectToDB();
  try {
    let id = randomUUID().replace(/-/g, "");
    let res;
    do{
        res = await User.findOne({ id: id })
        id = randomUUID().replace(/-/g, "").toString("hex");
    } while(res)

    return new Response(JSON.stringify({accountid:id}));
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({error:"Something went wrong"},{
        status:400,
    }));
  }
}
