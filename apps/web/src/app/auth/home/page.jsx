import Link from "next/link";

const dataannouncement = [
  { title: "Merry Christmas", date: "06/12/2024", message: "มีขนมแจกฟรีที่ lobby ช่วยกินหน่อย", },
  { title: "ไฟชั้น 2 เสีย", date: "07/02/2024", message: "กลับไปอยู่ห้องนะ ช่างกำลังจะมา", },
  { title: "Merry Christmas", date: "06/12/2024", message: "มีขนมแจกฟรีที่ lobby ช่วยกินหน่อย", },
  { title: "ไฟชั้น 2 เสีย", date: "07/02/2024", message: "กลับไปอยู่ห้องนะ ช่างกำลังจะมา", },
  { title: "Merry Christmas", date: "06/12/2024", message: "มีขนมแจกฟรีที่ lobby ช่วยกินหน่อย", },
  { title: "ไฟชั้น 2 เสีย", date: "07/02/2024", message: "กลับไปอยู่ห้องนะ ช่างกำลังจะมา", },
  { title: "Merry Christmas", date: "06/12/2024", message: "มีขนมแจกฟรีที่ lobby ช่วยกินหน่อย", },
  { title: "ไฟชั้น 2 เสีย", date: "07/02/2024", message: "กลับไปอยู่ห้องนะ ช่างกำลังจะมา", },
  { title: "Merry Christmas", date: "06/12/2024", message: "มีขนมแจกฟรีที่ lobby ช่วยกินหน่อย", },
  { title: "ไฟชั้น 2 เสีย", date: "07/02/2024", message: "กลับไปอยู่ห้องนะ ช่างกำลังจะมา", },
  { title: "Merry Christmas", date: "06/12/2024", message: "มีขนมแจกฟรีที่ lobby ช่วยกินหน่อย", },
  { title: "ไฟชั้น 2 เสีย", date: "07/02/2024", message: "กลับไปอยู่ห้องนะ ช่างกำลังจะมา", },
  { title: "Merry Christmas", date: "06/12/2024", message: "มีขนมแจกฟรีที่ lobby ช่วยกินหน่อย", },
  { title: "ไฟชั้น 2 เสีย", date: "07/02/2024", message: "กลับไปอยู่ห้องนะ ช่างกำลังจะมา", },
];

function Page() {
  return (
    <>
    
      <div className="md:p-16 p-1 min-h-screen">
        <div className="flex flex-wrap md:flex-nowrap space-y-4 md:space-y-0 md:space-x-4">

          {/* Announcement card */}
          <div className="md:col-span-2 p-6 rounded-lg shadow-2xl text-base-content w-full">
            <h1 className="text-4xl font-bold text-base-content mb-8">ประกาศ</h1>
            {/* Announcements List */}
            <div className="overflow-y-scroll h-96 ">
              {dataannouncement.map((announcement, index) => (
                <div key={index} className="mb-2 border-l-4 border-red-500 pl-2">
                  <h2 className="text-lg font-semibold">{announcement.title}{" "}<span className="text-sm">({announcement.date})</span></h2>
                  <p className="text-sm">: {announcement.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Report card */}
          <div className="card-body shadow-2xl w-7xl rounded-lg">
            <div className="flex items-center rounded-lg">
              <div className="text-4xl font-bold text-base-content mb-6">แจ้งชำระค่าเช่า</div>
            </div>
            <div className="card bg-base-100 card-md shadow-sm">
              <div className="card-body w-full">
                <div className="text-xl"><b>ชื่อ:</b> นาย จุฑาวัชร บุษษะ</div>
                <div className="text-lg"><b>เลขห้อง:</b> 123</div>
                <div className="text-lg"><b>ราคารวม:</b> 4,650 บาท</div>
                <p className="text-red-500">****โปรดชำระเงินภายในวันที่ 5 ของเดือนถัดไป เวลา 21:00 น. ล่าช้าปรับครั้งละ 50 บาท****</p>
                <Link href='/auth/payment' className="link link-hover">ข้อมูลเพิ่มเติม</Link>
                <div className="justify-end card-actions">
                
                    <Link className="btn btn-outline btn-primary" href='/auth/choose_payment'>ชำระเงิน</Link>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Page;