import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { options } from "@/app/api/auth/[...nextauth]/options";
import Item from "@/models/itemModel";
import User from "@/models/userModel";
import ConnectToDB from "@/utils/db";

export async function GET(request: NextRequest) {
  const session = await getServerSession(options);
  if (!session) return new Response("error", { status: 500 });
  try {
    await ConnectToDB();
    const items = await User.findOne({ id: session?.user?.id });
    return new Response(JSON.stringify(items.vault));
  } catch (error) {
    console.log(error);
    return new Response("error", { status: 500 });
  }
}

export async function POST(req: Request, res: Response) {
  const session = await getServerSession(options);
  if (!session) return new Response("error", { status: 500 });
  try {
    const body = await req.json();

    await ConnectToDB();
    const item = new Item({
      name: body.name,
      favourite: false,
      organization: body.organization,
      notes: body.notes,
      login: {
        username: body.username,
        password: body.password,
        uri: body.website,
      },

    });

    await User.findOneAndUpdate(
      { username: session?.user?.email },
      { $push: { vault: item } },
      { new: true, runValidators: true }
    );
    return new Response("success");
  } catch (error) {
    console.log(error);
    return new Response("error", { status: 500 });
  }
}

export async function PATCH(req: Request, res: Response) {
  const session = await getServerSession(options);
  if (!session) return new Response("error", { status: 500 });
  try {
    const body = await req.json();
    await ConnectToDB();
    const updateditem = new Item({ ...body, updatedDate: Date() });

    await User.updateOne(
      {
        username: session?.user?.email,
        vault: { $elemMatch: { _id: updateditem } },
      },
      { $set: { "vault.$.login": updateditem.login } }
    );
    await User.updateOne(
      {
        username: session?.user?.email,
        vault: { $elemMatch: { _id: updateditem } },
      },
      { $set: { "vault.$.updatedDate": updateditem.updatedDate } }
    );

    return new Response("success");
  } catch (error) {
    console.log(error);
    return new Response("error", { status: 500 });
  }
}

export async function DELETE(req: Request, res:Response){
  const session = await getServerSession(options);
  if(!session) return new Response("error", { status:500})

  try {
    const request = await req.json();
    await ConnectToDB();
    const id= request.id;
    await User.updateOne({username:session?.user?.email},{$pull:{vault:{_id:id}}})
    return new Response("success");
  } catch (error) {
    return new Response("error", { status:500});
  }
}