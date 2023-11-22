import ConnectToDB from "@/utils/db";
import User from "@/models/userModel";

let requestparams:{
  username:string,
  id:string,
  AccountUnlockKey?:string,
  type:string,
}

export async function POST(request: Request) {
  await ConnectToDB();
  try {
    requestparams = await request.json();
    
    const res = await User.findOne({ username: requestparams.username });
    if (res) {
      return new Response(JSON.stringify({"error":"user already exists!"}), { status: 404 });
    } else {
      const user = new User({
        username: requestparams.username,
        password: requestparams.type != "oauth"?requestparams.AccountUnlockKey:null,
        id:requestparams.id
      });
      const doc: typeof User = await user.save();
      if (doc === user) {
        return new Response(JSON.stringify({ status: "ok" }), {
          status: 200,
        });
      }

      return new Response(JSON.stringify({ error: "something went wrong!" }), {
        status: 400,
      });
    }
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error:"Something went wrong!"}), {
      status: 500,
    });
  }
}
