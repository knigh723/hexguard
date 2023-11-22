import { genAccountUnlockKey, genSecretKey } from "@/utils/auk";

onmessage = async function (message) {
  if (message.data.action == "login") {
    try {
      const AccountUnlockKey = await genAccountUnlockKey(
        message.data.password,
        message.data.username
      );
      if (!AccountUnlockKey)
        throw new Error("Something went wrong!");

      postMessage({ AccountUnlockKey:AccountUnlockKey.toString('hex')});
    } catch (error) {
      postMessage({ error: error.message });
    }
  } else if(message.data.action == "register") {
    try {
      const secretKey = await genSecretKey();
      if (!secretKey) throw new Error("Unable to generate secret key");
      
      const AccountUnlockKey = await genAccountUnlockKey(
        message.data.password + secretKey[0],
        message.data.username
      );
      if (!AccountUnlockKey)
        throw new Error("Something went wrong!");
      
      postMessage({ AccountUnlockKey:AccountUnlockKey.toString('hex'), secretKey });
    } catch (error) {
      postMessage({ error: error.message });
    }
  }else{
    try {
      const secretKey = await genSecretKey(message.data.id);
      if (!secretKey) throw new Error("Unable to generate secret key");
      console.log({secretKey})
      postMessage({secretKey});
    } catch (error) {
      postMessage({ error: error.message });

    }
  }
};
