"use client"
import styles from './login.module.css';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useState, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import  { loginSchema} from "@/server/validation/login";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Resolver } from "react-hook-form";


type FormValues = z.infer<typeof loginSchema>;


export default function Login() {
  const [ServerError,setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const router = useRouter();

  const {register, handleSubmit, formState: {errors}} = useForm<FormValues>({
    resolver: zodResolver(loginSchema) as unknown as Resolver<FormValues>,
    defaultValues :{username : "", password : ""}
  });

  const onSubmit = (values: FormValues) =>{
    setServerError(null);
    startTransition(async() =>{
      const res = await signIn("credentials",{
        redirect: false,
        username : values.username,
        password : values.password,
        callbackUrl : searchParams.get("callbackUrl") || "/dashboard",
      })
      if (!res){
        setServerError("No response from server");
        return;
      }
      if (res.error){
        setServerError("Invalid credentials");
        return;
      }
      router.replace(res.url || "/dashboard");
      router.refresh();

    })
  }
  return (
    <div className={styles.container}>
      <h1>Sigin in</h1>
      <form className={styles.boxForm} onSubmit={handleSubmit(onSubmit)}>
        <div className={styles.boxField}>
          <label htmlFor="username">Username</label>
          <input type="text" placeholder='username'  {...register("username")}/>
        </div>

        <div className={styles.boxField}>
          <label htmlFor="password">Password</label>
          <input type="password" placeholder='password'  {...register("password")} />
        </div>

        <button type="submit" className={`${styles.btn} ${styles.btnLogin}`}>{isPending ? "Login in..." : "Login in"}</button>

        <div>Ou</div>

        <button  type="button" className={`${styles.btn} ${styles.btnGoogle}`} onClick={() => signIn("google", { redirectTo: "/dashboard" })}>Connecte with Google</button>


      </form>

    </div>
  )
}