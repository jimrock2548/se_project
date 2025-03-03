export default function Home() {
  return (
    <>
      <div
        className="hero min-h-screen"
        style={{ backgroundImage: "url(https://img.daisyui.com/images/stock/photo-1507358522600-9f71e620c44e.webp)" }}
      >
        <div className="hero-content flex-col lg:flex-row-reverse">
          <div className="card bg-base-100 bg-opacity-50 w-full max-w-sm shrink-0 shadow-2xl m-56 border-1">
            <form className="card-body">
              <div className="form-control">
                <h1 className="text-center text-3xl font-bold pb-5 text-black">Login</h1>
                <label className="label">
                  <span className="label-text text-black">Email</span>
                </label>
                <input type="email" placeholder="Email / Username" className="input input-bordered" required />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-black">Password</span>
                </label>
                <input type="password" placeholder="password" className="input input-bordered" required />
                <label className="label pt-4">
                  <label className="label-text-alt text-black">
                    <input type="checkbox"/> Remember me
                  </label>
                  <a href="#" className="label-text-alt link link-hover text-black">Forgot password?</a>
                </label>
              </div>
              <div className="form-control mt-6">
                <button className="btn glass text-black">Login</button>
              </div>
              <div className="text-center label-text-alt py-2">
                <h3 className=" text-black">
                  Don't have an account?
                  <a href="/Register" className="font-bold text-black ps-1">Register</a>
                </h3>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}