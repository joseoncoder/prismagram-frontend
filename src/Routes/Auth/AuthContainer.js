import React, { useState } from "react";
import AuthPresenter from "./AuthPresenter";
import {
  LOG_IN,
  CREATE_ACCNT,
  CONFIRM_SECRET,
  LOCAL_LOG_IN
} from "./AuthQueries";
import useInput from "../../Hooks/useInput";
import { useMutation } from "react-apollo-hooks";
import { toast } from "react-toastify";

export default () => {
  const [action, setAction] = useState("logIn");

  const username = useInput("");
  //   const password = useInput("");
  const firstName = useInput("");
  const lastName = useInput("");
  const email = useInput("");
  const secret = useInput("");

  const [requestSecretMutation] = useMutation(LOG_IN, {
    // update: (_, { data: {requestSecret } }) => {
    //   if(!requestSecret){
    //      toast.error("You don't have an Account yet, Create One.");
    //      setTimeout(() => setAction("signUp"), 2000);
    //   }
    // },
    variables: { email: email.value }
  });

  const [createAccountMutation] = useMutation(CREATE_ACCNT, {
    variables: {
      username: username.value,
      email: email.value,
      firstName: firstName.value,
      lastName: lastName.value
    }
  });

  const [confirmSecretMutation] = useMutation(CONFIRM_SECRET, {
    variables: {
      secret: secret.value,
      email: email.value
    }
  });

  const [localLogiInMutation] = useMutation(LOCAL_LOG_IN);

  const onSubmit = async e => {
    e.preventDefault();

    if (action === "logIn") {
      if (email.value !== "") {
        try {
          const {
            data: { requestSecret }
          } = await requestSecretMutation();

          //19Line과 동일한 기능
          if (!requestSecret) {
            toast.error("You don't have an Account yet, Create One.");
            setTimeout(() => setAction("signUp"), 2500);
          } else {
            toast.success(" CheckYour inbox for your login Secret");
            setAction("confirm");
          }
        } catch {
          toast.error("Can't request secret, try again");
        }
      } else {
        toast.error("Email is required.");
      }
    } else if (action === "signUp") {
      if (
        username.value !== "" &&
        email.value !== "" &&
        firstName.value !== "" &&
        lastName.value !== ""
      ) {
        try {
          const {
            data: { createAccount }
          } = await createAccountMutation();
          console.log(createAccount);
          if (!createAccount) {
            toast.error("Can't create Account");
          } else {
            toast.success("Account created! Log In Now !");
            setTimeout(() => setAction("logIn"), 2500);
          }
        } catch (e) {
          toast.error(e.message.substring(e.message.indexOf(":") + 1));
        }
      } else {
        toast.error("All fields ar required.");
      }
    } else if (action === "confirm") {
      if (secret.value !== "") {
        try {
          const {
            data: { confirmSecret: token }
          } = await confirmSecretMutation();
          if (token !== "" && token !== undefined) {
            localLogiInMutation({ variables: { token } });
          } else {
            throw Error();
          }
        } catch {
          toast.error("Can't confirm Secret, Check again");
        }
      }
    }
  };

  return (
    <AuthPresenter
      setAction={setAction}
      action={action}
      username={username}
      //   password={password}
      firstName={firstName}
      lastName={lastName}
      email={email}
      secret={secret}
      onSubmit={onSubmit}
    />
  );
};
