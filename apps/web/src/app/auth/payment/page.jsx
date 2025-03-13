"use client";
import React from 'react';
import Link from "next/link";

const data = [
  {
    room: "123",
    water_fee: {
      before: 120,
      after: 135,
      use: 15,
      pricenum: 10
    },
    electricity_bill: {
      before: 4500,
      after: 4700,
      use: 200,
      pricenum: 5
    },
    internet: 500,
    rent: 3000
  }
];

function RentalBill() {
  const roomdata = data[0];
  const total_waterfee = roomdata.water_fee.use * roomdata.water_fee.pricenum;
  const total_electricitybill = roomdata.electricity_bill.use * roomdata.electricity_bill.pricenum;
  const total_all = total_electricitybill + total_waterfee + roomdata.internet + roomdata.rent;
  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="bg-base-100 md:p-6 p-1 rounded-2xl shadow-2xl md:w-full max-w-7xl">
        <h1 className="text-4xl font-bold text-center mb-4">บิลค่าเช่าห้อง</h1>
        <div className="text-lg text-center font-semibold mb-3">🏠 ห้องที่ : {roomdata.room}</div>
        <div className="text-center mb-4">📅 ประจำเดือน กุมภาพันธ์ 2567</div>

        <div className="border rounded-lg p-4">
          <div className="grid grid-cols-6 gap-2 font-bold border-b pb-2 ">
            <span>รายการ</span>
            <span className="text-center">ครั้งก่อน</span>
            <span className="text-center">ครั้งนี้</span>
            <span className="text-center">จำนวนหน่วยที่ใช้</span>
            <span className="text-right">ราคาต่อหน่วย</span>
            <span className="text-right">รวมเป็นเงิน</span>
          </div>


          {/* ค่าน้ำ */}
          <div className="grid grid-cols-6 gap-2 py-2 border-b">
            <span>🚰ค่าน้ำ</span>
            <span className="text-center">{roomdata.water_fee.before}</span>
            <span className="text-center">{roomdata.water_fee.after}</span>
            <span className="text-center">{roomdata.water_fee.use}</span>
            <span className="text-right">{roomdata.water_fee.pricenum}</span>
            <span className="text-right">{total_waterfee}</span>
          </div>

          {/* ค่าไฟ */}
          <div className="grid grid-cols-6 gap-2 py-2 border-b">
            <span>💡 ค่าไฟ</span>
            <span className="text-center">{roomdata.electricity_bill.before}</span>
            <span className="text-center">{roomdata.electricity_bill.after}</span>
            <span className="text-center">{roomdata.electricity_bill.use}</span>
            <span className="text-right">{roomdata.electricity_bill.pricenum}</span>
            <span className="text-right">{total_electricitybill}</span>
          </div>

          {/* อินเทอร์เน็ต */}
          <div className="grid grid-cols-5 gap-2 py-2 border-b">
            <span>🌐 อินเทอร์เน็ต</span>
            <span className="col-span-3"></span>
            <span className="text-right">{roomdata.internet}</span>
          </div>
          {/* ค่าห้อง */}
          <div className="grid grid-cols-5 gap-2 py-2">
            <span>🏠 ค่าเช่า</span>
            <span className="col-span-3"></span>
            <span className="text-right">{roomdata.rent}</span>
          </div>
        </div>

        {/* รวม */}
        <div className="mt-4 flex justify-between font-bold text-xl border-t pt-4 ">
          <span>💵 รวม :</span>
          <span>{total_all} บาท</span>
        </div>

        {/* ปุ่มเลือกชำระเงิน */}
        <div className="mt-6 text-center">
          <Link href='/auth/choose_payment'>
            <button className="btn btn-primary md:w-56 w-full text-white">เลือกวิธีจ่าย</button>
          </Link>
        </div>

        <div className="md:text-xl text-sm text-center mt-4 text-red-500 p-6">🔔*****ชำระเงินทุกวันที่ 5 ของเดือน*****🔔</div>
      </div>
      
    </div>
  );
}

export default RentalBill;
