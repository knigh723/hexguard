import {model,models} from "mongoose";
import ItemSchema from  "./itemSchema"

const Item = models.Item || model<typeof ItemSchema>("Item",ItemSchema);
export default Item;