import React from 'react'

function page() {
  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-4xl font-bold text-primary mb-6">Report</h1>
      <div className="flex flex-wrap md:flex-nowrap space-y-4 md:space-y-0 md:space-x-4">

        <div className="card bg-base-100 text-primary-content shadow-lg w-full md:w-1/3 min-h-80 relative">
          <div className="card-body">
            <h2 className="card-title text-3xl mb-8 text-base-content">Contact</h2>
          </div>

          <div className="card bg-base-300 m-2">
            <div className="card-body p-4">
              <h2 className="card-title text-2xl text-base-content">user 101</h2>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 text-primary-content shadow-lg w-full md:w-2/3 min-h-80">
          <div className="card-body">
            <h2 className="card-title text-3xl mb-8 text-base-content">User 101</h2>
            <fieldset className="fieldset p-4 bg-base-100 border border-base-300 rounded-box w-64">
              <legend className="fieldset-legend">Options</legend>
              <label className="fieldset-label">
                <input type="checkbox" defaultChecked className="checkbox" />
                รบกวน
              </label>
              <label className="fieldset-label">
                <input type="checkbox" defaultChecked className="checkbox" />
                พฤติกรรมไม่เหมาะสม
              </label>
              <label className="fieldset-label">
                <input type="checkbox" defaultChecked className="checkbox" />
                อื่นๆ
              </label>
            </fieldset>
            
            <h2 className="card-title text-3xl mb-8 text-base-content py-4">Description</h2>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Message here</legend>
              <textarea className="textarea text-base-content h-24" placeholder="|"></textarea>
              <div className="fieldset-label">
              <button class="btn">Medium</button>
              </div>
            </fieldset>
          </div>
        </div>
      </div>
    </div>
  )
}

export default page
