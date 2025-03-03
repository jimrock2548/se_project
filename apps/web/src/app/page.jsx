import Link from "next/link";

function Page() {
  return (
    <>
      <div className='flex justify-center mt-5'>
        <div className='sm:px-10 md:px-20 lg:px-40'>
          <Link href='/Payment'>
          <button className="flex bg-base-100 flex-col items-center justify-center border-2 border-red-300 rounded-xl text-center p-7 px-20 shadow-lg hover:bg-gradient-to-r hover:from-red-200 hover:to-blue-200 transition duration-300">
            <h1 className="text-lg sm:text-3xl font-bold text-red-500">
              <span className="mr-2"></span>ค่าเช่าห้องพัก
            </h1>
            <h2 className="text-lg sm:text-xl font-bold text-red-500">ยอดค้างชำระรวม</h2>
            <p className="text-2xl sm:text-3xl font-bold text-red-500 my-1">4,000</p>
            <span className="badge badge-error badge-outline text-xs sm:text-sm px-2 py-0.5 mt-1">
              1/2/2567
            </span>
            <span className=" font-bold text-red-500 my-1">(กดปุ่มนี้เพื่อชำระค่าห้องเช่า)</span>
          </button>
          </Link>
        </div>
      </div>

      <div className="flex justify-center mt-5">
        <div role="tablist" className="tabs tabs-lifted w-full max-w-[1800px] mx-auto text-lg pb-32">
          {/* Tab 1 */}
          <input
            type="radio"
            name="my_tabs_2"
            role="tab"
            className="tab text-lg hover:underline hover:text-red-500"
            aria-label="Announcement"
          />
          <div
            role="tabpanel"
            className="tab-content bg-base-100 border-base-300 rounded-box p-6 text-lg shadow-lg"
          >
            <div className='mb-4 flex items-center text-base-content'>
              <span className="mr-2">🎄</span>Merry Christmas: มีขนมแจกฟรีที่ lobby ช่วยกินหน่อย
            </div>
            
          </div>

          {/* Tab 2 */}
          <input
            type="radio"
            name="my_tabs_2"
            role="tab"
            className="tab text-lg hover:underline hover:text-red-500"
            aria-label="Tab 2"
            defaultChecked
          />
          <div
            role="tabpanel"
            className="tab-content bg-base-100 text-base-content border-base-300 rounded-box p-6 text-lg shadow-lg"
          >
            📝 รายละเอียดเพิ่มเติมใน Tab 2
          </div>

          {/* Tab 3 */}
          <input
            type="radio"
            name="my_tabs_2"
            role="tab"
            className="tab text-lg hover:underline hover:text-red-500"
            aria-label="Tab 3"
          />
          <div
            role="tabpanel"
            className="tab-content bg-base-100 text-base-content border-base-300 rounded-box p-6 text-lg shadow-lg"
          >
            📦 ข้อมูล Tab 3
          </div>
        </div>
      </div>
    </>
  );
}

export default Page;