"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      setError("Please complete all input fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
  };
  try{
    
  }catch{

  }

  return (
    <div
      className="hero min-h-screen"
      style={{ backgroundImage: "url(https://img.daisyui.com/images/stock/photo-1507358522600-9f71e620c44e.webp)" }}
    >
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="card bg-base-100 bg-opacity-50 w-full max-w-sm shrink-0 shadow-2xl m-56 border-1">
          <form className="card-body" onSubmit={submit}>
            <h1 className="text-center text-3xl font-bold pb-5 text-black">Register</h1>

            {error && <p className="text-red-500 text-center">{error}</p>}
            
            {/* //Username */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-black">Username</span>
              </label>
              <input onChange={(e) => setName(e.target.value)} type="text" placeholder="Username" className="input input-bordered" required />
            </div>

            {/* //email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-black">Email</span>
              </label>
              <input onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="input input-bordered" required />
            </div>

            {/* //password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-black">Password</span>
              </label>
              <input onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="input input-bordered" required />
            </div>

            {/* //confirmPassword */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-black">Confirm Password</span>
              </label>
              <input onChange={(e) => setConfirmPassword(e.target.value)} type="password" placeholder="Confirm Password" className="input input-bordered" required />
            </div>

            <div className="form-control">
              <label className="label pt-4">
                <input type="checkbox" /> <span className="label-text-alt text-black">Remember me</span>
                <a href="#" className="label-text-alt link link-hover text-black">Forgot password?</a>
              </label>
            </div>

            <div className="form-control mt-6">
              <button type="submit" className="btn glass text-black">Sign up</button>
            </div>

            <h3 className="text-center label-text-alt py-2">
              Already have an account? <Link href="/Register" className="font-bold ps-2 text-black">Login</Link>
            </h3>
          </form>
        </div>
      </div>
    </div>
  );
}