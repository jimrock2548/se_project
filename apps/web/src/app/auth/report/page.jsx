"use client";
import React, { useState } from 'react';

function page() {
  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-4xl font-bold text-base-content mb-6">Report</h1>
      <div className="flex flex-wrap md:flex-nowrap space-y-4 md:space-y-0 md:space-x-4">

        <div className="card bg-base-100 text-primary-content shadow-2xl w-full md:w-1/3 min-h-80 relative">

          <div className="card-body">

            <div className="flex items-center rounded-lg">
              <input type="text" placeholder="Search..." className="input w-full text-base-content px-3" />
              <div className='p-2'>
              <button className='btn rounded-full'>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-base-content" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              </div>
            </div>

            <div className='overflow-y-scroll h-96'>
              <div className='py-1'>
                <div className="bg-base-300 btn w-full p-7">
                  <div className="avatar avatar-offline">
                    <div className="w-9 rounded-full">
                      <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                    </div>
                  </div>
                  <h2 className="card-title text-2xl text-base-content">นาย จุฑาวัชร บุษษะ(302)</h2>
                </div>
              </div>
              <div className='py-1'>
                <div className="bg-base-300 btn w-full p-7">
                  <div className="avatar avatar-online">
                    <div className="w-9 rounded-full">
                      <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                    </div>
                  </div>
                  <h2 className="card-title text-2xl text-base-content">นาย จุฑาวัชร บุษษะ(303)</h2>
                </div>
              </div>
              <div className='py-1'>
                <div className="bg-base-300 btn w-full p-7">
                  <div className="avatar avatar-online">
                    <div className="w-9 rounded-full">
                      <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                    </div>
                  </div>
                  <h2 className="card-title text-2xl text-base-content">user 103(302)</h2>
                </div>
              </div>
              <div className='py-1'>
                <div className="bg-base-300 btn w-full p-7">
                  <div className="avatar avatar-online">
                    <div className="w-9 rounded-full">
                      <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                    </div>
                  </div>
                  <h2 className="card-title text-2xl text-base-content">user 104(302)</h2>
                </div>
              </div>
              <div className='py-1'>
                <div className="bg-base-300 btn w-full p-7">
                  <div className="avatar avatar-online">
                    <div className="w-9 rounded-full">
                      <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                    </div>
                  </div>
                  <h2 className="card-title text-2xl text-base-content">user 101(302)</h2>
                </div>
              </div>
              <div className='py-1'>
                <div className="bg-base-300 btn w-full p-7">
                  <div className="avatar avatar-online">
                    <div className="w-9 rounded-full">
                      <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                    </div>
                  </div>
                  <h2 className="card-title text-2xl text-base-content">user 101(302)</h2>
                </div>
              </div>
              <div className='py-1'>
                <div className="bg-base-300 btn w-full p-7">
                  <div className="avatar avatar-offline">
                    <div className="w-9 rounded-full">
                      <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                    </div>
                  </div>
                  <h2 className="card-title text-2xl text-base-content">user 105(302)</h2>
                </div>
              </div>
              <div className='py-1'>
                <div className="bg-base-300 btn w-full p-7">
                  <div className="avatar avatar-online">
                    <div className="w-9 rounded-full">
                      <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                    </div>
                  </div>
                  <h2 className="card-title text-2xl text-base-content">user 101(302)</h2>
                </div>
              </div>
              <div className='py-1'>
                <div className="bg-base-300 btn w-full p-7">
                  <div className="avatar avatar-offline">
                    <div className="w-9 rounded-full">
                      <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                    </div>
                  </div>
                  <h2 className="card-title text-2xl text-base-content">user 101(302)</h2>
                </div>
              </div>
              <div className='py-1'>
                <div className="bg-base-300 btn w-full p-7">
                  <div className="avatar avatar-online">
                    <div className="w-9 rounded-full">
                      <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                    </div>
                  </div>
                  <h2 className="card-title text-2xl text-base-content">user 101(302)</h2>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 text-primary-content shadow-2xl w-full md:w-2/3 min-h-80">
          <div className="card-body">
            <h2 className="card-title text-3xl mb-5 text-base-content">User 101 :</h2>
            <fieldset className="fieldset p-4 bg-base-100 border border-base-300 rounded-box md:w-80">
              <legend className="fieldset-legend">Options</legend>
              <label className="fieldset-label">
                <input type="radio" name='radio-1' className="checkbox" defaultChecked/>
                รบกวน
              </label>
              <label className="fieldset-label">
                <input type="radio" name='radio-1' className="checkbox"/>
                พฤติกรรมไม่เหมาะสม
              </label>
              <label className="fieldset-label">
                <input type="radio" name='radio-1' className="checkbox"/>
                อื่นๆ
              </label>
            </fieldset>

            <h2 className="card-title text-3xl  text-base-content py-4">Description</h2>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Message here</legend>
              <textarea className="textarea text-base-content h-24 md:w-full" placeholder="|"></textarea>
              <div className="fieldset-label">
                <button className="btn">Submit</button>
              </div>
              <div className='text-red-500 text-lg text-center p-4'>
                *****การรายงานของคุณจะไม่ถูกเปิดเผยว่าคุณเป็นผู้รายงาน******
              </div>
            </fieldset>
          </div>
        </div>
      </div>
    </div>
  )
}

export default page
