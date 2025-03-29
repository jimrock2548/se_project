"use client"

import { useState, useEffect } from "react";

export default function Page() {
  const [datapayment, setDataPayment] = useState([
    {
      user: "Copter",
      room: 123,
      billsnew: 4521.23,
      billsold: 4643.35,
      dateold: "06/11/2568",
      datenew: "06/12/2568",
      old_water_unit: 100,
      old_ele_unit: 400,
      slip: "https://example.com/slip.jpg",
    },
  ]);

  const [roomNumber, setRoomNumber] = useState("");
  const [defaultwater, setDefaultWater] = useState(18);
  const [defaultelectricity, setDefaultElectricity] = useState(8);
  const [defaultnet, setDefaultNet] = useState(200);
  const [defaultrent, setDefaultRent] = useState(3000);
  const [newwater, setNewWater] = useState("0");
  const [newelectricity, setNewElectricity] = useState("0");
  const [totalall, setTotalAll] = useState("-");

  useEffect(() => {
    if (!roomNumber || !newwater || !newelectricity) {
      setTotalAll("-");
      return;
    }

    const selectedRoom = datapayment.find((d) => d.room === Number(roomNumber));

    if (!selectedRoom || !selectedRoom.old_water_unit || !selectedRoom.old_ele_unit) {
      setTotalAll("-");
      return;
    }

    const W = parseFloat(newwater) || 0;
    const E = parseFloat(newelectricity) || 0;
    const total_water = (W - selectedRoom.old_water_unit) * defaultwater;
    const total_ele = Math.abs(E - selectedRoom.old_ele_unit) * defaultelectricity;
    const alltotal = total_water + total_ele + defaultnet + defaultrent;

    setTotalAll(alltotal.toFixed(2));
  }, [newwater, newelectricity, roomNumber, defaultwater, defaultelectricity, defaultnet, defaultrent]);

  const calculateRent = () => {
    if (!roomNumber) {
      alert("กรุณาระบุหมายเลขห้อง");
      return;
    }

    const existingRoom = datapayment.find((d) => d.room === Number(roomNumber));
    if (!existingRoom) {
      alert("ไม่พบข้อมูลหมายเลขห้อง");
      return;
    }

    if (!newwater || !newelectricity) {
      alert("ข้อมูลหน่วยน้ำหรือไฟฟ้าไม่ครบถ้วน");
      return;
    }

    const W = parseFloat(newwater) || 0;
    const E = parseFloat(newelectricity) || 0;
    const total_water = (W - existingRoom.old_water_unit) * defaultwater;
    const total_ele = Math.abs(E - existingRoom.old_ele_unit) * defaultelectricity;
    const alltotal = total_water + total_ele + defaultnet + defaultrent;

    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, "0")}/${(today.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${today.getFullYear() + 543}`;

    const newBill = {
      user: "ผู้เช่าห้อง " + roomNumber,
      room: Number(roomNumber),
      billsnew: alltotal,
      billsold: existingRoom.billsnew || 0,
      dateold: existingRoom.datenew || "",
      datenew: formattedDate,
      old_water_unit: W,
      old_ele_unit: E,
      slip: "",
    };

    setDataPayment([newBill, ...datapayment]);
    setRoomNumber("");
    setNewWater("0");
    setNewElectricity("0");
    setTotalAll("-");
    alert("เพิ่มใบเสร็จใหม่เรียบร้อย");
  };


  return (
    <div className="pt-16 px-6 min-h-screen">
      <div className="flex flex-wrap md:flex-nowrap space-y-4 md:space-y-0 md:space-x-4">
        {/* Bill form card */}
        <div className="md:col-span-2 p-6 rounded-lg shadow-2xl text-base-content w-full ">
          <h1 className="text-4xl font-bold text-base-content mb-6">กรอกแบบฟอร์มใบชำระเงิน</h1>
          <div className="mb-4 ">
            <fieldset className="fieldset pr-4">
              <legend className="fieldset-legend">หมายเลขห้อง</legend>
              <input
                type="number"
                className="input"
                placeholder="ใส่เลขที่ห้องตรงนี้..."
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
              />
            </fieldset>
          </div>
          <div className="flex">
            <fieldset className="fieldset pr-4">
              <legend className="fieldset-legend">ค่าไฟฟ้า : ราคาต่อหน่วย</legend>
              <input
                type="number"
                className="input"
                value={defaultelectricity}
                onChange={(e) => setDefaultElectricity(Number(e.target.value))}
              />
            </fieldset>

            <fieldset className="fieldset pr-4">
              <legend className="fieldset-legend">ค่าไฟฟ้า : จำนวนหน่วย</legend>
              <input className="input" value={newelectricity} onChange={(e) => setNewElectricity(e.target.value)} />
            </fieldset>
          </div>
          <div className="flex">
            <fieldset className="fieldset pr-4">
              <legend className="fieldset-legend">ค่าน้ำ : ราคาต่อหน่วย</legend>
              <input
                type="number"
                className="input"
                value={defaultwater}
                onChange={(e) => setDefaultWater(Number(e.target.value))}
              />
            </fieldset>

            <fieldset className="fieldset pr-4">
              <legend className="fieldset-legend">ค่าน้ำ : จำนวนหน่วย</legend>
              <input className="input" value={newwater} onChange={(e) => setNewWater(e.target.value)} />
            </fieldset>
          </div>
          <div className="flex">
            <fieldset className="fieldset pr-4">
              <legend className="fieldset-legend">ค่าอินเตอร์เน็ต</legend>
              <input
                type="number"
                className="input"
                value={defaultnet}
                onChange={(e) => setDefaultNet(Number(e.target.value))}
              />
            </fieldset>

            <fieldset className="fieldset pr-4">
              <legend className="fieldset-legend">ค่าหอพัก</legend>
              <input
                type="number"
                className="input"
                value={defaultrent}
                onChange={(e) => setDefaultRent(Number(e.target.value))}
              />
            </fieldset>
          </div>
          <div className="mb-4 ">
            <fieldset className="fieldset pr-4">
              <legend className="fieldset-legend">ราคารวมทั้งหมด</legend>
              <input type="text" className="input" value={totalall} readOnly />
            </fieldset>
          </div>
          <div className="pb-7">
            <button className="btn btn-primary" onClick={calculateRent}>
              เสร็จสิ้น
            </button>
          </div>
        </div>

        <div className="card-body shadow-2xl w-4xl rounded-lg">
          <div className="flex items-center rounded-lg">
            <div className="text-4xl font-bold text-base-content mb-6">รายการใบชำระ</div>
          </div>
          <div className="overflow-y-scroll h-96">
            {datapayment.map((dataroom, index) => (
              <div key={index} tabIndex={0} className="collapse collapse-plus bg-base-100 border-base-300 border">
                <div className="collapse-title font-semibold">
                  User : {dataroom.user} ({dataroom.room})
                  {dataroom.slip && <div aria-label="success" className="status status-success"></div>}
                </div>
                <div className="collapse-content text-sm">
                  รายการใบชำระค้าง: <br />- {dataroom.billsnew} บาท ({dataroom.datenew}) <br />
                  {dataroom.billsold > 0 && `- ${dataroom.billsold} บาท (${dataroom.dateold})`}
                  <br />
                  {dataroom.slip ? (
                    <img
                      src={dataroom.slip || "/placeholder.svg"}
                      alt="ใบเสร็จ"
                      className="w-64 h-auto rounded-lg mt-2"
                    />
                  ) : (
                    <p className="text-gray-500">ไม่มีภาพใบเสร็จ</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

